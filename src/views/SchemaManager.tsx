/* eslint-disable no-alert */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, NavItem, Panel, Checkbox } from 'react-bootstrap';
import { ExpandMore, ChevronRight, Fort } from '@mui/icons-material';
import { TreeView, TreeItem } from '@mui/lab';
import { Box } from '@mui/material';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { settingsFromApi } from './Settings';
import { responseResult, UploadSchemaFile } from '../common/DBUtility';
import Loading from '../components/CaseRegistration/Loading';
import { Const } from '../common/Const';
import './SchemaManager.css';
import SchemaTree, {
  SCHEMA_TYPE,
  treeSchema,
} from '../components/Schemamanager/SchemaTree';

import { JesgoDocumentSchema } from '../store/schemaDataReducer';
import {
  parentSchemaList,
  GetSchemaInfo,
  GetParentSchemas,
  schemaWithValid,
  storeSchemaInfo,
} from '../components/CaseRegistration/SchemaUtility';
import lodash from 'lodash';
import { useDispatch } from 'react-redux';

type settings = {
  facility_name: string;
};

const SchemaManager = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('display_name');
  const [facilityName, setFacilityName] = useState('');
  const [settingJson, setSettingJson] = useState<settings>({
    facility_name: '',
  });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [schemaUploadResponse, setSchemaUploadResponse] =
    useState<responseResult>({ message: '', resCode: undefined });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [selectedSchemaInfo, setSelectedSchemaInfo] =
    useState<JesgoDocumentSchema>();
  const [selectedSchemaParentInfo, setSelectedSchemaParentInfo] =
    useState<parentSchemaList>();
  const [childSchemaList, setChildSchemaList] = useState<schemaWithValid[]>([]);
  const [subSchemaList, setSubSchemaList] = useState<schemaWithValid[]>([]);
  const [tree, setTree] = useState<treeSchema[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const f = async () => {
      // 設定情報取得APIを呼ぶ
      const returnApiObject = await apiAccess(METHOD_TYPE.GET, `getSettings`);

      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = returnApiObject.body as settingsFromApi;
        const setting: settings = {
          facility_name: returned.facility_name,
        };
        setFacilityName(returned.facility_name);
        setSettingJson(setting);
      } else {
        navigate('/login');
      }

      // スキーマツリーを取得する
      const treeApiObject = await apiAccess(METHOD_TYPE.GET, `gettree`);

      if (treeApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = treeApiObject.body as treeSchema[];
        setTree(returned);
      } else {
        navigate('/login');
      }

      // スキーマ取得処理
      await storeSchemaInfo(dispatch);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  // 選択中のスキーマが変更されたとき
  useEffect(() => {
    const schema = GetSchemaInfo(Number(selectedSchema));
    console.log('selectchange');
    console.log(schema);
    if (schema !== undefined) {
      setSelectedSchemaInfo(schema);

      // サブスキーマ、子スキーマも更新する
      // subschema
      // 現在のサブスキーマリストは全て有効なので、後ろに初期サブスキーマを合体させ重複を削除する
      const tempSubSchemaList = lodash.union(
        schema.subschema,
        schema.subschema_default
      );
      const currentSubSchemaList: schemaWithValid[] = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tempSubSchemaList.length; i++) {
        // 元々の現在のサブスキーマリストに含まれていた部分は有効扱いにする
        currentSubSchemaList.push({
          valid: i <= schema.subschema.length,
          schema: GetSchemaInfo(tempSubSchemaList[i])!,
        });
      }
      setSubSchemaList(currentSubSchemaList);

      // childschema
      // 現在の子スキーマリストは全て有効なので、後ろに初期子スキーマを合体させ重複を削除する
      const tempChildSchemaList = lodash.union(
        schema.child_schema,
        schema.child_schema_default
      );
      const currentChildSchemaList: schemaWithValid[] = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tempChildSchemaList.length; i++) {
        // 元々の現在のサブスキーマリストに含まれていた部分は有効扱いにする
        currentChildSchemaList.push({
          valid: i + 1 <= schema.child_schema.length,
          schema: GetSchemaInfo(tempChildSchemaList[i])!,
        });
      }
      setChildSchemaList(currentChildSchemaList);
    }

    setSelectedSchemaParentInfo(GetParentSchemas(Number(selectedSchema)));
  }, [selectedSchema]);

  const clickCancel = () => {
    navigate('/Patients');
  };

  // 実際のアップロードボタンへの参照
  const refBtnUpload = useRef<HTMLInputElement>(null);

  // スキーマアップロードボタン押下
  const schemaUpload = () => {
    const button = refBtnUpload.current;
    button?.click();
  };

  // ファイル選択
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const file = fileList[0];
      const fileName: string = file.name.toLocaleLowerCase();
      if (!fileName.endsWith('.zip') && !fileName.endsWith('.json')) {
        alert('ZIPファイルもしくはJSONファイルを選択してください');
        return;
      }

      setIsLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      UploadSchemaFile(file, setSchemaUploadResponse, setErrorMessages);
    }
  };

  // ツリーアイテムクリック
  const handleTreeItemClick = useCallback(
    (
      event:
        | React.MouseEvent<HTMLLIElement, MouseEvent>
        | React.MouseEvent<HTMLDivElement, MouseEvent>,
      v = ''
    ): void => {
      event.stopPropagation();

      if (event.target instanceof Element) {
        const isIcon = !!event.target.closest('.MuiTreeItem-iconContainer');
        // If the tree item has children the icon only collapse/expand
        if (isIcon) {
          return;
        }
      }
      setSelectedSchema(v as string);
      event.preventDefault();
      // More logic to run on item click
    },
    []
  );

  // チェックボックス分岐用定数
  const CHECK_TYPE = {
    SUBSCHEMA: 0,
    CHILDSCHEMA: 1,
  };

  const RELATION_TYPE = {
    PARENT: 0,
    CHILD: 1,
  };
  // チェックボックス状態変更
  const handleCheckClick = (relation: number, type: number, v = ''): void => {
    // 親スキーマか子スキーマのどっちかを分ける
    if (relation === RELATION_TYPE.PARENT) {
      const copyParentInfo = lodash.cloneDeep(selectedSchemaParentInfo);
      // undefinedチェック
      if (copyParentInfo) {
        // サブスキーマの場合
        if (type === CHECK_TYPE.SUBSCHEMA && copyParentInfo.fromSubSchema) {
          // eslint-disable-next-line
          for (let i = 0; i < copyParentInfo.fromSubSchema.length; i++) {
            const obj = copyParentInfo.fromSubSchema[i];
            if (obj.schema.schema_id === Number(v)) {
              obj.valid = !obj.valid;
            }
          }
        }
        // 子スキーマの場合
        else if (
          type === CHECK_TYPE.CHILDSCHEMA &&
          copyParentInfo.fromChildSchema
        ) {
          // eslint-disable-next-line
          for (let i = 0; i < copyParentInfo.fromChildSchema.length; i++) {
            const obj = copyParentInfo.fromChildSchema[i];
            if (obj.schema.schema_id === Number(v)) {
              obj.valid = !obj.valid;
            }
          }
        }
        setSelectedSchemaParentInfo(copyParentInfo);
      }
    } else if (relation === RELATION_TYPE.CHILD) {
      // サブスキーマの場合
      if (type === CHECK_TYPE.SUBSCHEMA) {
        const copySchemaList = lodash.cloneDeep(subSchemaList);
        // eslint-disable-next-line
        for (let i = 0; i < copySchemaList.length; i++) {
          const obj = copySchemaList[i];
          if (obj.schema.schema_id === Number(v)) {
            obj.valid = !obj.valid;
          }
        }
        setSubSchemaList(copySchemaList);
      }
      // 子スキーマの場合
      else if (type === CHECK_TYPE.CHILDSCHEMA) {
        const copySchemaList = lodash.cloneDeep(childSchemaList);
        // eslint-disable-next-line
        for (let i = 0; i < copySchemaList.length; i++) {
          const obj = copySchemaList[i];
          if (obj.schema.schema_id === Number(v)) {
            obj.valid = !obj.valid;
          }
        }
        setChildSchemaList(copySchemaList);
      }
    }
  };

  // 上下移動分岐用定数
  const ARROW_TYPE = {
    UP: 0,
    DOWN: 1,
  };
  // 上下移動用
  const handleArrowClick = (arrow: number, type: number, v = ''): void => {
    if (type === SCHEMA_TYPE.SUBSCHEMA) {
      const copySchemaList = lodash.cloneDeep(subSchemaList);
      const targetIndex = copySchemaList.findIndex(
        (s) => s.schema.schema_id === Number(v)
      );
      if (arrow === ARROW_TYPE.UP && targetIndex !== 0) {
        // バッファを使って配列の位置を入れ替える
        const temp = copySchemaList[targetIndex - 1];
        copySchemaList[targetIndex - 1] = copySchemaList[targetIndex];
        copySchemaList[targetIndex] = temp;
      } else if (
        arrow === ARROW_TYPE.DOWN &&
        targetIndex !== copySchemaList.length - 1
      ) {
        // バッファを使って配列の位置を入れ替える
        const temp = copySchemaList[targetIndex + 1];
        copySchemaList[targetIndex + 1] = copySchemaList[targetIndex];
        copySchemaList[targetIndex] = temp;
      }
      // stateに設定
      setSubSchemaList(copySchemaList);
    } else if (type === SCHEMA_TYPE.CHILDSCHEMA) {
      const copySchemaList = lodash.cloneDeep(childSchemaList);
      const targetIndex = copySchemaList.findIndex(
        (s) => s.schema.schema_id === Number(v)
      );
      if (arrow === ARROW_TYPE.UP && targetIndex !== 0) {
        // バッファを使って配列の位置を入れ替える
        const temp = copySchemaList[targetIndex - 1];
        copySchemaList[targetIndex - 1] = copySchemaList[targetIndex];
        copySchemaList[targetIndex] = temp;
      } else if (
        arrow === ARROW_TYPE.DOWN &&
        targetIndex !== copySchemaList.length - 1
      ) {
        // バッファを使って配列の位置を入れ替える
        const temp = copySchemaList[targetIndex + 1];
        copySchemaList[targetIndex + 1] = copySchemaList[targetIndex];
        copySchemaList[targetIndex] = temp;
      }
      console.log('changed');
      console.log(copySchemaList);
      // stateに設定
      setChildSchemaList(copySchemaList);
    }
  };

  const submitUpdateSchema = async (schemas: JesgoDocumentSchema[]) => {
    console.log('submitscchema');
    const token = localStorage.getItem('token');
    if (token == null) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    // スキーマ更新APIを呼ぶ
    const returnApiObject = await apiAccess(
      METHOD_TYPE.POST,
      `updateSchemas`,
      schemas
    );
    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      // スキーマツリーを取得する
      const treeApiObject = await apiAccess(METHOD_TYPE.GET, `gettree`);

      if (treeApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = treeApiObject.body as treeSchema[];
        setTree(returned);
      } else {
        navigate('/login');
      }

      // スキーマ取得処理
      console.log('schemacheck');
      console.log(GetSchemaInfo(7));
      await storeSchemaInfo(dispatch);
      console.log(GetSchemaInfo(7));

      // eslint-disable-next-line no-alert
      alert('スキーマを更新しました');
    } else {
      // eslint-disable-next-line no-alert
      alert('【エラー】\n設定に失敗しました');
    }
    setIsLoading(false);
  };

  const updateSchema = async () => {
    console.log('updateschema');
    // 更新用スキーマリスト
    const updateSchemaList: JesgoDocumentSchema[] = [];

    // 親スキーマ情報をチェック
    if (selectedSchemaParentInfo !== undefined) {
      // (親から見た)サブスキーマは保留

      // (親から見た)子スキーマ整合性チェック
      const parentFromChildSchema =
        selectedSchemaParentInfo.fromChildSchema ?? [];
      for (let i = 0; i < parentFromChildSchema.length; i++) {
        const parentSchema = parentFromChildSchema[i].schema;
        // 編集後のスキーマに親子関係があり、編集前スキーマに親子関係がない場合
        if (
          parentFromChildSchema[i].valid &&
          !parentSchema.child_schema.includes(Number(selectedSchema))
        ) {
          parentSchema.child_schema.push(Number(selectedSchema));
          updateSchemaList.push(parentSchema);
        }

        // 編集後のスキーマに親子関係がなく、編集前スキーマに親子関係がある場合
        else if (
          !parentFromChildSchema[i].valid &&
          parentSchema.child_schema.includes(Number(selectedSchema))
        ) {
          const targetIndex = parentSchema.child_schema.indexOf(
            Number(selectedSchema)
          );
          parentSchema.child_schema.splice(targetIndex, 1);
          updateSchemaList.push(parentSchema);
        }

        // 編集後、編集前の親子関係が同じなら更新しない
      }
    }

    // 表示中のスキーマの子関係
    const baseSchemaInfo = lodash.cloneDeep(selectedSchemaInfo);
    if (baseSchemaInfo !== undefined) {
      console.log('表示中の子スキーマリスト');
      console.log(childSchemaList);
      let isChange = false;
      // サブスキーマは保留

      // 子スキーマ
      // 編集中の子スキーマのうち有効であるもののみのリストを作る
      const tempChildSchemaList: number[] = [];
      for (let i = 0; i < childSchemaList.length; i++) {
        console.log(childSchemaList[i]);
        if (childSchemaList[i].valid) {
          tempChildSchemaList.push(childSchemaList[i].schema.schema_id);
        }
      }
      // 有効子スキーマリストと編集前のスキーマリストが異なれば更新をかける
      if (!lodash.isEqual(tempChildSchemaList, baseSchemaInfo.child_schema)) {
        baseSchemaInfo.child_schema = tempChildSchemaList;
        isChange = true;
      }

      // 更新があれば変更リストに追加する
      if (isChange) {
        updateSchemaList.push(baseSchemaInfo);
      }
    }

    // POST処理
    await submitUpdateSchema(updateSchemaList);
  };

  useEffect(() => {
    if (schemaUploadResponse.resCode !== undefined) {
      alert(schemaUploadResponse.message);
      setSchemaUploadResponse({ message: '', resCode: undefined });
      setIsLoading(false);

      // アップロード対象ファイルクリア
      if (refBtnUpload.current) {
        refBtnUpload.current.value = '';
      }
    }
  }, [schemaUploadResponse]);

  return (
    <div className="page-area">
      <Navbar collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <img src="./image/logo.png" alt="JESGO" className="img" />
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem className="header-text">スキーマ管理</NavItem>
          </Nav>
          <Nav pullRight>
            <Navbar.Text>{facilityName}</Navbar.Text>
            <NavItem>
              <UserMenu title={userName} i={0} />
            </NavItem>
            <NavItem>
              <SystemMenu title="設定" i={0} />
            </NavItem>
            <Navbar.Text>Ver.{Const.VERSION}</Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="schema-buttons">
        <div className="schema-inner">
          <Button
            bsStyle="success"
            className="normal-button"
            title="スキーマのZIPファイルをアップロードします"
            onClick={schemaUpload}
          >
            スキーマアップロード
          </Button>
          {/* 実際のアップロードボタンは非表示 */}
          <input
            accept=".zip,.json"
            ref={refBtnUpload}
            type="file"
            onChange={onFileSelected}
            style={{ display: 'none' }}
          />
          <Button
            onClick={clickCancel}
            bsStyle="primary"
            className="normal-button"
          >
            リストに戻る
          </Button>
        </div>
      </div>
      <div className="schema-main">
        <div className="schema-tree">
          <TreeView>
            <TreeItem
              nodeId="root"
              label={<Box>JESGOシステム</Box>}
              collapseIcon={<ExpandMore />}
              expandIcon={<ChevronRight />}
            >
              <SchemaTree
                schemas={tree}
                handleTreeItemClick={handleTreeItemClick}
                schemaType={SCHEMA_TYPE.SUBSCHEMA}
              />
            </TreeItem>
          </TreeView>
        </div>
        <div className="schema-detail">
          {errorMessages.length > 0 && (
            <Panel className="error-msg-panel">
              {errorMessages.map((error: string) => (
                <p>{error}</p>
              ))}
            </Panel>
          )}
          {selectedSchemaInfo && (
            <>
              <p>
                <span>文書(スキーマタイトル) ： </span>
                <span>
                  {selectedSchemaInfo.title +
                    (selectedSchemaInfo.subtitle.length > 0
                      ? ` ${selectedSchemaInfo.subtitle}`
                      : '')}
                </span>
              </p>
              <p>
                <span>スキーマID ： </span>
                <span>{selectedSchemaInfo.schema_id_string}</span>
              </p>
              <p>
                <span>継承スキーマ ： </span>
                <Checkbox checked={false} disabled={false} />
              </p>
              <p>
                <span>スキーマID ： </span>
                <span>{selectedSchema}</span>
              </p>
              <p>上位スキーマ</p>
              <div>
                <span>サブスキーマ ： </span>
                <table className="relation-table">
                  {selectedSchemaParentInfo?.fromSubSchema.map((v) => (
                    <tr>
                      <td>{v.schema.schema_id_string}</td>
                      <td>
                        <Checkbox checked={v.valid} disabled />
                      </td>
                    </tr>
                  ))}
                </table>
                <span>子スキーマ ： </span>
                <table className="relation-table">
                  {selectedSchemaParentInfo?.fromChildSchema.map((v) => (
                    <tr>
                      <td>{v.schema.schema_id_string}</td>
                      <td>
                        <Checkbox
                          checked={v.valid}
                          onChange={(e) =>
                            handleCheckClick(
                              RELATION_TYPE.PARENT,
                              CHECK_TYPE.CHILDSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </table>
              </div>
              <p>下位スキーマ</p>
              <p>
                <span>サブスキーマ ： </span>
                <table className="relation-table">
                  {subSchemaList.map((v) => (
                    <tr>
                      <td>
                        <Button
                          onClick={() =>
                            handleArrowClick(
                              ARROW_TYPE.UP,
                              SCHEMA_TYPE.SUBSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        >
                          ↑
                        </Button>
                        <Button
                          onClick={() =>
                            handleArrowClick(
                              ARROW_TYPE.DOWN,
                              SCHEMA_TYPE.SUBSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        >
                          ↓
                        </Button>
                      </td>
                      <td>
                        {v.schema.title}
                        {v.schema.subtitle && ` ${v.schema.subtitle}`}
                      </td>
                      <td>
                        <Checkbox checked={v.valid} disabled />
                      </td>
                    </tr>
                  ))}
                </table>
              </p>
              <p>
                <span>子スキーマ ： </span>
                <table className="relation-table">
                  {childSchemaList.map((v) => (
                    <tr>
                      <td>
                        <Button
                          onClick={() =>
                            handleArrowClick(
                              ARROW_TYPE.UP,
                              SCHEMA_TYPE.CHILDSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        >
                          ↑
                        </Button>
                        <Button
                          onClick={() =>
                            handleArrowClick(
                              ARROW_TYPE.DOWN,
                              SCHEMA_TYPE.CHILDSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        >
                          ↓
                        </Button>
                      </td>
                      <td>
                        {v.schema.title}
                        {v.schema.subtitle && ` ${v.schema.subtitle}`}
                      </td>
                      <td>
                        <Checkbox
                          checked={v.valid}
                          onChange={(e) =>
                            handleCheckClick(
                              RELATION_TYPE.CHILD,
                              CHECK_TYPE.CHILDSCHEMA,
                              v.schema.schema_id.toString()
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </table>
              </p>
              <p>
                <span>初期サブスキーマ ： </span>
                <span>{selectedSchemaInfo.subschema_default}</span>
              </p>
              <p>
                <span>初期子スキーマ ： </span>
                <span>{selectedSchemaInfo.child_schema_default}</span>
              </p>
              <Button onClick={() => alert('test')}>初期設定を反映</Button>
              <Button onClick={() => updateSchema()}>設定を保存</Button>
            </>
          )}
        </div>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SchemaManager;
