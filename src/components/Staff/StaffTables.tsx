import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Glyphicon,
  Table,
} from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import apiAccess, { METHOD_TYPE, RESULT } from '../../common/ApiAccess';
import { staffData } from '../../views/Stafflist';
import StaffEditModalDialog from './StaffEditModal';

let insert:boolean = false;
let srcData:staffData | undefined = undefined;


const makeTable = (props: {
}) => {

  interface staffDataList {
    data: staffData[];
  }

  const navigate = useNavigate();
  const [ show, setShow] = useState(false);
  const [ staffList, setStaffList] = useState<staffData[]>([]);
  const [ update, setUpdate ] = useState(false);

//  const { staffListJson } = props;
  let staffDataListJson: staffDataList;
  const url: string = useLocation().search;



  useEffect(() => {

    console.log("makeTable");
  
    ReadStaffData();

  }, [update]);

  const ReadStaffData = () =>{
    const f = async () => {
      // jesgo_user list
      const returnApiObject = await apiAccess(
        METHOD_TYPE.GET,
        `userlist${url}`
      );
      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
          console.log("userList API call");
          console.log(returnApiObject.body);
          staffDataListJson = JSON.parse(JSON.stringify(returnApiObject.body)) as staffDataList;
          console.log(staffDataListJson.data.length);
          setStaffList([...staffDataListJson.data]);
      } else {
        navigate('/login');
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    f();
  }

  const addStaff = () =>{
    insert = true;
    srcData = undefined;
    setShow(true);
  }
  const editStaff = (data: staffData) => {
    insert = false;
    srcData = data;
    setShow(true);
  };

  const deleteStaff = async (
    userId: number,
    displayName: string,
    name: string
  ): Promise<void> => {
    // eslint-disable-next-line
    const result = confirm(
      `${name}:${displayName} を削除しても良いですか？`
    );
    if (result) {
      const token = localStorage.getItem('token');
      if (token == null) {
        // eslint-disable-next-line no-alert
        alert('処理に失敗しました。');
        return;
      }

      // 削除APIを呼ぶ
      const returnApiObject = await apiAccess(
        METHOD_TYPE.POST,
        `deleteUser/`,
        {user_id: userId}
      );
      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        // eslint-disable-next-line no-alert
        alert('削除しました。');
        setUpdate(prevState => !prevState);
      } else {
        // eslint-disable-next-line no-alert
        alert('削除に失敗しました。');
      }
    }
  };

  const modalHide = useCallback(() => {
    // nsetShow(false);
    },[setShow]
  );

  const modalOk = () => {
    setUpdate(prevState => !prevState);
    setShow(false);
  };

  const modalCancel= useCallback(() => {
    setUpdate(prevState => !prevState);
    setShow(false);
    },[setShow]
  );

  const convertRollName = ( rollId: number) =>{
    var rollName = '';
    switch(rollId){
      case 0:
        rollName = "システム管理者";
        break;
      case 1:
        rollName = "システムオペレーター";
        break;
      case 100:
        rollName = "上級ユーザー";
        break;
      case 101:
        rollName = "一般ユーザー";
        break;
      case 1000:
        rollName = "退職者";
        break;
      default:
        rollName = "";
        break;
    }
    return rollName;
  }

  return (
    <>
      <div className="">
        <div className="search-form-closed flex">
          <Button bsStyle="primary" 
                  className="normal-button"
                  onClick={() => addStaff() }
                  >
            新規作成
          </Button>
        </div>
      </div>    
      <Table>
        <thead style={{position:'sticky'}}>
          <tr>
            <th>ログイン名</th>
            <th>表示名称</th>
            <th>権限</th>
            <th>編集/削除</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff.user_id.toString()}>
              <td>{staff.name}</td>
              <td>{staff.display_name}</td>
              <td>{convertRollName(staff.roll_id)}</td>
              <td>
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button 
                      onClick={() =>
                          editStaff(
                            staff
                          )
                        }
                      >
                      <Glyphicon glyph="edit" />
                    </Button>
                    <Button
                      onClick={() =>
                        deleteStaff(
                          staff.user_id,
                          staff.name,
                          staff.display_name
                        )
                      }
                    >
                      <Glyphicon glyph="trash" />
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <StaffEditModalDialog 
        show={show} 
        onHide={() => modalHide()}
        onOk={modalOk}
        onCancel={() => modalCancel()}
        title="JESGO ユーザー登録・編集"
        insert={insert}
        data={srcData}
      />
    </>
  );
};

export default makeTable;