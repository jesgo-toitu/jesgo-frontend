import React, { useState, useEffect, useCallback } from 'react';
import { Button, Nav, Navbar, NavItem } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { Const } from '../common/Const';
import Loading from '../components/CaseRegistration/Loading';
import { SystemMenu } from '../components/common/SystemMenu';
import { UserMenu } from '../components/common/UserMenu';
import StaffTables from '../components/Staff/StaffTables';
import { settingsFromApi } from './Settings';
import './Stafflist.css';

export const Stafflist = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('display_name') ?? '';
  const [facilityName, setFacilityName] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const f = async () => {
      setIsLoading(true);
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

      setIsLoading(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }, []);

  const clickCancel = useCallback(() => {
    navigate('/Patients');
  }, []);

  return (
    <>
      <div className="relative">
        <Navbar collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <img
                src="./image/logo.png"
                alt="JESGO"
                className="navbar-brand img"
              />
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem className="header-text">利用者管理</NavItem>
            </Nav>
            <Nav pullRight>
              <Navbar.Text>{facilityName}</Navbar.Text>
              <NavItem>
                <UserMenu title={userName} i={0} isConfirm={null} />
              </NavItem>
              <NavItem>
                <SystemMenu title="設定" i={0} isConfirm={null} />
              </NavItem>
              <NavItem>
                <Button onClick={clickCancel} bsStyle="primary" className="">
                  リストに戻る
                </Button>
              </NavItem>
              <Navbar.Text>Ver.{Const.VERSION}</Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className="search-result-staff">
          <StaffTables setIsLoading={setIsLoading} />
        </div>
      </div>
      {isLoading && <Loading />}
    </>
  );
};

export default Stafflist;
