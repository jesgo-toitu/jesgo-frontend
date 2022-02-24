import React from "react";
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from "react-bootstrap";

export namespace UserTables {



    export const makeTable = (props: { userListJson: string, search: string, noSearch: string, progressAndRecurrenceColumn: string }) => {

        interface userDataList {
            data: userData[]
        };

        interface userData {
            patientId: string,
            patientName: string,
            age: number,
            registedCancerGroup: string,
            startDate: string,
            lastUpdate: string,
            diagnosis: string,
            advancedStage: string,
            pathlogicalDiagnosis: string,
            initialTreatment: string,
            copilacations: string,
            progress: string,
            postRelapseTreatment: string,
            threeYearPrognosis: string,
            fiveYearPrognosis: string,
            status: string[],
        };

        const { userListJson, search, noSearch, progressAndRecurrenceColumn } = props;
        let userDataListJson: userDataList;
        let userList: userData[] = [];
        if (userListJson.length > 0) {
            userDataListJson = JSON.parse(userListJson) as userDataList;
            userList = userDataListJson.data;
        }

        return (
            <>
                {
                    userList.map(user => (
                        <tr>
                            <td>{user.patientId}</td>
                            <td>{user.patientName}</td>
                            <td>{user.age}</td>
                            <td className={search}>{user.registedCancerGroup}</td>
                            <td className={search}>{user.startDate}</td>
                            <td className={noSearch}>{user.startDate} <br /> {user.lastUpdate}</td>
                            <td className={noSearch}>{user.diagnosis}</td>
                            <td>{user.advancedStage}</td>
                            <td className={search}>{user.pathlogicalDiagnosis}</td>
                            <td className={search}>{user.initialTreatment && <img src="./image/icon_ope.png" alt="手" />}</td>
                            <td className={search}>{user.copilacations && <img src="./image/icon_gou.png" alt="合" />}</td>
                            <td className={progressAndRecurrenceColumn}>{user.progress && <img src="./image/icon_keika.png" alt="経過" />}</td>
                            <td className={progressAndRecurrenceColumn}>{user.postRelapseTreatment && <img src="./image/icon_sai.png" alt="再" />}</td>
                            <td className={search}>{user.threeYearPrognosis && <img src="./image/icon_3.png" alt="3" />}</td>
                            <td className={search}>{user.fiveYearPrognosis && <img src="./image/icon_5.png" alt="5" />}</td>
                            <td className={noSearch}>
                                {user.initialTreatment && <img src="./image/icon_ope.png" alt="手" />}
                                {user.copilacations && <img src="./image/icon_gou.png" alt="合" />}
                                {user.progress && <img src="./image/icon_keika.png" alt="経過" />}
                                {user.postRelapseTreatment && <img src="./image/icon_sai.png" alt="再" />}
                                {user.threeYearPrognosis && <img src="./image/icon_3.png" alt="3" />}
                                {user.fiveYearPrognosis && <img src="./image/icon_5.png" alt="5" />}
                            </td >
                            <td>
                                <ButtonToolbar>
                                    <ButtonGroup>
                                        <Button href={"/registration?id=" + user.patientId}>
                                            <Glyphicon glyph="edit" />
                                        </Button>
                                        <Button>
                                            <Glyphicon glyph="trash" />
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                            </td>
                        </tr >
                    ))
                }
            </>
        )
    }
}