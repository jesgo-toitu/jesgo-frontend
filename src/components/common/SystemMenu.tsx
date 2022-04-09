
import React, { useEffect } from "react";
import { SelectCallback } from "react-bootstrap";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { useNavigate } from "react-router-dom";


export const SystemMenu = (props: { title: string; i: number}) => {
  const { title, i } = props;
  const navigate = useNavigate()

  /// コントロールボタン メニュー選択イベントハンドラ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectMenuHandler: SelectCallback | undefined = (eventKey: any) => {

    if (typeof eventKey === 'string') {
      switch (eventKey) {
        case 'SystemMenu1':
          alert(eventKey)
          break;
        case 'SystemMenu2':
          alert(eventKey)
          break;
        default:
          alert(eventKey)
          break;
      }
    };
  }
  
  // className="glyphicon glyphicon-cog"

  return (
    <ButtonToolbar>
        <DropdownButton
          aria-hidden="true"
          bsSize="small"
          title={title}
          key={i}
          id={`dropdown-basic-${i}`}
          onSelect={selectMenuHandler}
        >
        <MenuItem disabled eventKey="SystemMenu1">利用者管理</MenuItem>
        <MenuItem disabled eventKey="SystemMenu2">システム設定</MenuItem>
        </DropdownButton>
    </ButtonToolbar>
  );
};

export default SystemMenu;

