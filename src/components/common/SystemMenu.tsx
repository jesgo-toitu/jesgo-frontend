import React, { useCallback } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { useNavigate } from 'react-router-dom';
import { isStaffEditEnable } from '../../common/StaffMaster';

export const SystemMenu = (props: { title: string; i: number }) => {
  const { title, i } = props;
  const navigate = useNavigate();

  const handlUserMaintenance = useCallback(() => {
    const auth = localStorage.getItem('is_system_manage_roll');
    if (auth === 'true') navigate('/Stafflist');
    // eslint-disable-next-line no-alert
    else alert('権限がありません');
  }, []);

  const handlSystemSettings = useCallback(() => {
    const auth = localStorage.getItem('is_system_manage_roll');
    if (auth === 'true') navigate('/Settings');
    // eslint-disable-next-line no-alert
    else alert('権限がありません');
  }, []);

  return (
    <ButtonToolbar>
      <DropdownButton
        aria-hidden="true"
        bsSize="small"
        title={title}
        key={i}
        id={`dropdown-basic-${i}`}
      >
        <MenuItem onSelect={handlUserMaintenance}>利用者管理</MenuItem>
        <MenuItem onSelect={handlSystemSettings}>システム設定</MenuItem>
      </DropdownButton>
    </ButtonToolbar>
  );
};

export default SystemMenu;
