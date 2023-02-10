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
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import Loading from '../components/CaseRegistration/Loading';
import { Const } from '../common/Const';
import './SchemaManager.css';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { settingsFromApi } from './Settings';
import { responseResult, UploadPluginFile } from '../common/DBUtility';
import {
  GetSchemaTitle,
  OpenOutputViewScript,
} from '../common/CaseRegistrationUtility';
import './PluginManager.css';
import { jesgoPluginColumns } from '../@types/common';

type settings = {
  facility_name: string;
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

  const [, setErrorMessages] = useState<string[]>([]);

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

  // プラグイン全ロード処理
  const loadPluginList = async () => {
    const pluginListReturn = await apiAccess(METHOD_TYPE.GET, `plugin-list`);
    if (pluginListReturn.statusNum === RESULT.NORMAL_TERMINATION) {
      const pluginList = pluginListReturn.body as jesgoPluginColumns[];
      setJesgoPluginList(pluginList);
    } else {
      navigate('/login');
    }
  };

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

      await loadPluginList();
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  useEffect(() => {
    const f = async () => {
      if (pluginUploadResponse.resCode !== undefined) {
        alert(pluginUploadResponse.message);
        setPluginUploadResponse({ message: '', resCode: undefined });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises

        await loadPluginList();
        setIsLoading(false);

        // アップロード対象ファイルクリア
        if (refBtnUpload.current) {
          refBtnUpload.current.value = '';
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, [pluginUploadResponse]);

  // ファイル選択
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const file = fileList[0];
      if (file.size > 153600) {
        alert(
          '一度にアップロードするファイルのサイズは150KBまでにしてください'
        );
        return;
      }
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

  const openSyntax = (selectedId: number) => {
    const targetPlugin = jesgoPluginList.find(
      (p) => p.plugin_id === selectedId
    );
    if (targetPlugin) {
      const script = targetPlugin.script_text;
      OpenOutputViewScript(window, script);
    }
  };

  const downloadPlugin = (targetPlugin: jesgoPluginColumns) => {
    if (targetPlugin) {
      const script = targetPlugin.script_text;
      const blob = new Blob([script], {
        type: 'application/javascript',
      });
      let fileName = '';
      if (targetPlugin.plugin_name) {
        fileName = targetPlugin.plugin_name;
      }
      if (fileName) {
        saveAs(blob, `${fileName}.js`);

        return;
      }
    }
    alert('ダウンロード不可なプラグインです。');
  };

  const deletePlugin = async (plugin: jesgoPluginColumns): Promise<void> => {
    // eslint-disable-next-line
    const result = confirm(`${plugin.plugin_name} を削除しても良いですか？`);
    if (result) {
      const token = localStorage.getItem('token');
      if (token == null) {
        // eslint-disable-next-line no-alert
        alert('【エラー】\n処理に失敗しました。');
        return;
      }

      setIsLoading(true);

      // 削除APIを呼ぶ
      const returnApiObject = await apiAccess(
        METHOD_TYPE.POST,
        `deletePlugin/`,
        {
          plugin_id: plugin.plugin_id,
        }
      );
      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        // eslint-disable-next-line no-alert
        alert('削除しました。');
        await loadPluginList();
      } else {
        // eslint-disable-next-line no-alert
        alert('【エラー】\n削除に失敗しました。');
      }

      setIsLoading(false);
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
            onClick={() => navigate('/Patients')}
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
                {/* ボタン類(DL/スクリプト/削除) */}
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
                      <Button onClick={() => downloadPlugin(plugin)}>
                        <Glyphicon glyph="download-alt" />
                      </Button>
                      <Button onClick={() => deletePlugin(plugin)}>
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
