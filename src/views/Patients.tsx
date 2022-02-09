import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from "axios";
import "./Patients.css";
import { Navbar, Button, FormControl, FormGroup, ControlLabel, Label, Grid, Row, Col, Panel, Checkbox, Nav, NavItem, ButtonToolbar, ButtonGroup, Glyphicon, Jumbotron, Table } from 'react-bootstrap';

export const Patients = () => {
    const [searchWord, setSearchWord] = useState('');
    const navigate = useNavigate();
    const [searchFormClose, setSearchFormClose] = useState('search-form-closed flex');
    const [searchFormOpen, setSearchFormOpen] = useState('hidden');
    const [simpleSearchButtons, setSimpleSearchButtons] = useState('hidden');
    const [detailSearchOpen, setDetailSearchOpen] = useState('hidden');
    const [noSearch, setNoSearch] = useState('table-cell');
    const [search, setSearch] = useState('hidden');

    const changeView = (type: string) => {
        switch (type) {
            case "close":
                setSearchFormClose('search-form-closed flex');
                setSearchFormOpen('hidden');
                setSimpleSearchButtons('hidden');
                setDetailSearchOpen('hidden');
                setNoSearch('table-cell');
                setSearch('hidden')
                break;

            case "simpleSearch":
                setSearchFormClose('hidden');
                setSearchFormOpen('search-form-opened block');
                setSimpleSearchButtons('block');
                setDetailSearchOpen('hidden');
                setNoSearch('hidden');
                setSearch('table-cell')
                break;

            case "detailSearch":
                setSearchFormClose('hidden');
                setSearchFormOpen('search-form-opened block');
                setSimpleSearchButtons('hidden');
                setDetailSearchOpen('detail-form-opened block');
                setNoSearch('hidden');
                setSearch('table-cell')
                break;

            default:

        }

    }
    //    const dispatch = useAuthDispatch();
    /*
        const memberList = (list) => {
            const memberList = list.map((member, index) => {
                return (
                    <li>
                        {member.name} {member.age}
                    </li>
                );
            });
    
            return <ul>{memberList}</ul>;
        }
    */

    /*
console.log('submit:');
const token = localStorage.getItem("token");
if (token == null) {
    navigate("/login");
    return (<Navigate to="/login" />);
}

axios.get("http://localhost:3000/search/", { headers: { token: token } })
    .then((response) => {
        (response);
        console.log(response.data);
        alert(`メッセージ：${response.data}`);
    }).catch((err) => {
        return (<Navigate to="/login" />);
    });
*/


    return (
        <div>
            <Navbar collapseOnSelect>
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

            <div className="search-form-outer">
                <div className={searchFormClose}>
                    <ButtonToolbar>
                        <ButtonGroup>
                            <Button onClick={() => changeView('simpleSearch')}>
                                <Glyphicon glyph="search" />
                            </Button>
                            <Button onClick={() => changeView('detailSearch')}>
                                <Glyphicon glyph="eye-open" />
                            </Button>
                            <Button>
                                <Glyphicon glyph="edit" />
                            </Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                    <div className='spacer10'></div>
                    <Button bsStyle="primary">新規作成</Button>
                </div>
                <Jumbotron className={searchFormOpen}>
                    <div>
                        登録年次：
                        <FormControl componentClass="select">
                            <option value="2022">2022年</option>
                            <option value="2021">2021年</option>
                            <option value="2020">2020年</option>
                        </FormControl>
                        <div className='spacer10'></div>
                        がん種：
                        <FormControl componentClass="select">
                            <option value="all">すべて</option>
                            <option value="cervical">子宮頸がん</option>
                        </FormControl>
                        <div className='spacer10'></div>
                        <Checkbox inline>腫瘍登録対象のみ表示</Checkbox>
                    </div>
                    <div className={simpleSearchButtons}>
                        <a href="#" onClick={() => changeView('detailSearch')}><span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span>詳細表示設定</a>
                        <div className='spacer10'></div>
                        <div className='spacer10'></div>
                        <a href="/"><span className="glyphicon glyphicon-search" aria-hidden="true"></span>検索</a>
                    </div>
                    <div className={detailSearchOpen}>
                        <div className='detail-column'>
                            <span className="detail-setting-icon glyphicon glyphicon-eye-open" aria-hidden="true"></span><span className='detail-setting-text'>詳細表示設定：</span>
                        </div>
                        <div className='detail-column'>
                            <Checkbox inline><span className='detail-setting-content'>初回治療開始日：</span></Checkbox>
                            <FormControl componentClass="select">
                                <option value="202101">2021-01</option>
                                <option value="202102">2021-02</option>
                                <option value="202103">2021-03</option>
                            </FormControl>
                            ～
                            <FormControl componentClass="select">
                                <option value="202110">2021-10</option>
                                <option value="202111">2021-11</option>
                                <option value="202112">2021-12</option>
                            </FormControl>
                        </div>
                        <div className='detail-column'>
                            <Checkbox inline><span className='detail-setting-content'>未入力項目で絞り込み：</span></Checkbox>
                            <Checkbox inline>進行期</Checkbox>
                            <Checkbox inline>病理診断</Checkbox>
                            <Checkbox inline>初回治療</Checkbox>
                            <Checkbox inline>合併症</Checkbox>
                            <Checkbox inline>3年予後</Checkbox>
                            <Checkbox inline>5年予後</Checkbox>
                        </div>
                        <div className='detail-column flex'>
                            <Checkbox inline><span className='detail-setting-content'>経過・再発情報を表示する</span></Checkbox>
                            <Button bsStyle="primary" onClick={() => changeView('close')}>表示更新</Button>
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
                        <th className={search}>経過</th>
                        <th className={search}>再発後治療</th>
                        <th className={search}>3年予後</th>
                        <th className={search}>5年予後</th>
                        <th className={noSearch}>ステータス</th>
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
                        <td className={search}>
                            <img src="./image/icon_keika.png" alt="経過" />
                            <img src="./image/icon_sai.png" alt="再発" />
                        </td>
                        <td className={search}>

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
                        <td className={search}>
                            <img src="./image/icon_keika.png" alt="経過" />
                            <img src="./image/icon_sai.png" alt="再発" />
                        </td>
                        <td className={search}>

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
                        <td className={search}>
                            <img src="./image/icon_keika.png" alt="経過" />
                            <img src="./image/icon_sai.png" alt="再発" />
                        </td>
                        <td className={search}>

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
                    </tr>
                </Table>
            </div>

        </div>
    );
}