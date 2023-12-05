import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Nav, NavItem, Radio, Table } from 'react-bootstrap';
import './Settings.css';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import { Const } from '../common/Const';
import Loading from '../components/CaseRegistration/Loading';
import { backToPatientsList } from '../common/CommonUtility';

export type settingsFromApi = {
  hisid_alignment: string;
  hisid_digit: string;
  hisid_hyphen_enable: string;
  hisid_alphabet_enable: string;
  facility_name: string;
  jsog_registration_number: string;
  joed_registration_number: string;
};

type settings = {
  hisid_alignment: boolean;
  hisid_digit: number;
  hisid_digit_string: string;
  hisid_hyphen_enable: boolean;
  hisid_alphabet_enable: boolean;
  facility_name: string;
  jsog_registration_number: string;
  joed_registration_number: string;
};

const Settings = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('display_name');
  const [facilityName, setFacilityName] = useState('');
  const [settingJson, setSettingJson] = useState<settings>({
    hisid_alignment: true,
    hisid_digit: 8,
    hisid_digit_string: '8',
    hisid_hyphen_enable: true,
    hisid_alphabet_enable: true,
    facility_name: '',
    jsog_registration_number: '',
    joed_registration_number: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const f = async () => {
      setIsLoading(true);

      // 設定情報取得APIを呼ぶ
      const returnApiObject = await apiAccess(METHOD_TYPE.GET, `getSettings`);

      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = returnApiObject.body as settingsFromApi;
        const setting: settings = {
          hisid_alignment: returned.hisid_alignment === 'true',
          hisid_digit: Number(returned.hisid_digit),
          hisid_digit_string: returned.hisid_digit,
          hisid_hyphen_enable: returned.hisid_hyphen_enable === 'true',
          hisid_alphabet_enable: returned.hisid_alphabet_enable === 'true',
          facility_name: returned.facility_name,
          jsog_registration_number: returned.jsog_registration_number,
          joed_registration_number: returned.joed_registration_number,
        };
        setFacilityName(returned.facility_name);
        setSettingJson(setting);
      } else {
        navigate('/login');
      }

      setIsLoading(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingInputs = (event: any) => {
    const eventTarget: EventTarget & HTMLInputElement =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      event.target as EventTarget & HTMLInputElement;

    switch (eventTarget.name) {
      case 'alignment':
        setSettingJson({
          ...settingJson,
          hisid_alignment: eventTarget.value === 'true',
        });
        break;

      case 'digit':
        setSettingJson({
          ...settingJson,
          hisid_digit: Number(eventTarget.value),
          hisid_digit_string: eventTarget.value,
        });
        break;

      case 'hyphen_enable':
        // ハイフン許容がtrueの場合、桁揃えをfalseにする
        if (eventTarget.value === 'true') {
          setSettingJson({
            ...settingJson,
            hisid_hyphen_enable: true,
            hisid_alignment: false,
          });
        } else {
          setSettingJson({
            ...settingJson,
            hisid_hyphen_enable: false,
          });
        }
        break;

      case 'alphabet_enable':
        // アルファベット許容がtrueの場合、桁揃えをfalseにする
        if (eventTarget.value === 'true') {
          setSettingJson({
            ...settingJson,
            hisid_alphabet_enable: true,
            hisid_alignment: false,
          });
        } else {
          setSettingJson({
            ...settingJson,
            hisid_alphabet_enable: false,
          });
        }
        break;

      case 'facility_name':
        setSettingJson({
          ...settingJson,
          facility_name: eventTarget.value,
        });
        break;

      case 'jsog_registration_number':
        setSettingJson({
          ...settingJson,
          jsog_registration_number: eventTarget.value,
        });
        break;

      case 'joed_registration_number':
        setSettingJson({
          ...settingJson,
          joed_registration_number: eventTarget.value,
        });
        break;

      default:
    }
  };
  const errorCheck = (): string[] => {
    const errorMessages: string[] = [];

    if (
      settingJson.hisid_digit < 6 ||
      settingJson.hisid_digit > 12 ||
      !Number.isInteger(settingJson.hisid_digit)
    ) {
      // 桁数指定が無効の場合、エラーだったら値を無警告で直す
      if (
        settingJson.hisid_alphabet_enable ||
        settingJson.hisid_hyphen_enable
      ) {
        settingJson.hisid_digit = 8;
      } else {
        errorMessages.push('桁数は6-12の整数を入力してください');
      }
    }
    if (
      settingJson.jsog_registration_number !== '' &&
      !settingJson.jsog_registration_number.match(/^[0-9]{6}$/)
    ) {
      errorMessages.push(
        '日産婦腫瘍登録施設番号は空欄にするか数字6桁で入力してください'
      );
    }
    if (
      settingJson.joed_registration_number !== '' &&
      !settingJson.joed_registration_number.match(
        /^(0[1-9]|[2-3]\d|4[0-7])\d{3}$/
      )
    ) {
      errorMessages.push(
        '日本産科婦人科内視鏡学会施設番号は空欄にするか正しい形式で入力してください'
      );
    }

    if (errorMessages.length > 0) {
      errorMessages.unshift('【設定値エラー】');
    }

    return errorMessages;
  };

  const clickCancel = () => {
    backToPatientsList(navigate);
  };

  const submit = async () => {
    const errorMessages = errorCheck();
    if (errorMessages.length > 0) {
      // eslint-disable-next-line no-alert
      alert(errorMessages.join('\n'));
      return;
    }

    const token = localStorage.getItem('token');
    if (token == null) {
      navigate('/login');
      return;
    }

    setIsLoading(true);

    // 設定情報更新APIを呼ぶ
    const returnApiObject = await apiAccess(
      METHOD_TYPE.POST,
      `updateSettings`,
      settingJson
    );

    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      localStorage.setItem('alignment', settingJson.hisid_alignment.toString());
      localStorage.setItem('digit', settingJson.hisid_digit.toString());
      localStorage.setItem(
        'alphabet_enable',
        settingJson.hisid_alphabet_enable.toString()
      );
      localStorage.setItem(
        'hyphen_enable',
        settingJson.hisid_hyphen_enable.toString()
      );
      // eslint-disable-next-line no-alert
      alert('設定が完了しました');
      backToPatientsList(navigate);
    } else {
      // eslint-disable-next-line no-alert
      alert('【エラー】\n設定に失敗しました');
      // navigate('/patients');
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="relative">
        <Navbar collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <img src="./image/logo.png" alt="JESGO" className="img" />
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem className="header-text">設定</NavItem>
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

        <div className="page-menu">
          <div className="search-form-closed flex">
            <Button
              bsStyle="primary"
              onClick={submit}
              className="normal-button"
            >
              保存
            </Button>
            <div className="spacer10" />
            <Button
              onClick={clickCancel}
              bsStyle="primary"
              className="normal-button"
            >
              リストに戻る
            </Button>
          </div>
        </div>
        <div className="setting-list">
          <Table striped className="setting-table">
            <thead>
              <tr>
                <th>項目名</th>
                <th>設定値</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  患者ID 桁揃え
                  ※ハイフン/アルファベットを許容すると桁揃え設定は無効になります
                </td>
                <td>
                  <Radio
                    name="alignment"
                    onChange={handleSettingInputs}
                    value="true"
                    inline
                    checked={settingJson.hisid_alignment}
                    disabled={
                      settingJson.hisid_hyphen_enable ||
                      settingJson.hisid_alphabet_enable
                    }
                  >
                    あり
                  </Radio>
                  <Radio
                    name="alignment"
                    onChange={handleSettingInputs}
                    value="false"
                    inline
                    checked={!settingJson.hisid_alignment}
                    disabled={
                      settingJson.hisid_hyphen_enable ||
                      settingJson.hisid_alphabet_enable
                    }
                  >
                    なし
                  </Radio>
                </td>
              </tr>
              <tr>
                <td>
                  患者ID 桁数
                  ※ハイフン/アルファベットを許容すると桁数指定は無効になります
                </td>
                <td>
                  <input
                    type="text"
                    name="digit"
                    value={settingJson.hisid_digit_string}
                    onChange={handleSettingInputs}
                    disabled={
                      settingJson.hisid_hyphen_enable ||
                      settingJson.hisid_alphabet_enable
                    }
                  />
                  桁
                </td>
              </tr>
              <tr>
                <td>患者ID ハイフン許容</td>
                <td>
                  <Radio
                    name="hyphen_enable"
                    onChange={handleSettingInputs}
                    value="true"
                    inline
                    checked={settingJson.hisid_hyphen_enable}
                  >
                    あり
                  </Radio>
                  <Radio
                    name="hyphen_enable"
                    onChange={handleSettingInputs}
                    value="false"
                    inline
                    checked={!settingJson.hisid_hyphen_enable}
                  >
                    なし
                  </Radio>
                </td>
              </tr>
              <tr>
                <td>患者ID アルファベット許容</td>
                <td>
                  <Radio
                    name="alphabet_enable"
                    onChange={handleSettingInputs}
                    value="true"
                    inline
                    checked={settingJson.hisid_alphabet_enable}
                  >
                    あり
                  </Radio>
                  <Radio
                    name="alphabet_enable"
                    onChange={handleSettingInputs}
                    value="false"
                    inline
                    checked={!settingJson.hisid_alphabet_enable}
                  >
                    なし
                  </Radio>
                </td>
              </tr>
              <tr>
                <td>施設名称</td>
                <td>
                  <input
                    type="text"
                    name="facility_name"
                    onChange={handleSettingInputs}
                    value={settingJson.facility_name}
                  />
                </td>
              </tr>
              <tr>
                <td>日産婦腫瘍登録施設番号</td>
                <td>
                  <input
                    type="text"
                    name="jsog_registration_number"
                    onChange={handleSettingInputs}
                    value={settingJson.jsog_registration_number}
                  />
                </td>
              </tr>
              <tr>
                <td>日本産科婦人科内視鏡学会施設番号</td>
                <td>
                  <input
                    type="text"
                    name="joed_registration_number"
                    onChange={handleSettingInputs}
                    value={settingJson.joed_registration_number}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
      {isLoading && <Loading />}
    </>
  );
};
export default Settings;
