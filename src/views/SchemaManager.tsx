/* eslint-disable no-alert */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, NavItem, Panel, Checkbox } from 'react-bootstrap';
import { ExpandMore, ChevronRight, Fort } from '@mui/icons-material';
import { TreeView, TreeItem } from '@mui/lab';
import { Box } from '@mui/material';
import lodash from 'lodash';
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
} from '../components/CaseRegistration/SchemaUtility';
import DndSortableTable from '../components/Schemamanager/DndSortableTable';

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
          valid: i <= schema.child_schema.length,
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
  // チェックボックス状態変更
  const handleCheckClick = (type: number, v = ''): void => {
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
      // stateに設定
      setChildSchemaList(copySchemaList);
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
        {/* 文書構造ビュー */}
        <fieldset className="schema-manager-legend">
          <legend>文書構造ビュー</legend>
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
        </fieldset>
        {/* スキーマ設定ビュー */}
        <div className="schema-detail">
          <fieldset className="schema-manager-legend">
            <legend>スキーマ選択ビュー</legend>
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
                            <Checkbox
                              checked={v.valid}
                              onChange={(e) =>
                                handleCheckClick(
                                  CHECK_TYPE.SUBSCHEMA,
                                  v.schema.schema_id.toString()
                                )
                              }
                            />
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
                    <div className="caption-and-block">
                      <span>サブスキーマ ： </span>
                      <DndSortableTable
                        checkType={CHECK_TYPE.SUBSCHEMA}
                        schemaList={subSchemaList}
                        setSchemaList={setSubSchemaList}
                        handleCheckClick={handleCheckClick}
                      />
                    </div>
                  </p>
                  <p>
                    <div className="caption-and-block">
                      <span>子スキーマ ： </span>
                      <DndSortableTable
                        checkType={CHECK_TYPE.CHILDSCHEMA}
                        schemaList={childSchemaList}
                        setSchemaList={setChildSchemaList}
                        handleCheckClick={handleCheckClick}
                      />
                    </div>
                  </p>
                  <p>
                    <span>初期サブスキーマ ： </span>
                    <span>{selectedSchemaInfo.subschema_default}</span>
                  </p>
                  <p>
                    <span>初期子スキーマ ： </span>
                    <span>{selectedSchemaInfo.child_schema_default}</span>
                  </p>
                  <p>初期設定を反映 設定を保存</p>
                </>
              )}
            </div>
          </fieldset>
        </div>
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SchemaManager;
