/* eslint-disable no-plusplus */
/* eslint-disable no-alert */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, NavItem, Panel, Checkbox } from 'react-bootstrap';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { Box } from '@mui/material';
import lodash from 'lodash';
import { useDispatch } from 'react-redux';
import CustomTreeItem from '../components/Schemamanager/CustomTreeItem';
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
import DndSortableTable from '../components/Schemamanager/DndSortableTable';
import {
  AddBeforeUnloadEvent,
  RemoveBeforeUnloadEvent,
} from '../common/CommonUtility';

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
    // ブラウザの戻る・更新の防止
    AddBeforeUnloadEvent();

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
        RemoveBeforeUnloadEvent();
        navigate('/login');
      }

      // スキーマツリーを取得する
      const treeApiObject = await apiAccess(METHOD_TYPE.GET, `gettree`);

      if (treeApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = treeApiObject.body as treeSchema[];
        setTree(returned);
      } else {
        RemoveBeforeUnloadEvent();
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

  // 親スキーマからみた表示、非表示がDBに保存されている状態から変更されているかを見る
  // 変更された親スキーマのリストを返す
  const getNeedUpdateParents = (): JesgoDocumentSchema[] => {
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

    return updateSchemaList;
  };

  const isNeedUpdateSchema = (): boolean => {
    let isChange = false;
    // 表示中のスキーマの子関係
    const baseSchemaInfo = lodash.cloneDeep(selectedSchemaInfo);
    if (baseSchemaInfo !== undefined) {
      // サブスキーマ
      // 編集中のサブスキーマのうち有効であるもののみのリストを作る
      const tempSubSchemaList: number[] = [];
      for (let i = 0; i < subSchemaList.length; i++) {
        if (subSchemaList[i].valid) {
          tempSubSchemaList.push(subSchemaList[i].schema.schema_id);
        }
      }
      // 有効サブスキーマリストと編集前のスキーマリストが異なれば更新をかける
      if (!lodash.isEqual(tempSubSchemaList, baseSchemaInfo.subschema)) {
        baseSchemaInfo.subschema = tempSubSchemaList;
        isChange = true;
      }

      // 子スキーマ
      // 編集中の子スキーマのうち有効であるもののみのリストを作る
      const tempChildSchemaList: number[] = [];
      for (let i = 0; i < childSchemaList.length; i++) {
        if (childSchemaList[i].valid) {
          tempChildSchemaList.push(childSchemaList[i].schema.schema_id);
        }
      }
      // 有効子スキーマリストと編集前のスキーマリストが異なれば更新をかける
      if (!lodash.isEqual(tempChildSchemaList, baseSchemaInfo.child_schema)) {
        baseSchemaInfo.child_schema = tempChildSchemaList;
        isChange = true;
      }
    }
    return isChange;
  };

  const leaveAlart = (): boolean => {
    const tempSchemaList = getNeedUpdateParents();
    const isChildEdited = isNeedUpdateSchema();
    if (tempSchemaList.length > 0 || isChildEdited) {
      // eslint-disable-next-line no-restricted-globals
      return confirm(
        'スキーマが編集中です。編集を破棄して移動してもよろしいですか？'
      );
    }
    return true;
  };

  const clickCancel = () => {
    if (leaveAlart()) {
      RemoveBeforeUnloadEvent();
      navigate('/Patients');
    }
  };

  // 実際のアップロードボタンへの参照
  const refBtnUpload = useRef<HTMLInputElement>(null);

  // スキーマアップロードボタン押下
  const schemaUpload = () => {
    if (leaveAlart()) {
      const button = refBtnUpload.current;
      button?.click();
    }
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

  const submitUpdateSchema = async (schemas: JesgoDocumentSchema[]) => {
    const token = localStorage.getItem('token');
    if (token == null) {
      RemoveBeforeUnloadEvent();
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
        RemoveBeforeUnloadEvent();
        navigate('/login');
      }

      // スキーマ取得処理
      await storeSchemaInfo(dispatch);

      // eslint-disable-next-line no-alert
      alert('スキーマを更新しました');
    } else {
      // eslint-disable-next-line no-alert
      alert('【エラー】\n設定に失敗しました');
    }
    setIsLoading(false);
  };

  const updateSchema = async () => {
    // 更新用スキーマリストの初期値として変更済親スキーマのリストを取得(変更がない場合は空配列)
    const updateSchemaList = getNeedUpdateParents();

    // 自スキーマのサブスキーマ、子スキーマに更新があれば変更リストに追加する
    if (isNeedUpdateSchema()) {
      const baseSchemaInfo = lodash.cloneDeep(selectedSchemaInfo);
      if (baseSchemaInfo !== undefined) {
        // サブスキーマ
        // 編集中のサブスキーマのうち有効であるもののみのリストを作る
        const tempSubSchemaList: number[] = [];
        for (let i = 0; i < subSchemaList.length; i++) {
          if (subSchemaList[i].valid) {
            tempSubSchemaList.push(subSchemaList[i].schema.schema_id);
          }
        }
        baseSchemaInfo.subschema = tempSubSchemaList;

        // 子スキーマ
        // 編集中の子スキーマのうち有効であるもののみのリストを作る
        const tempChildSchemaList: number[] = [];
        for (let i = 0; i < childSchemaList.length; i++) {
          if (childSchemaList[i].valid) {
            tempChildSchemaList.push(childSchemaList[i].schema.schema_id);
          }
        }
        baseSchemaInfo.child_schema = tempChildSchemaList;

        updateSchemaList.push(baseSchemaInfo);
      }
    }

    // POST処理
    await submitUpdateSchema(updateSchemaList);
  };

  // 初期設定の読込
  const loadDefault = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('初期設定を読み込みますか？')) {
      const tempSubSchemaList: schemaWithValid[] = [];
      const tempChildSchemaList: schemaWithValid[] = [];
      if (selectedSchemaInfo !== undefined) {
        // サブスキーマを初期に戻す
        // eslint-disable-next-line no-restricted-syntax
        for (const schemaId of selectedSchemaInfo.subschema_default) {
          tempSubSchemaList.push({
            valid: true,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            schema: GetSchemaInfo(schemaId)!,
          });
        }

        // 子スキーマを初期に戻す
        // eslint-disable-next-line no-restricted-syntax
        for (const schemaId of selectedSchemaInfo.child_schema_default) {
          tempChildSchemaList.push({
            valid: true,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            schema: GetSchemaInfo(schemaId)!,
          });
        }

        setSubSchemaList(tempSubSchemaList);
        setChildSchemaList(tempChildSchemaList);
      }
    }
    // いいえであれば何もしない
  };

  // ツリーアイテムクリック
  const handleTreeItemClick = (
    event:
      | React.MouseEvent<HTMLLIElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
    v = ''
  ): void => {
    if (selectedSchema === v || leaveAlart()) {
      setSelectedSchema(v);
    }
  };

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
              <UserMenu title={userName} i={0} isConfirm={leaveAlart} />
            </NavItem>
            <NavItem>
              <SystemMenu title="設定" i={0} isConfirm={leaveAlart} />
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
        {errorMessages.length > 0 && (
          <Panel className="error-msg-panel-sm">
            {errorMessages.map((error: string) => (
              <p>{error}</p>
            ))}
          </Panel>
        )}
        <div className="flex">
          {/* 文書構造ビュー */}
          <fieldset className="schema-manager-legend schema-tree">
            <legend>文書構造ビュー</legend>
            <div className="schema-tree">
              <TreeView defaultExpanded={['root']}>
                <CustomTreeItem
                  nodeId="root"
                  label={
                    <Box
                      onClick={(
                        e:
                          | React.MouseEvent<HTMLLIElement, MouseEvent>
                          | React.MouseEvent<HTMLDivElement, MouseEvent>
                      ) => handleTreeItemClick(e, '0')}
                    >
                      JESGOシステム
                    </Box>
                  }
                  collapseIcon={<ExpandMore />}
                  expandIcon={<ChevronRight />}
                >
                  <SchemaTree
                    schemas={tree}
                    handleTreeItemClick={handleTreeItemClick}
                    schemaType={SCHEMA_TYPE.SUBSCHEMA}
                  />
                </CustomTreeItem>
              </TreeView>
            </div>
          </fieldset>
          {/* スキーマ設定ビュー */}
          <div className="schema-detail">
            <fieldset className="schema-manager-legend schema-detail">
              <legend>スキーマ選択ビュー</legend>
              <div className="schema-detail">
                {selectedSchemaInfo && (
                  <>
                    <fieldset className="schema-manager-legend">
                      <legend>スキーマ情報</legend>
                      <div className="caption-and-block-long">
                        <span>文書(スキーマ)タイトル ： </span>
                        <span>
                          {selectedSchemaInfo.title +
                            (selectedSchemaInfo.subtitle.length > 0
                              ? ` ${selectedSchemaInfo.subtitle}`
                              : '')}
                        </span>
                      </div>
                      <div className="caption-and-block-long">
                        <span>スキーマID ： </span>
                        <span>{selectedSchemaInfo.schema_id_string}</span>
                      </div>
                      <div className="caption-and-block-long">
                        <span>バージョン ： </span>
                        <span>{`${selectedSchemaInfo.version_major}.${selectedSchemaInfo.version_minor}`}</span>
                      </div>
                      <div className="caption-and-block-long">
                        <span>継承スキーマ ： </span>
                        <Checkbox
                          className="show-flg-checkbox"
                          checked={false}
                          disabled={false}
                        />
                      </div>
                      {/* TODO: スキーマダウンロードボタンサンプル */}
                      {/* <div>
                        <Button
                          bsStyle="success"
                          className="normal-button nomargin glyphicon glyphicon-download-alt"
                          title="スキーマファイルをダウンロードします"
                          onClick={schemaUpload}
                        >
                          {' '}
                          スキーマダウンロード
                        </Button>
                      </div> */}
                    </fieldset>
                    <fieldset className="schema-manager-legend">
                      <legend>上位スキーマ</legend>
                      <div>
                        <p>
                          <div className="caption-and-block">
                            <span>必須スキーマ ： </span>
                            <DndSortableTable
                              checkType={[
                                RELATION_TYPE.PARENT,
                                CHECK_TYPE.SUBSCHEMA,
                              ]}
                              schemaList={
                                selectedSchemaParentInfo?.fromSubSchema
                              }
                              handleCheckClick={handleCheckClick}
                              isDragDisabled
                              isShowCheckDisabled
                            />
                          </div>
                        </p>
                        <p>
                          <div className="caption-and-block">
                            <span>任意スキーマ ： </span>
                            <DndSortableTable
                              checkType={[
                                RELATION_TYPE.PARENT,
                                CHECK_TYPE.CHILDSCHEMA,
                              ]}
                              schemaList={
                                selectedSchemaParentInfo?.fromChildSchema
                              }
                              handleCheckClick={handleCheckClick}
                              isDragDisabled
                            />
                          </div>
                        </p>
                      </div>
                    </fieldset>
                    <fieldset className="schema-manager-legend">
                      <legend>下位スキーマ</legend>
                      <p>
                        <div className="caption-and-block">
                          <span>必須スキーマ ： </span>
                          <DndSortableTable
                            checkType={[
                              RELATION_TYPE.CHILD,
                              CHECK_TYPE.SUBSCHEMA,
                            ]}
                            schemaList={subSchemaList}
                            setSchemaList={setSubSchemaList}
                            handleCheckClick={handleCheckClick}
                            isShowCheckDisabled
                          />
                        </div>
                      </p>
                      <p>
                        <div className="caption-and-block">
                          <span>任意スキーマ ： </span>
                          <DndSortableTable
                            checkType={[
                              RELATION_TYPE.CHILD,
                              CHECK_TYPE.CHILDSCHEMA,
                            ]}
                            schemaList={childSchemaList}
                            setSchemaList={setChildSchemaList}
                            handleCheckClick={handleCheckClick}
                          />
                        </div>
                      </p>
                    </fieldset>
                    <div className="SchemaManagerSaveButtonGroup">
                      <Button
                        bsStyle="default"
                        className="normal-button"
                        onClick={() => loadDefault()}
                      >
                        初期設定を反映
                      </Button>
                      <Button
                        bsStyle="success"
                        className="normal-button"
                        onClick={() => updateSchema()}
                      >
                        設定を保存
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SchemaManager;
