import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Glyphicon,
  Table,
} from 'react-bootstrap';
import apiAccess, { METHOD_TYPE, RESULT } from '../../common/ApiAccess';
import IconList from './IconList';

const makeTable = (props: {
  userListJson: string;
  search: string;
  noSearch: string;
  progressAndRecurrenceColumn: string;
}) => {
  interface userData {
    caseId: number;
    patientId: string;
    patientName: string;
    age: number;
    registedCancerGroup: string;
    startDate: string | null;
    lastUpdate: string;
    diagnosis: string;
    advancedStage: string;
    pathlogicalDiagnosis: string;
    initialTreatment: string[];
    copilacations: string[];
    progress: string[];
    postRelapseTreatment: string[];
    threeYearPrognosis: string[];
    fiveYearPrognosis: string[];
    status: string[];
  }
  interface userDataList {
    data: userData[];
  }
  const [userList, setUserList] = useState<userData[]>([]);
  const { userListJson, search, noSearch, progressAndRecurrenceColumn } = props;
  let userDataListJson: userDataList;

  useEffect(() => {
    if (userListJson.length > 0) {
      userDataListJson = JSON.parse(userListJson) as userDataList;
      setUserList(userDataListJson.data);
    }
  }, [userListJson]);

  const deletePatient = async (
    caseId: number,
    hisId: string,
    name: string
  ): Promise<void> => {
    // eslint-disable-next-line
    const result = confirm(
      `患者番号:${hisId} 氏名:${name} の患者を削除しても良いですか？`
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
        METHOD_TYPE.DELETE,
        `deleteCase/${caseId}`
      );

      if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        // eslint-disable-next-line no-alert
        alert('削除しました。');
        const index = userList.findIndex((user) => user.caseId === caseId);
        const userListCopy = userList.splice(0, userList.length);
        userListCopy.splice(index, 1);
        setUserList(userListCopy);
      } else {
        // eslint-disable-next-line no-alert
        alert('処理に失敗しました。');
      }
    }
  };

  return (
    <Table striped className="patients">
      <thead>
        <tr>
          <th>患者ID</th>
          <th>患者名</th>
          <th>年齢</th>
          <th className={search}>登録がん種</th>
          <th className={search}>初回治療開始日</th>
          <th className={noSearch}>
            初回治療開始日
            <br />
            ／最終更新日
          </th>
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
      </thead>
      <tbody>
        {userList.map((user) => (
          <tr key={user.caseId.toString()}>
            <td>{user.patientId}</td>
            <td>{user.patientName}</td>
            <td>{user.age}</td>
            <td className={search}>{user.registedCancerGroup}</td>
            <td className={search}>{user.startDate}</td>
            <td className={noSearch}>
              {user.startDate} <br /> {user.lastUpdate}
            </td>
            <td className={noSearch}>{user.diagnosis}</td>
            <td>{user.advancedStage}</td>
            <td className={search}>{user.pathlogicalDiagnosis}</td>
            <td className={search}>
              <IconList iconList={user.initialTreatment} />
            </td>
            <td className={search}>
              <IconList iconList={user.copilacations} />
            </td>
            <td className={progressAndRecurrenceColumn}>
              <IconList iconList={user.progress} />
            </td>
            <td className={progressAndRecurrenceColumn}>
              <IconList iconList={user.postRelapseTreatment} />
            </td>
            <td className={search}>
              {user.threeYearPrognosis && (
                <img src="./image/icon_3.png" alt="3" />
              )}
            </td>
            <td className={search}>
              {user.fiveYearPrognosis && (
                <img src="./image/icon_5.png" alt="5" />
              )}
            </td>
            <td className={noSearch}>
              <IconList iconList={user.status} />
            </td>
            <td>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button href={`/registration?id=${user.caseId}`}>
                    <Glyphicon glyph="edit" />
                  </Button>
                  <Button
                    onClick={() =>
                      deletePatient(
                        user.caseId,
                        user.patientId,
                        user.patientName
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
  );
};

export default makeTable;