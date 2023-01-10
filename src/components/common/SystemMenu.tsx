import React, { useCallback } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { useNavigate } from 'react-router-dom';
import { RemoveBeforeUnloadEvent } from '../../common/CommonUtility';

export const SystemMenu = (props: {
  title: string;
  i: number;
  isConfirm: (() => boolean) | null;
}) => {
  const { title, i, isConfirm = null } = props;
  const navigate = useNavigate();

  const handlUserMaintenance = () => {
    if (isConfirm === null || isConfirm()) {
      const auth = localStorage.getItem('is_system_manage_roll');
      if (auth === 'true') {
        RemoveBeforeUnloadEvent();
        navigate('/Stafflist');
      }
      // eslint-disable-next-line no-alert
      else alert('権限がありません');
    }
  };

  const handlSystemSettings = () => {
    if (isConfirm === null || isConfirm()) {
      const auth = localStorage.getItem('is_system_manage_roll');
      if (auth === 'true') {
        RemoveBeforeUnloadEvent();
        navigate('/Settings');
      }
      // eslint-disable-next-line no-alert
      else alert('権限がありません');
    }
  };

  const handlSchemaManager = useCallback(() => {
    if (isConfirm === null || isConfirm()) {
      const auth = localStorage.getItem('is_system_manage_roll');
      if (auth === 'true') {
        RemoveBeforeUnloadEvent();
        navigate('/SchemaManager');
      }
      // eslint-disable-next-line no-alert
      else alert('権限がありません');
    }
  }, []);

  const handlPluginManager = useCallback(() => {
    // TODO: プラグイン管理画面を開ける権限はまた別途あるので修正必要あり
    if (isConfirm === null || isConfirm()) {
      const auth = localStorage.getItem('is_system_manage_roll');
      if (auth === 'true') {
        RemoveBeforeUnloadEvent();
        navigate('/PluginManager');
      }
      // eslint-disable-next-line no-alert
      else alert('権限がありません');
    }
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
        <MenuItem onSelect={handlSchemaManager}>スキーマ管理</MenuItem>
        <MenuItem onSelect={handlPluginManager}>プラグイン管理</MenuItem>
        <MenuItem onSelect={handlSystemSettings}>システム設定</MenuItem>
      </DropdownButton>
    </ButtonToolbar>
  );
};

export default SystemMenu;
