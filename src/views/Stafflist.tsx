import React, { useState, useEffect, useCallback } from 'react';
import { Button, Nav, Navbar, NavItem } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';
import { SystemMenu } from '../components/common/SystemMenu';
import { UserMenu } from '../components/common/UserMenu';
import StaffEditModalDialog from '../components/Staff/StaffEditModal';
import StaffTables from '../components/Staff/StaffTables';
import './Stafflist.css';

export type staffData = {
  user_id: number;
  name: string;
  display_name: string;
  roll_id: number;
};

export const Stafflist = () => {
  const navigate = useNavigate();
  const url: string = useLocation().search;
  const userName = localStorage.getItem('display_name')!;
  const [staffListJson, setStaffListJson] = useState('');
  const [show, setShow] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {}, []);

  const clickCancel = useCallback(() => {
    navigate('/Patients');
  }, []);

  return (
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
            <NavItem>
              <UserMenu title={userName} i={0} />
            </NavItem>
            <NavItem>
              <SystemMenu title="設定" i={0} />
            </NavItem>
            <NavItem>
              <Button onClick={clickCancel} bsStyle="primary" className="">
                リストに戻る
              </Button>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="search-result-staff">
        <StaffTables />
      </div>
    </div>
  );
};

export default Stafflist;
