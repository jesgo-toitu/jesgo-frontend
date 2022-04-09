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
import UserTables from '../components/Patients/UserTables';
import './Patients.css';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import UserMenu from '../components/common/UserMenu';
import SystemMenu from '../components/common/SystemMenu';

const Patients = () => {
  const navigate = useNavigate();
  const url: string = useLocation().search;
  const userName = localStorage.getItem('display_name')!;
  const [searchFormOpen, setSearchFormOpen] = useState('hidden');
  const [simpleSearchButtons, setSimpleSearchButtons] = useState('hidden');
  const [detailSearchOpen, setDetailSearchOpen] = useState('hidden');
  const [noSearch, setNoSearch] = useState('table-cell');
  const [search, setSearch] = useState('hidden');
  const [progressAndRecurrenceColumn, setProgressAndRecurrenceColumn] =
    useState('hidden');
  const [listMode, setListMode] = useState(['blue', '']);
  const [userListJson, setUserListJson] = useState('');

  useEffect(() => {
    const f = async () => {
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

  const [searchWord, setSearchWord] = useState({
    registrationYear: 'all',
    cancerType: 'all',
    showOnlyTumorRegistry: false,
    startOfTreatmentStartDate: '202101',
    endOfTreatmentStartDate: '202110',
    checkOfTreatmentStartDate: false,
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
        break;

      case 'simpleSearch':
        setSearchFormOpen('search-form-opened block');
        setSimpleSearchButtons('block');
        setDetailSearchOpen('hidden');
        break;

      case 'detailSearch':
        setSearchFormOpen('search-form-opened block');
        setSimpleSearchButtons('hidden');
        setDetailSearchOpen('detail-form-opened block');
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
      case 'registrationYear':
        setSearchWord({ ...searchWord, registrationYear: eventTarget.value });
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

      case 'checkOfTreatmentStartDate':
        setSearchWord({
          ...searchWord,
          checkOfTreatmentStartDate: eventTarget.checked,
        });
        break;

      case 'startOfTreatmentStartDate':
        setSearchWord({
          ...searchWord,
          startOfTreatmentStartDate: eventTarget.value,
        });
        break;

      case 'endOfTreatmentStartDate':
        setSearchWord({
          ...searchWord,
          endOfTreatmentStartDate: eventTarget.value,
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
      query += `&registrationYear=${encodeURIComponent(
        searchWord.registrationYear
      )}`;
      query += `&cancerType=${encodeURIComponent(searchWord.cancerType)}`;
      query += `&showOnlyTumorRegistry=${encodeURIComponent(
        searchWord.showOnlyTumorRegistry
      )}`;

      if (type === 'detail') {
        if (searchWord.checkOfTreatmentStartDate) {
          query += `&startOfTreatmentStartDate=${encodeURIComponent(
            searchWord.startOfTreatmentStartDate
          )}`;
          query += `&endOfTreatmentStartDate=${encodeURIComponent(
            searchWord.endOfTreatmentStartDate
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
      navigate(`/patients?${param}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative">
      <Navbar collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <img src="./image/logo.png" alt="JESGO" />
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem
              eventKey={1}
              href="#"
              className={listMode[0]}
              onClick={() => changeListColumn(false)}
            >
              患者リスト表示
            </NavItem>
            <NavItem
              eventKey={2}
              href="#"
              className={listMode[1]}
              onClick={() => changeListColumn(true)}
            >
              腫瘍登録管理表示
            </NavItem>
          </Nav>
          <Nav pullRight>
            <NavItem>
              <UserMenu
                title={userName}
                i={0}
                />
              </NavItem>
              <NavItem>
                <SystemMenu
                  title='設定'
                  i={0}
                  />                
              </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="page-menu">
        <div className="search-form-closed flex">
          <ButtonToolbar>
            <ButtonGroup>
              <Button onClick={() => changeView('simpleSearch')} >
                <Glyphicon glyph="search" />
              </Button>
              <Button onClick={() => changeView('detailSearch')} >
                <Glyphicon glyph="eye-open" />
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
          <div className="spacer10" />
          <Button bsStyle="primary" href="/registration" className="normal-button">
            新規作成
          </Button>
        </div>
      </div>
      <div className="search-form-outer">
        <Jumbotron className={searchFormOpen}>
          <div className="flex">
            登録年次：
            <FormControl
              name="registrationYear"
              onChange={handleSearchCondition}
              componentClass="select"
            >
              <option value="all">すべて</option>
              <option value="2022">2022年</option>
              <option value="2021">2021年</option>
              <option value="2020">2020年</option>
            </FormControl>
            <div className="spacer10" />
            がん種：
            <FormControl
              name="cancerType"
              onChange={handleSearchCondition}
              componentClass="select"
            >
              <option value="all">すべて</option>
              <option value="cervical">子宮頸がん</option>
              <option value="endometrial">子宮体がん</option>
              <option value="ovarian">卵巣がん</option>
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
                name="checkOfTreatmentStartDate"
                onChange={handleSearchCondition}
                inline
              >
                <span className="detail-setting-content">初回治療開始日：</span>
              </Checkbox>
              <FormControl
                name="startOfTreatmentStartDate"
                onChange={handleSearchCondition}
                componentClass="select"
              >
                <option value="202101">2021-01</option>
                <option value="202102">2021-02</option>
                <option value="202103">2021-03</option>
              </FormControl>
              ～
              <FormControl
                name="endOfTreatmentStartDate"
                onChange={handleSearchCondition}
                componentClass="select"
              >
                <option value="202110">2021-10</option>
                <option value="202111">2021-11</option>
                <option value="202112">2021-12</option>
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
                病理診断
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
              >
                合併症
              </Checkbox>
              <Checkbox
                name="threeYearPrognosis"
                onChange={handleSearchCondition}
                inline
              >
                3年予後
              </Checkbox>
              <Checkbox
                name="fiveYearPrognosis"
                onChange={handleSearchCondition}
                inline
              >
                5年予後
              </Checkbox>
            </div>
            <div className="detail-column flex">
              <Checkbox
                name="showProgressAndRecurrence"
                onChange={handleSearchCondition}
                inline
              >
                <span className="detail-setting-content">
                  経過・再発情報を表示する
                </span>
              </Checkbox>
              <Button bsStyle="primary" onClick={() => submit('detail')}>
                表示更新
              </Button>
            </div>
          </div>
        </Jumbotron>
      </div>

      <div className="search-result">
        <UserTables
          userListJson={userListJson}
          search={search}
          noSearch={noSearch}
          progressAndRecurrenceColumn={progressAndRecurrenceColumn}
        />
      </div>
    </div>
  );
};
export default Patients;
