import React, { useState } from "react";
import { Button, FormControl, FormGroup, ControlLabel, Label, Grid, Row, Col, Panel, Checkbox } from 'react-bootstrap';
import "../../views/Registration.css"
import { RootSchema } from './RootSchema';
import { useDispatch,useSelector } from "react-redux";

import store, { RootState } from "../../store/index"
import { useNavigate } from 'react-router';

export const SubmitButton = () => {

    const formDatas = useSelector((state: RootState) => state.formDataReducer.formDatas);
    let navigate  = useNavigate();
   
    const clickSubmit = (props: { formDatas: Map<any, any> }) => {

        // console.log("formDatas");
        // console.log(props.formDatas);
        // dispatch({ type: "INCREASE_COUNT" });
        // console.log("---docInfo---")
        // console.log(docInfo);

        // console.log("---childInfo---")
        // console.log(childInfo);

        // リスト表示に遷移
        navigate("/Patients");
    };

    return (
        <Col lg={3} md={3} className="user-info-button-col">
            <div className="user-info-button-div">
                <Button onClick={() => clickSubmit({ formDatas: formDatas })} bsStyle="primary">保存してリストに戻る</Button>
            </div>
        </Col>
    )
}