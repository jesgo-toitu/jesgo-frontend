import React, { useState } from "react";
import { DevSchema, } from "../common/DevSchema";
import { Button, FormControl, FormGroup, ControlLabel, Label, Grid, Row, Col, Panel, Checkbox } from 'react-bootstrap';
import "./Registration.css"
import { RootSchema } from '../components/CaseRegistration/RootSchema';

export type Documents = {
    document_id: number,
    document: any,
}

// 症例入力のおおもとの画面
export function Registration() {

    const [docInfo, setdocInfo] = useState<Documents[]>();
    const [childInfo, setChildInfo] = useState<Documents>();

    // ルートのschema情報を取得
    const schemaId = DevSchema.CC_root_id;
    const schema = DevSchema.CC_root;
    const subSchemaIds = DevSchema.CC_root_subschema;

    const clickSubmit = () => {
        console.log("---docInfo---")
        console.log(docInfo);

        console.log("---childInfo---")
        console.log(childInfo);
    };

    return (
        <div className="page-style">
            {/* 患者情報入力 */}
            <Panel className="panel-style">
                <Row className="patientInfo user-info-row">
                    <Col lg={2} md={2}>
                        <FormGroup controlId="patientId">
                            <ControlLabel >患者ID：</ControlLabel>
                            <FormControl type="text" />
                        </FormGroup>
                    </Col>
                    <Col lg={2} md={2}>
                        <FormGroup controlId="patientName" >
                            <ControlLabel >患者氏名：</ControlLabel>
                            <FormControl type="text" />
                        </FormGroup>
                    </Col>
                    <Col lg={2} md={2}>
                        <FormGroup controlId="birthday" >
                            <ControlLabel >生年月日</ControlLabel>
                            <FormControl type="date" />
                        </FormGroup>
                    </Col>
                    <Col lg={1} md={1}>
                        <FormGroup>
                            <ControlLabel >年齢</ControlLabel>
                            <div>
                                <FormControl.Static className="user-info-age">XX歳</FormControl.Static>
                            </div>
                        </FormGroup>
                    </Col>
                    <Col lg={2} md={2}>
                        <FormGroup>
                            <ControlLabel>登録拒否</ControlLabel>
                            <div>
                                <Checkbox className="user-info-checkbox">なし</Checkbox>
                            </div>
                        </FormGroup>
                    </Col>
                    <Col lg={3} md={3} className="user-info-button-col">
                        <div className="user-info-button-div">
                            <Button onClick={clickSubmit} bsStyle="primary">保存してリストに戻る</Button>
                        </div>
                    </Col>
                </Row>
            </Panel>
            <Panel className="panel-style">
                <RootSchema schemaId={schemaId} schema={schema} subSchemaIds={subSchemaIds} docInfo={docInfo} setdocInfo={setdocInfo} setChildInfo={setChildInfo}></RootSchema>
            </Panel>
        </div>
    )
}