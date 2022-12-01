/* eslint-disable no-plusplus */
/* eslint-disable no-alert */
import React, { useEffect, useRef, useState } from 'react';
import {
  Navbar,
  Button,
  Nav,
  NavItem,
  Panel,
  Checkbox,
  Table,
  Radio,
} from 'react-bootstrap';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import TreeView from '@mui/lab/TreeView';
import Box from '@mui/material/Box';
import { saveAs } from 'file-saver';
import CustomTreeItem from '../components/Schemamanager/CustomTreeItem';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import Loading from '../components/CaseRegistration/Loading';
import { Const } from '../common/Const';
import './SchemaManager.css';
import SchemaTree, {
  SCHEMA_TYPE,
} from '../components/Schemamanager/SchemaTree';
import {
  AddBeforeUnloadEvent,
  RemoveBeforeUnloadEvent,
} from '../common/CommonUtility';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { settingsFromApi } from './Settings';
import { useNavigate } from 'react-router-dom';
import { responseResult, UploadPluginFile } from '../common/DBUtility';

type settings = {
  facility_name: string;
};

export type jesgoPluginColumns = {
  plugin_id: number;
  plugin_name: string;
  plugin_version?: string;
  script_text: string;
  target_schema_id?: number[];
  target_schema_id_string?: string;
  all_patient: boolean;
  update_db: boolean;
  attach_patient_info: boolean;
  explain?: string;
};

const PluginManager = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem('display_name');
  const [facilityName, setFacilityName] = useState('');
  const [, setSettingJson] = useState<settings>({
    facility_name: '',
  });
  const [jesgoPluginList, setJesgoPluginList] = useState<jesgoPluginColumns[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [pluginUploadResponse, setPluginUploadResponse] =
    useState<responseResult>({ message: '', resCode: undefined });

  // 実際のアップロードボタンへの参照
  const refBtnUpload = useRef<HTMLInputElement>(null);

  // プラグインアップロードボタン押下
  const pluginUpload = () => {
    const button = refBtnUpload.current;
    button?.click();
  };

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

      const pluginListReturn = await apiAccess(METHOD_TYPE.GET, `plugin-list`);
      if (pluginListReturn.statusNum === RESULT.NORMAL_TERMINATION) {
        const pluginList = pluginListReturn.body as jesgoPluginColumns[];
        setJesgoPluginList(pluginList);
      } else {
        RemoveBeforeUnloadEvent();
        navigate('/login');
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  useEffect(() => {
    if (pluginUploadResponse.resCode !== undefined) {
      alert(pluginUploadResponse.message);
      setPluginUploadResponse({ message: '', resCode: undefined });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises

      setIsLoading(false);

      // アップロード対象ファイルクリア
      if (refBtnUpload.current) {
        refBtnUpload.current.value = '';
      }
    }
  }, [pluginUploadResponse]);

  // ファイル選択
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const file = fileList[0];
      const fileName: string = file.name.toLocaleLowerCase();
      if (!fileName.endsWith('.zip') && !fileName.endsWith('.js')) {
        alert('ZIPファイルもしくはJSファイルを選択してください');
        return;
      }

      setIsLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      UploadPluginFile(file, setPluginUploadResponse, setErrorMessages);
    }
  };

  return (
    <>
      <div className="page-area">
        <Navbar collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <img src="./image/logo.png" alt="JESGO" className="img" />
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem className="header-text">プラグイン管理</NavItem>
            </Nav>
            <Navbar.Text pullRight>Ver.{Const.VERSION}</Navbar.Text>
            <Nav pullRight>
              <Navbar.Brand>
                <div>
                  <UserMenu title={userName} i={0} isConfirm={null} />
                </div>
              </Navbar.Brand>
              <Navbar.Brand>
                <div>
                  <SystemMenu title="設定" i={0} isConfirm={null} />
                </div>
              </Navbar.Brand>
            </Nav>
            <Navbar.Text pullRight>{facilityName}&nbsp;&nbsp;</Navbar.Text>
          </Navbar.Collapse>
        </Navbar>
      </div>

      <div className="schema-buttons">
        <div className="schema-inner">
          <Button
            bsStyle="success"
            className="normal-button"
            title="プラグインのJSファイルをアップロードします"
            onClick={pluginUpload}
          >
            プラグインアップロード
          </Button>
          {/* 実際のアップロードボタンは非表示 */}
          <input
            accept=".zip,.js"
            ref={refBtnUpload}
            type="file"
            onChange={onFileSelected}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* <div>
        <Table striped className="setting-table">
          <thead style={{ position: 'sticky' }}>
            <tr>
              <th>ログイン名</th>
              <th>表示名称</th>
              <th>権限</th>
              <th>編集/削除</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.user_id.toString()}>
                <td>{staff.name}</td>
                <td>{staff.display_name}</td>
                <td>{convertRollName(staff.roll_id)}</td>
                <td>
                  <ButtonToolbar>
                    <ButtonGroup>
                      <Button onClick={() => editStaff(staff)}>
                        <Glyphicon glyph="edit" />
                      </Button>
                      <Button
                        onClick={() =>
                          deleteStaff(
                            staff.user_id,
                            staff.name,
                            staff.display_name
                          )
                        }
                      >
                        <Glyphicon glyph="trash" />
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div> */}
      {isLoading && <Loading />}
    </>
  );
};

export default PluginManager;
