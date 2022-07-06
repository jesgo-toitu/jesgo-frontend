// ★TODO: JSXの属性を修正する
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Button,
  FormControl,
  Checkbox,
  Nav,
  NavItem,
  ButtonToolbar,
  ButtonGroup,
  Glyphicon,
  Jumbotron,
} from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import UserTables, { userDataList } from '../components/Patients/UserTables';
import './Patients.css';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { UserMenu } from '../components/common/UserMenu';
import { SystemMenu } from '../components/common/SystemMenu';
import { settingsFromApi } from './Settings';
import { csvHeader, patientListCsv } from '../common/MakeCsv';
import { formatDate } from '../common/DBUtility';
import { Const } from '../common/Const';

export type searchColumnsFromApi = {
  cancerTypes: string[];
};

const UNIT_TYPE = {
  DAY: 0,
  MONTH: 1,
  YEAR: 2,
};
const makeSelectDate = (
  unit: number,
  startDate: Date,
  optionNum: number,
  startWithNewest = true
): string[] => {
  const dateList: string[] = [];
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < optionNum; index++) {
    const newDate = new Date(startDate.getTime());
    switch (unit) {
      case UNIT_TYPE.DAY:
        newDate.setDate(newDate.getDate() - index);
        dateList.push(formatDate(newDate, '-'));
        break;

      case UNIT_TYPE.MONTH:
        newDate.setDate(1); // 1日に設定し、月ごとの最終日関連の想定しない戻り値を避ける
        newDate.setMonth(newDate.getMonth() - index);
        dateList.push(formatDate(newDate, '-').substring(0, 7));
        break;

      case UNIT_TYPE.YEAR:
        newDate.setMonth(0); // 1月に設定し、うるう年関連の想定しない戻り値を避ける
        newDate.setFullYear(newDate.getFullYear() - index);
        dateList.push(formatDate(newDate, '-').substring(0, 4));
        break;

      default:
    }
  }
  if (startWithNewest === false) {
    dateList.reverse();
  }
  return dateList;
};

const makeSelectDataFromStorage = (columnType: string): string[] => {
  const localStorageItem = localStorage.getItem(columnType);
  const dataList = localStorageItem
    ? (JSON.parse(localStorageItem) as string[])
    : [];

  const dataMap: Map<number, string> = new Map();
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < dataList.length; index++) {
    dataMap.set(index + 1, dataList[index]);
  }
  return dataList;
};

const Patients = () => {
  const navigate = useNavigate();
  const url: string = useLocation().search;
  const userName = localStorage.getItem('display_name');
  const [searchFormOpen, setSearchFormOpen] = useState('hidden');
  const [simpleSearchButtons, setSimpleSearchButtons] = useState('hidden');
  const [detailSearchOpen, setDetailSearchOpen] = useState('hidden');
  const [noSearch, setNoSearch] = useState('table-cell');
  const [search, setSearch] = useState('hidden');
  const [progressAndRecurrenceColumn, setProgressAndRecurrenceColumn] =
    useState('hidden');
  const [listMode, setListMode] = useState(['blue', '']);
  const [userListJson, setUserListJson] = useState('');
  const [tableMode, setTableMode] = useState('normal');
  const [facilityName, setFacilityName] = useState('');
  const [csvData, setCsvData] = useState<object[]>([]);

  useEffect(() => {
    const f = async () => {
      // 設定情報取得APIを呼ぶ
      const returnSettingApiObject = await apiAccess(
        METHOD_TYPE.GET,
        `getSettings`
      );

      // 正常に取得できた場合施設名を設定
      if (returnSettingApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        const returned = returnSettingApiObject.body as settingsFromApi;
        setFacilityName(returned.facility_name);
      }

      // 患者情報取得APIを呼ぶ
      const returnApiObject = await apiAccess(
        METHOD_TYPE.GET,
        `patientlist${url}`
      );

      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        setUserListJson(JSON.stringify(returnApiObject.body));
      } else {
        navigate('/login');
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  useEffect(() => {
    const newData: patientListCsv[] = [];
    if (userListJson !== null && userListJson !== '') {
      const decordedJson = JSON.parse(userListJson) as userDataList;

      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < decordedJson.data.length; index++) {
        const userData = decordedJson.data[index];
        const patientCsv: patientListCsv = {
          patientId: userData.patientId,
          patinetName: userData.patientName,
          age: userData.age.toString(),
          startDate: userData.startDate!,
          lastUpdate: userData.lastUpdate,
          diagnosisMajor: userData.diagnosisMajor,
          diagnosisMinor: userData.diagnosisMinor,
          advancedStage: userData.advancedStage,
          recurrence: userData.status.includes('recurrence') ? '有' : '無',
          chemotherapy: userData.status.includes('chemo') ? '有' : '無',
          operation: userData.status.includes('surgery') ? '有' : '無',
          radiotherapy: userData.status.includes('radio') ? '有' : '無',
          supportiveCare: userData.status.includes('surveillance')
            ? '有'
            : '無',
          registration:
            // eslint-disable-next-line no-nested-ternary
            userData.registration.includes('decline')
              ? '拒否'
              : userData.registration.includes('not_completed')
              ? '無'
              : '有',
          death: userData.status.includes('death') ? '有' : '無',
          threeYearPrognosis: `無`,
          fiveYearPrognosis: `無`,
        };
        newData.push(patientCsv);
      }

      setCsvData(newData);
    }
  }, [userListJson]);

  const [searchWord, setSearchWord] = useState({
    treatmentStartYear: 'all',
    cancerType: 'all',
    showOnlyTumorRegistry: false,
    startOfDiagnosisDate: makeSelectDate(UNIT_TYPE.MONTH, new Date(), 1)[0],
    endOfDiagnosisDate: makeSelectDate(UNIT_TYPE.MONTH, new Date(), 1)[0],
    checkOfDiagnosisDate: false,
    checkOfBlankFields: false,
    blankFields: {
      advancedStage: false,
      pathlogicalDiagnosis: false,
      initialTreatment: false,
      copilacations: false,
      threeYearPrognosis: false,
      fiveYearPrognosis: false,
    },
    showProgressAndRecurrence: false,
  });

  const setShowProgressAndRecurrence = (
    check: boolean,
    searchStyle: string
  ) => {
    if (check && searchStyle === 'table-cell') {
      setProgressAndRecurrenceColumn('table-cell');
    } else {
      setProgressAndRecurrenceColumn('hidden');
    }
  };

  const changeView = (type: string) => {
    switch (type) {
      case 'close':
        setSearchFormOpen('hidden');
        setSimpleSearchButtons('hidden');
        setDetailSearchOpen('hidden');
        setTableMode('normal');
        break;

      case 'simpleSearch':
        setSearchFormOpen('search-form-opened block');
        setSimpleSearchButtons('block');
        setDetailSearchOpen('hidden');
        setTableMode('search_on');
        break;

      case 'detailSearch':
        setSearchFormOpen('search-form-opened block');
        setSimpleSearchButtons('hidden');
        setDetailSearchOpen('detail-form-opened block');
        setTableMode('detail_on');
        break;

      default:
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearchCondition = (event: any) => {
    const eventTarget: EventTarget & HTMLInputElement =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      event.target as EventTarget & HTMLInputElement;

    let blankFields = searchWord.blankFields;
    switch (eventTarget.name) {
      case 'treatmentStartYear':
        setSearchWord({ ...searchWord, treatmentStartYear: eventTarget.value });
        break;

      case 'cancerType':
        setSearchWord({ ...searchWord, cancerType: eventTarget.value });
        break;

      case 'showOnlyTumorRegistry':
        setSearchWord({
          ...searchWord,
          showOnlyTumorRegistry: eventTarget.checked,
        });
        break;

      case 'checkOfDiagnosisDate':
        setSearchWord({
          ...searchWord,
          checkOfDiagnosisDate: eventTarget.checked,
        });
        break;

      case 'startOfDiagnosisDate':
        setSearchWord({
          ...searchWord,
          startOfDiagnosisDate: eventTarget.value,
        });
        break;

      case 'endOfDiagnosisDate':
        setSearchWord({
          ...searchWord,
          endOfDiagnosisDate: eventTarget.value,
        });
        break;

      case 'checkOfBlankFields':
        setSearchWord({
          ...searchWord,
          checkOfBlankFields: eventTarget.checked,
        });
        break;

      case 'advancedStage':
        blankFields = { ...blankFields, advancedStage: eventTarget.checked };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'pathlogicalDiagnosis':
        blankFields = {
          ...blankFields,
          pathlogicalDiagnosis: eventTarget.checked,
        };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'initialTreatment':
        blankFields = { ...blankFields, initialTreatment: eventTarget.checked };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'copilacations':
        blankFields = { ...blankFields, copilacations: eventTarget.checked };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'threeYearPrognosis':
        blankFields = {
          ...blankFields,
          threeYearPrognosis: eventTarget.checked,
        };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'fiveYearPrognosis':
        blankFields = {
          ...blankFields,
          fiveYearPrognosis: eventTarget.checked,
        };
        setSearchWord({ ...searchWord, blankFields });
        break;

      case 'showProgressAndRecurrence':
        setSearchWord({
          ...searchWord,
          showProgressAndRecurrence: eventTarget.checked,
        });
        setShowProgressAndRecurrence(eventTarget.checked, search);
        break;
      default:
    }
  };

  const changeListColumn = (isDetail: boolean) => {
    if (isDetail) {
      setListMode(['', 'blue']);
      setNoSearch('hidden');
      setSearch('table-cell');
      setShowProgressAndRecurrence(
        searchWord.showProgressAndRecurrence,
        'table-cell'
      );
    } else {
      setListMode(['blue', '']);
      setNoSearch('table-cell');
      setSearch('hidden');
      setShowProgressAndRecurrence(
        searchWord.showProgressAndRecurrence,
        'hidden'
      );
    }
  };

  const submit = async (type: string) => {
    const token = localStorage.getItem('token');
    if (token == null) {
      navigate('/login');
      return;
    }

    const makeQueryString = () => {
      let query = `type=${type}`;
      query += `&treatmentStartYear=${encodeURIComponent(
        searchWord.treatmentStartYear
      )}`;
      query += `&cancerType=${encodeURIComponent(searchWord.cancerType)}`;
      query += `&showOnlyTumorRegistry=${encodeURIComponent(
        searchWord.showOnlyTumorRegistry
      )}`;

      if (type === 'detail') {
        if (searchWord.checkOfDiagnosisDate) {
          query += `&startOfDiagnosisDate=${encodeURIComponent(
            searchWord.startOfDiagnosisDate
          )}`;
          query += `&endOfDiagnosisDate=${encodeURIComponent(
            searchWord.endOfDiagnosisDate
          )}`;
        }

        if (searchWord.checkOfBlankFields) {
          query += `&advancedStage=${encodeURIComponent(
            searchWord.blankFields.advancedStage
          )}`;
          query += `&pathlogicalDiagnosis=${encodeURIComponent(
            searchWord.blankFields.pathlogicalDiagnosis
          )}`;
          query += `&initialTreatment=${encodeURIComponent(
            searchWord.blankFields.initialTreatment
          )}`;
          query += `&copilacations=${encodeURIComponent(
            searchWord.blankFields.copilacations
          )}`;
          query += `&threeYearPrognosis=${encodeURIComponent(
            searchWord.blankFields.threeYearPrognosis
          )}`;
          query += `&fiveYearPrognosis=${encodeURIComponent(
            searchWord.blankFields.fiveYearPrognosis
          )}`;
        }
      }
      return query;
    };

    const param: string = makeQueryString();

    // 患者情報取得APIを呼ぶ
    const returnApiObject = await apiAccess(
      METHOD_TYPE.GET,
      `patientlist?${param}`
    );

    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      setUserListJson(JSON.stringify(returnApiObject.body));
      navigate(`/Patients?${param}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative">
      <Navbar collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <img src="./image/logo.png" alt="JESGO" className="img" />
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem
              eventKey={1}
              href="#"
              className={`header-text ${listMode[0]}`}
              onClick={() => changeListColumn(false)}
            >
              患者リスト表示
            </NavItem>
            <NavItem
              eventKey={2}
              href="#"
              className={`header-text ${listMode[1]}`}
              onClick={() => changeListColumn(true)}
            >
              腫瘍登録管理表示
            </NavItem>
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
      <div className="page-menu">
        <div className="search-form-closed flex">
          <ButtonToolbar style={{ marginTop: '14px', marginBottom: '14px' }}>
            <ButtonGroup>
              <Button onClick={() => changeView('simpleSearch')}>
                <Glyphicon glyph="search" />
              </Button>
              <Button onClick={() => changeView('detailSearch')}>
                <Glyphicon glyph="eye-open" />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
          <div className="spacer10" />
          {localStorage.getItem('is_add_roll') === 'true' && (
            <Button
              bsStyle="primary"
              href="/registration"
              className="normal-button"
            >
              新規作成
            </Button>
          )}
          <CSVLink
            data={csvData}
            headers={csvHeader}
            // eslint-disable-next-line
            onClick={() => confirm('CSVファイルをダウンロードしますか？')}
          >
            <Button bsStyle="success" className="normal-button">
              CSV作成
            </Button>
          </CSVLink>
        </div>
      </div>
      <div className="search-form-outer">
        <Jumbotron className={searchFormOpen}>
          <div className="flex">
            初回治療開始日：
            <FormControl
              name="treatmentStartYear"
              onChange={handleSearchCondition}
              componentClass="select"
            >
              <option value="all">すべて</option>
              {makeSelectDate(UNIT_TYPE.YEAR, new Date(), 3).map(
                (date: string) => (
                  <option value={date}>{`${date}年`}</option>
                )
              )}
            </FormControl>
            <div className="spacer10" />
            がん種：
            <FormControl
              name="cancerType"
              onChange={handleSearchCondition}
              componentClass="select"
            >
              <option value="all">すべて</option>
              {makeSelectDataFromStorage('cancer_type').map(
                (value: string, index: number) => (
                  <option value={index + 1}>{value}</option>
                )
              )}
            </FormControl>
            <div className="spacer10" />
            <Checkbox
              name="showOnlyTumorRegistry"
              onChange={handleSearchCondition}
              inline
            >
              腫瘍登録対象のみ表示
            </Checkbox>
            <div className="close-icon">
              <a href="#" onClick={() => changeView('close')}>
                <span
                  className="glyphicon glyphicon-remove"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
          <div className={simpleSearchButtons}>
            <a href="#" onClick={() => changeView('detailSearch')}>
              <span
                className="glyphicon glyphicon-eye-open"
                aria-hidden="true"
              />
              詳細表示設定
            </a>
            <div className="spacer10" />
            <div className="spacer10" />
            <a href="#" onClick={() => submit('search')}>
              <span className="glyphicon glyphicon-search" aria-hidden="true" />
              検索
            </a>
          </div>
          <div className={detailSearchOpen}>
            <div className="detail-column">
              <span
                className="detail-setting-icon glyphicon glyphicon-eye-open"
                aria-hidden="true"
              />
              <span className="detail-setting-text">詳細表示設定：</span>
            </div>
            <div className="detail-column">
              <Checkbox
                name="checkOfDiagnosisDate"
                onChange={handleSearchCondition}
                inline
              >
                <span className="detail-setting-content">診断日：</span>
              </Checkbox>
              <FormControl
                name="startOfDiagnosisDate"
                onChange={handleSearchCondition}
                componentClass="select"
              >
                {makeSelectDate(UNIT_TYPE.MONTH, new Date(), 12).map(
                  (date: string) => (
                    <option value={`${date}`}>{date}</option>
                  )
                )}
              </FormControl>
              ～
              <FormControl
                name="endOfDiagnosisDate"
                onChange={handleSearchCondition}
                componentClass="select"
              >
                {makeSelectDate(UNIT_TYPE.MONTH, new Date(), 12).map(
                  (date: string) => (
                    <option value={`${date}`}>{date}</option>
                  )
                )}
              </FormControl>
            </div>
            <div className="detail-column">
              <Checkbox
                name="checkOfBlankFields"
                onChange={handleSearchCondition}
                inline
              >
                <span className="detail-setting-content">
                  未入力項目で絞り込み：
                </span>
              </Checkbox>
              <Checkbox
                name="advancedStage"
                onChange={handleSearchCondition}
                inline
              >
                進行期
              </Checkbox>
              <Checkbox
                name="pathlogicalDiagnosis"
                onChange={handleSearchCondition}
                inline
              >
                診断
              </Checkbox>
              <Checkbox
                name="initialTreatment"
                onChange={handleSearchCondition}
                inline
              >
                初回治療
              </Checkbox>
              <Checkbox
                name="copilacations"
                onChange={handleSearchCondition}
                inline
                disabled
              >
                合併症
              </Checkbox>
              <Checkbox
                name="threeYearPrognosis"
                onChange={handleSearchCondition}
                inline
                disabled
              >
                3年予後
              </Checkbox>
              <Checkbox
                name="fiveYearPrognosis"
                onChange={handleSearchCondition}
                inline
                disabled
              >
                5年予後
              </Checkbox>
            </div>
            <div className="detail-column flex">
              <Button bsStyle="primary" onClick={() => submit('detail')}>
                表示更新
              </Button>
            </div>
          </div>
        </Jumbotron>
      </div>

      <div className={`search-result ${tableMode}`}>
        <UserTables
          userListJson={userListJson}
          search={search}
          noSearch={noSearch}
          setUserListJson={setUserListJson}
        />
      </div>
    </div>
  );
};
export default Patients;
