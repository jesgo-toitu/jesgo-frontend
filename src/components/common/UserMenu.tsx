
import React, { useCallback, useEffect, useState } from "react";
import { Dropdown, SelectCallback } from "react-bootstrap";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { useNavigate } from "react-router-dom";
import InfoModal, { ModalDialog } from "./ModalDialog";

export const UserMenu = (props: { title: string; i: number}) => {
  const { title, i } = props;
  const navigate = useNavigate()
  const [show, setShow] = useState(false);


  const handleShow = useCallback(() => {
    setShow(true);
    },[setShow]
  );

  const handlPasswordChenge = useCallback(() => {
    navigate("/PasswordChange");
   },[]
  );

  const modalHide= useCallback(() => {
    setShow(false);
    },[setShow]
  );

  const modalOk= useCallback(() => {
    console.log('logout:');
    const token = localStorage.removeItem('token');     
    setShow(false);
    navigate('/login');
    },[setShow]
  );

  const modalCancel= useCallback(() => {
    setShow(false);
    },[setShow]
  );



  /// コントロールボタン メニュー選択イベントハンドラ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectMenuHandler: SelectCallback | undefined = (eventKey: any) => {
    if (typeof eventKey === 'string') {
        switch (eventKey) {
            case 'UserMenu1':
            alert(eventKey)
            break;
            case 'UserMenu2':
            // Logout
            //{handleChange}
            //alert(eventKey)
            // navigate('/logout');
            break;
            default:
            alert(eventKey)
            break;
        }
    };

  }
    return (
        <div>
            <ButtonToolbar>
                <DropdownButton
                    bsSize="small"
                    title={title}
                    key={i}
                    id={`dropdown-basic-${0}`}
                    onSelect={selectMenuHandler}
                >
                <MenuItem disabled
                          onSelect={handlPasswordChenge}>パスワード変更</MenuItem>
                <MenuItem onSelect={handleShow}>ログアウト</MenuItem>
                </DropdownButton>
            </ButtonToolbar>
            <ModalDialog 
                show={show} 
                onHide={() => modalHide()}
                onOk={() => modalOk()}
                onCancel={() => modalCancel()}
                title="JESGO"
                message="ログアウトしますか？"
            />
        </div>
    );
}

export default UserMenu
