/* eslint-disable no-alert */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, NavItem, Panel, Checkbox } from 'react-bootstrap';
import { ExpandMore, ChevronRight, CheckBox } from '@mui/icons-material';
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
import { GetSchemaInfo } from '../common/CaseRegistrationUtility';
import { JesgoDocumentSchema } from '../store/schemaDataReducer';

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
    if (schema) {
      setSelectedSchemaInfo(schema);
    }
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
              <p>下位スキーマ</p>
              <p>
                <span>サブスキーマ ： </span>
                <span>{selectedSchemaInfo.subschema}</span>
              </p>
              <p>
                <span>子スキーマ ： </span>
                <span>{selectedSchemaInfo.child_schema}</span>
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
      </div>
      {isLoading && <Loading />}
    </div>
  );
};

export default SchemaManager;
