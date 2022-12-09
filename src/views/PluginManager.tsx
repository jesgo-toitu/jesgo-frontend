/* eslint-disable no-plusplus */
/* eslint-disable no-alert */
import React, { useEffect, useRef, useState } from 'react';
import {
  Navbar,
  Button,
  Nav,
  NavItem,
  Table,
  ButtonGroup,
  ButtonToolbar,
  Glyphicon,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import Loading from '../components/CaseRegistration/Loading';
import { Const } from '../common/Const';
import './SchemaManager.css';
import {
  AddBeforeUnloadEvent,
  RemoveBeforeUnloadEvent,
} from '../common/CommonUtility';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { settingsFromApi } from './Settings';
import { responseResult, UploadPluginFile } from '../common/DBUtility';
import {
  GetSchemaTitle,
  OpenOutputViewScript,
} from '../common/CaseRegistrationUtility';
import './PluginManager.css';

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

  const getSchemaNameList = (idList: number[]): string => {
    const schemaNameList: string[] = [];
    for (let index = 0; index < idList.length; index++) {
      const schemaId = idList[index];
      const schemaTitle = GetSchemaTitle(schemaId);
      if (schemaTitle !== '') {
        schemaNameList.push(schemaTitle);
      }
    }
    return schemaNameList.join('\n');
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
        console.log(pluginList);
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

  const leaveAlart = (): boolean => {
    /* const tempSchemaList = getNeedUpdateParents(true);
     const isChildEdited = isNeedUpdateSchema();
    if (tempSchemaList.length > 0 || isChildEdited) {
      // eslint-disable-next-line no-restricted-globals
      return confirm(
        'スキーマが編集中です。編集を破棄して移動してもよろしいですか？'
      );
    }
    */
    return true;
  };

  const clickCancel = () => {
    if (leaveAlart()) {
      RemoveBeforeUnloadEvent();
      navigate('/Patients');
    }
  };

  const openSyntax = (selectedId: number) => {
    const targetPlugin = jesgoPluginList.find(
      (p) => p.plugin_id === selectedId
    );
    if (targetPlugin) {
      const script = targetPlugin.script_text;
      OpenOutputViewScript(window, script);
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
          <Button
            onClick={clickCancel}
            bsStyle="primary"
            className="normal-button"
          >
            リストに戻る
          </Button>
        </div>
      </div>

      <div className="plugin-list">
        <Table striped className="plugin-table">
          <thead>
            <tr>
              <th>プラグイン名</th>
              <th className="plugin-table-short">バージョン</th>
              <th className="plugin-table-short">プラグイン種別</th>
              <th>対象スキーマ名</th>
              <th>詳細</th>
              <th className="plugin-table-short">
                {/*ボタン類(DL/スクリプト/削除)*/}
              </th>
            </tr>
          </thead>
          <tbody>
            {jesgoPluginList.map((plugin) => (
              <tr key={plugin.plugin_id.toString()}>
                <td>{plugin.plugin_name}</td>
                <td className="plugin-table-short">{plugin.plugin_version}</td>
                <td className="plugin-table-short">
                  {plugin.update_db ? 'データ更新' : 'データ出力'}
                </td>
                <td>
                  {plugin.target_schema_id
                    ? getSchemaNameList(plugin.target_schema_id)
                    : ''}
                </td>
                <td>{plugin.explain}</td>
                <td className="plugin-table-short">
                  <ButtonToolbar>
                    <ButtonGroup>
                      <Button onClick={() => openSyntax(plugin.plugin_id)}>
                        <Glyphicon glyph="list-alt" />
                      </Button>
                      <Button>
                        <Glyphicon glyph="download-alt" />
                      </Button>
                      <Button>
                        <Glyphicon glyph="trash" />
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {isLoading && <Loading />}
    </>
  );
};

export default PluginManager;
