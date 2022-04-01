import React from 'react';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from 'react-bootstrap';
import IconList from './IconList';

const makeTable = (props: {
  userListJson: string;
  search: string;
  noSearch: string;
  progressAndRecurrenceColumn: string;
}) => {
  interface userData {
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

  const { userListJson, search, noSearch, progressAndRecurrenceColumn } = props;
  let userDataListJson: userDataList;
  let userList: userData[] = [];
  if (userListJson.length > 0) {
    userDataListJson = JSON.parse(userListJson) as userDataList;
    userList = userDataListJson.data;
  }

  return (
    <>
      {userList.map((user) => (
        <tr>
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
            {user.fiveYearPrognosis && <img src="./image/icon_5.png" alt="5" />}
          </td>
          <td className={noSearch}>
            <IconList iconList={user.status} />
          </td>
          <td>
            <ButtonToolbar>
              <ButtonGroup>
                <Button href={`/registration?id=${user.patientId}`}>
                  <Glyphicon glyph="edit" />
                </Button>
                <Button>
                  <Glyphicon glyph="trash" />
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </td>
        </tr>
      ))}
    </>
  );
};

export default makeTable;
