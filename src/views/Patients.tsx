import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from "axios";
import { UserTables } from '../components/Patients/UserTables'
import "./Patients.css";
import { Navbar, Button, FormControl, FormGroup, ControlLabel, Label, Grid, Row, Col, Panel, Checkbox, Nav, NavItem, ButtonToolbar, ButtonGroup, Glyphicon, Jumbotron, Table } from 'react-bootstrap';


export function Patients() {
    useEffect(() => {
        console.log('firstload');

        const token = localStorage.getItem("token");
        if (token == null) {
            navigate("/login");
            return;
        }
        axios.get("http://localhost:3000/search/", { headers: { token: token } })
            .then((response) => {
                (response);
                console.log(response.data);
                // ★TODO: 仮データ受信
                setUserListJson('{"data": [{"patientId": "1122-34","patientName": "JSON太郎","age": 35,"registedCancerGroup": "子宮頸がん","startDate": "2022-02-05","lastUpdate": "2022-03-04","diagnosis": "子宮頸がん","advancedStage": "IA","pathlogicalDiagnosis": "角化型扁平上皮癌","initialTreatment": "ope","copilacations": "gou","progress": "keika","postRelapseTreatment": "","threeYearPrognosis": "3","fiveYearPrognosis": "","status": ["ope","gou","3"]},{"patientId": "1122-345","patientName": "JSON花子","age": 35,"registedCancerGroup": "子宮頸がん","startDate": "2021-02-05","lastUpdate": "2021-03-04","diagnosis": "子宮頸がん","advancedStage": "AA","pathlogicalDiagnosis": "角化型扁平上皮癌","initialTreatment": "","copilacations": "","progress": "","postRelapseTreatment": "sai","threeYearPrognosis": "","fiveYearPrognosis": "5","status": ["sai","5"]}]}')
            }).catch((err) => {
                navigate("/login");
            });
    }, [])

    const [searchWord, setSearchWord] = useState({
        registrationYear: "2022",
        cancetType: "all",
        showOnlyTumorRegistry: false,
        startOfTreatmentStartDate: "202101",
        endOfTreatmentStartDate: "202110",
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
    const navigate = useNavigate();
    const [searchFormOpen, setSearchFormOpen] = useState('hidden');
    const [simpleSearchButtons, setSimpleSearchButtons] = useState('hidden');
    const [detailSearchOpen, setDetailSearchOpen] = useState('hidden');
    const [noSearch, setNoSearch] = useState('table-cell');
    const [search, setSearch] = useState('hidden');
    const [progressAndRecurrenceColumn, setProgressAndRecurrenceColumn] = useState('hidden');
    const [userListJson, setUserListJson] = useState('');

    const setShowProgressAndRecurrence = (check: boolean, searchStyle: string) => {
        console.log("check = " + check + ", search = " + search);
        if (check && (searchStyle == 'table-cell')) {
            setProgressAndRecurrenceColumn('table-cell');
        } else {
            setProgressAndRecurrenceColumn('hidden');
        }
    }

    const changeView = (type: string) => {
        switch (type) {
            case "close":
                setSearchFormOpen('hidden');
                setSimpleSearchButtons('hidden');
                setDetailSearchOpen('hidden');
                setNoSearch('table-cell');
                setSearch('hidden');
                setShowProgressAndRecurrence(searchWord.showProgressAndRecurrence, 'hidden');
                break;

            case "simpleSearch":
                setSearchFormOpen('search-form-opened block');
                setSimpleSearchButtons('block');
                setDetailSearchOpen('hidden');
                setNoSearch('hidden');
                setSearch('table-cell');
                setShowProgressAndRecurrence(searchWord.showProgressAndRecurrence, 'table-cell');
                break;

            case "detailSearch":
                setSearchFormOpen('search-form-opened block');
                setSimpleSearchButtons('hidden');
                setDetailSearchOpen('detail-form-opened block');
                setNoSearch('hidden');
                setSearch('table-cell');
                setShowProgressAndRecurrence(searchWord.showProgressAndRecurrence, 'table-cell');
                break;

            default:
        }



    }

    const handleSearchCondition = (event: any) => {
        let blankFields = searchWord.blankFields;
        switch (event.target.name) {
            case "registrationYear":
                setSearchWord({ ...searchWord, registrationYear: event.target.value });
                break;

            case "cancetType":
                setSearchWord({ ...searchWord, cancetType: event.target.value });
                break;

            case "showOnlyTumorRegistry":
                setSearchWord({ ...searchWord, showOnlyTumorRegistry: event.target.checked });
                break;

            case "checkOfTreatmentStartDate":
                setSearchWord({ ...searchWord, checkOfTreatmentStartDate: event.target.checked });
                break;

            case "startOfTreatmentStartDate":
                setSearchWord({ ...searchWord, startOfTreatmentStartDate: event.target.value });
                break;

            case "endOfTreatmentStartDate":
                setSearchWord({ ...searchWord, endOfTreatmentStartDate: event.target.value });
                break;

            case "checkOfBlankFields":
                setSearchWord({ ...searchWord, checkOfBlankFields: event.target.checked });
                break;

            case "advancedStage":
                blankFields = { ...blankFields, advancedStage: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "pathlogicalDiagnosis":
                blankFields = { ...blankFields, pathlogicalDiagnosis: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "initialTreatment":
                blankFields = { ...blankFields, initialTreatment: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "copilacations":
                blankFields = { ...blankFields, copilacations: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "threeYearPrognosis":
                blankFields = { ...blankFields, threeYearPrognosis: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "fiveYearPrognosis":
                blankFields = { ...blankFields, fiveYearPrognosis: event.target.checked };
                setSearchWord({ ...searchWord, blankFields: blankFields });
                break;

            case "showProgressAndRecurrence":
                setSearchWord({ ...searchWord, showProgressAndRecurrence: event.target.checked });
                setShowProgressAndRecurrence(event.target.checked, search);
                break;
            default:

        }
        console.log(searchWord);
    }

    const submit = (type: string) => {
        const token = localStorage.getItem("token");
        if (token == null) {
            navigate("/login");
            return;
        }

        const param: string = makeQueryString(type);

        axios.get("http://localhost:3000/search?" + param, { headers: { token: token } })
            .then((response) => {
                (response);
                console.log(response.data);
                // ★TODO: 仮データ受信
                setUserListJson('{"data": [{"patientId": "1122-34","patientName": "検索済太郎","age": 35,"registedCancerGroup": "子宮頸がん","startDate": "2022-02-05","lastUpdate": "2022-03-04","diagnosis": "子宮頸がん","advancedStage": "IA","pathlogicalDiagnosis": "角化型扁平上皮癌","initialTreatment": "ope","copilacations": "gou","progress": "keika","postRelapseTreatment": "","threeYearPrognosis": "3","fiveYearPrognosis": "","status": ["ope","gou","3"]},{"patientId": "1122-345","patientName": "JSON花子","age": 35,"registedCancerGroup": "子宮頸がん","startDate": "2021-02-05","lastUpdate": "2021-03-04","diagnosis": "子宮頸がん","advancedStage": "AA","pathlogicalDiagnosis": "角化型扁平上皮癌","initialTreatment": "","copilacations": "","progress": "","postRelapseTreatment": "sai","threeYearPrognosis": "","fiveYearPrognosis": "5","status": ["sai","5"]}]}');
                navigate("/patients?" + param);
            }).catch((err) => {
                navigate("/login");
            });
    }

    const makeQueryString = (type: string) => {
        let query = "type=" + type;
        query += "&registrationYear=" + encodeURIComponent(searchWord.registrationYear);
        query += "&cancetType=" + encodeURIComponent(searchWord.cancetType);
        query += "&showOnlyTumorRegistry=" + encodeURIComponent(searchWord.showOnlyTumorRegistry);
        console.log("makequery");
        console.log(type);
        console.log(searchWord.checkOfTreatmentStartDate);

        console.log(searchWord.checkOfBlankFields);

        if (type == "detail") {
            if (searchWord.checkOfTreatmentStartDate) {
                query += "&startOfTreatmentStartDate=" + encodeURIComponent(searchWord.startOfTreatmentStartDate);
                query += "&endOfTreatmentStartDate=" + encodeURIComponent(searchWord.endOfTreatmentStartDate);
            }

            if (searchWord.checkOfBlankFields) {
                query += "&advancedStage=" + encodeURIComponent(searchWord.blankFields.advancedStage);
                query += "&pathlogicalDiagnosis=" + encodeURIComponent(searchWord.blankFields.pathlogicalDiagnosis);
                query += "&initialTreatment=" + encodeURIComponent(searchWord.blankFields.initialTreatment);
                query += "&copilacations=" + encodeURIComponent(searchWord.blankFields.copilacations);
                query += "&threeYearPrognosis=" + encodeURIComponent(searchWord.blankFields.threeYearPrognosis);
                query += "&fiveYearPrognosis=" + encodeURIComponent(searchWord.blankFields.fiveYearPrognosis);
            }
        }

        console.log(query);
        return query;
    }

    return (
        <div className='relative'>
            <Navbar collapseOnSelect fixedTop>
                <Navbar.Header>
                    <Navbar.Brand>
                        <img src="./image/logo.png" alt="JESGO" />
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <Navbar.Text>
                            患者リスト表示
                        </Navbar.Text>
                        <NavItem eventKey={2} href="#">
                            腫瘍登録管理表示
                        </NavItem>
                    </Nav>
                    <Nav pullRight>
                        <Navbar.Text>
                            ○○病院
                        </Navbar.Text>
                        <Navbar.Text>
                            田中太郎
                        </Navbar.Text>
                        <NavItem eventKey={3} href="#">
                            <span className="glyphicon glyphicon-cog" aria-hidden="true"></span>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <div className="page-menu">
                <div className="search-form-closed flex">
                    <ButtonToolbar>
                        <ButtonGroup>
                            <Button onClick={() => changeView('simpleSearch')}>
                                <Glyphicon glyph="search" />
                            </Button>
                            <Button onClick={() => changeView('detailSearch')}>
                                <Glyphicon glyph="eye-open" />
                            </Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                    <div className='spacer10'></div>
                    <Button bsStyle="primary" href={"/registration"}>新規作成</Button>
                </div>
            </div>
            <div className="search-form-outer">
                <Jumbotron className={searchFormOpen}>
                    <div className='flex'>
                        登録年次：
                        <FormControl name="registrationYear" onChange={handleSearchCondition} componentClass="select">
                            <option value="2022">2022年</option>
                            <option value="2021">2021年</option>
                            <option value="2020">2020年</option>
                        </FormControl>
                        <div className='spacer10'></div>
                        がん種：
                        <FormControl name="cancetType" onChange={handleSearchCondition} componentClass="select">
                            <option value="all">すべて</option>
                            <option value="cervical">子宮頸がん</option>
                        </FormControl>
                        <div className='spacer10'></div>
                        <Checkbox name="showOnlyTumorRegistry" onChange={handleSearchCondition} inline>腫瘍登録対象のみ表示</Checkbox>
                        <div className='close-icon'><a href="#" onClick={() => changeView('close')}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>
                    </div>
                    <div className={simpleSearchButtons}>
                        <a href="#" onClick={() => changeView('detailSearch')}><span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span>詳細表示設定</a>
                        <div className='spacer10'></div>
                        <div className='spacer10'></div>
                        <a href="#" onClick={() => submit("search")}><span className="glyphicon glyphicon-search" aria-hidden="true"></span>検索</a>
                    </div>
                    <div className={detailSearchOpen}>
                        <div className='detail-column'>
                            <span className="detail-setting-icon glyphicon glyphicon-eye-open" aria-hidden="true"></span><span className='detail-setting-text'>詳細表示設定：</span>
                        </div>
                        <div className='detail-column'>
                            <Checkbox name="checkOfTreatmentStartDate" onChange={handleSearchCondition} inline><span className='detail-setting-content'>初回治療開始日：</span></Checkbox>
                            <FormControl name="startOfTreatmentStartDate" onChange={handleSearchCondition} componentClass="select">
                                <option value="202101">2021-01</option>
                                <option value="202102">2021-02</option>
                                <option value="202103">2021-03</option>
                            </FormControl>
                            ～
                            <FormControl name="endOfTreatmentStartDate" onChange={handleSearchCondition} componentClass="select">
                                <option value="202110">2021-10</option>
                                <option value="202111">2021-11</option>
                                <option value="202112">2021-12</option>
                            </FormControl>
                        </div>
                        <div className='detail-column'>
                            <Checkbox name="checkOfBlankFields" onChange={handleSearchCondition} inline><span className='detail-setting-content'>未入力項目で絞り込み：</span></Checkbox>
                            <Checkbox name="advancedStage" onChange={handleSearchCondition} inline>進行期</Checkbox>
                            <Checkbox name="pathlogicalDiagnosis" onChange={handleSearchCondition} inline>病理診断</Checkbox>
                            <Checkbox name="initialTreatment" onChange={handleSearchCondition} inline>初回治療</Checkbox>
                            <Checkbox name="copilacations" onChange={handleSearchCondition} inline>合併症</Checkbox>
                            <Checkbox name="threeYearPrognosis" onChange={handleSearchCondition} inline>3年予後</Checkbox>
                            <Checkbox name="fiveYearPrognosis" onChange={handleSearchCondition} inline>5年予後</Checkbox>
                        </div>
                        <div className='detail-column flex'>
                            <Checkbox name="showProgressAndRecurrence" onChange={handleSearchCondition} inline><span className='detail-setting-content'>経過・再発情報を表示する</span></Checkbox>
                            <Button bsStyle="primary" onClick={() => submit('detail')}>表示更新</Button>
                        </div>
                    </div>
                </Jumbotron>

            </div>

            <div className='search-result'>
                <Table striped className='patients'>
                    <tr>
                        <th>患者ID</th>
                        <th>患者名</th>
                        <th>年齢</th>
                        <th className={search}>登録がん種</th>
                        <th className={search}>初回治療開始日</th>
                        <th className={noSearch}>初回治療開始日<br />／最終更新日</th>
                        <th className={noSearch}>診断</th>
                        <th>進行期</th>
                        <th className={search}>病理診断</th>
                        <th className={search}>初回治療</th>
                        <th className={search}>合併症</th>
                        <th className={progressAndRecurrenceColumn}>経過</th>
                        <th className={progressAndRecurrenceColumn}>再発後治療</th>
                        <th className={search}>3年予後</th>
                        <th className={search}>5年予後</th>
                        <th className={noSearch}>ステータス</th>
                        <th>編集/削除</th>
                    </tr>
                    <UserTables.makeTable userListJson={userListJson} search={search} noSearch={noSearch} progressAndRecurrenceColumn={progressAndRecurrenceColumn} />
                    {
                        [1, 2, 3, 4, 5].map((value) =>
                            <>
                                <tr>
                                    <td>a-3456-7</td>
                                    <td>北都　太郎</td>
                                    <td>40</td>
                                    <td className={search}>子宮頸がん</td>
                                    <td className={search}>2021-10-10</td>
                                    <td className={noSearch}>2021-10-10<br />2022-01-05</td>
                                    <td className={noSearch}>子宮頸がん</td>
                                    <td>IA</td>
                                    <td className={search}>角化型扁平上皮癌</td>
                                    <td className={search}>
                                        <img src="./image/icon_ope.png" alt="手" />
                                    </td>
                                    <td className={search}>なし</td>
                                    <td className={progressAndRecurrenceColumn}>
                                        <img src="./image/icon_keika.png" alt="経過" />
                                        <img src="./image/icon_sai.png" alt="再発" />
                                    </td>
                                    <td className={progressAndRecurrenceColumn}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={noSearch}>
                                        <img src="./image/icon_keika.png" alt="経過" />
                                        <img src="./image/icon_ope.png" alt="手" />
                                        <img src="./image/icon_up.png" alt="上" />
                                        <img src="./image/icon_sai.png" alt="再発" />
                                    </td>
                                    <td>
                                        <ButtonToolbar>
                                            <ButtonGroup>
                                                <Button href='/registration?id=1'>
                                                    <Glyphicon glyph="edit" />
                                                </Button>
                                                <Button>
                                                    <Glyphicon glyph="trash" />
                                                </Button>
                                            </ButtonGroup>
                                        </ButtonToolbar>
                                    </td>
                                </tr>
                                <tr>
                                    <td>12-3456-7</td>
                                    <td>北都　太郎</td>
                                    <td>40</td>
                                    <td className={search}>子宮頸がん</td>
                                    <td className={search}>2021-10-10</td>
                                    <td className={noSearch}>2021-10-10<br />2022-01-05</td>
                                    <td className={noSearch}>子宮頸がん</td>
                                    <td>IA</td>
                                    <td className={search}>角化型扁平上皮癌</td>
                                    <td className={search}>
                                        <img src="./image/icon_ope.png" alt="手" />
                                    </td>
                                    <td className={search}>なし</td>
                                    <td className={progressAndRecurrenceColumn}>
                                        <img src="./image/icon_keika.png" alt="経過" />
                                        <img src="./image/icon_sai.png" alt="再発" />
                                    </td>
                                    <td className={progressAndRecurrenceColumn}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={noSearch}>
                                        <img src="./image/icon_mi.png" alt="未" />
                                        <img src="./image/icon_chem.png" alt="化" />
                                        <img src="./image/icon_keika.png" alt="経過" />
                                    </td>
                                    <td>
                                        <ButtonToolbar>
                                            <ButtonGroup>
                                                <Button href='/registration?id=1'>
                                                    <Glyphicon glyph="edit" />
                                                </Button>
                                                <Button>
                                                    <Glyphicon glyph="trash" />
                                                </Button>
                                            </ButtonGroup>
                                        </ButtonToolbar>
                                    </td>
                                </tr>
                                <tr className='died'>
                                    <td>12-3456-7</td>
                                    <td>北都　太郎</td>
                                    <td>40</td>
                                    <td className={search}>子宮頸がん</td>
                                    <td className={search}>2021-10-10</td>
                                    <td className={noSearch}>2021-10-10<br />2022-01-05</td>
                                    <td className={noSearch}>子宮頸がん</td>
                                    <td>IA</td>
                                    <td className={search}>角化型扁平上皮癌</td>
                                    <td className={search}>
                                        <img src="./image/icon_ope.png" alt="手" />
                                    </td>
                                    <td className={search}>なし</td>
                                    <td className={progressAndRecurrenceColumn}>
                                        <img src="./image/icon_keika.png" alt="経過" />
                                        <img src="./image/icon_sai.png" alt="再発" />
                                    </td>
                                    <td className={progressAndRecurrenceColumn}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={search}>

                                    </td>
                                    <td className={noSearch}>
                                        <img src="./image/icon_gou.png" alt="合" />
                                        <img src="./image/icon_3.png" alt="3" />
                                        <img src="./image/icon_dead.png" alt="死亡" />
                                    </td>
                                    <td>
                                        <ButtonToolbar>
                                            <ButtonGroup>
                                                <Button href='/registration?id=1'>
                                                    <Glyphicon glyph="edit" />
                                                </Button>
                                                <Button>
                                                    <Glyphicon glyph="trash" />
                                                </Button>
                                            </ButtonGroup>
                                        </ButtonToolbar>
                                    </td>
                                </tr>
                            </>
                        )}
                </Table>
            </div>

        </div>
    );
}