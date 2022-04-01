import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  FormControl,
  FormGroup,
  ControlLabel,
  Row,
  Col,
  Panel,
  Checkbox,
} from 'react-bootstrap';
import {
  ControlButton,
  COMP_TYPE,
} from '../components/CaseRegistration/ControlButton';
import RootSchema from '../components/CaseRegistration/RootSchema';
import SubmitButton from '../components/CaseRegistration/SubmitButton';
import { GetSchemaInfo } from '../common/CaseRegistrationUtility';
import './Registration.css';
import { JESGOComp } from '../components/CaseRegistration/JESGOComponent';
import { getRootDescription } from '../components/CaseRegistration/SchemaUtility';

// 症例入力のおおもとの画面
const Registration = () => {
  // 表示中のルートドキュメント
  const [dispRootSchemaIds, setDispRootSchemaIds] = useState<number[]>([]);

  return (
    <div className="page-area">
      {/* 患者情報入力 */}
      <div className="patient-area">
        <Panel className="panel-style">
          <Row className="patientInfo user-info-row">
            <Col lg={2} md={2}>
              <FormGroup controlId="patientId">
                <ControlLabel>患者ID：</ControlLabel>
                <FormControl type="text" />
              </FormGroup>
            </Col>
            <Col lg={2} md={2}>
              <FormGroup controlId="patientName">
                <ControlLabel>患者氏名：</ControlLabel>
                <FormControl type="text" />
              </FormGroup>
            </Col>
            <Col lg={2} md={3}>
              <FormGroup controlId="birthday">
                <ControlLabel>生年月日</ControlLabel>
                <FormControl type="date" />
              </FormGroup>
            </Col>
            <Col lg={1} md={1}>
              <FormGroup>
                <ControlLabel>年齢</ControlLabel>
                <div>
                  <FormControl.Static className="user-info-age">
                    XX歳
                  </FormControl.Static>
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
            <SubmitButton />
          </Row>
        </Panel>
      </div>
      <div className="content-area">
        <ControlButton
          schemaId={0}
          dispChildSchemaIds={dispRootSchemaIds}
          setDispChildSchemaIds={setDispRootSchemaIds}
          Type={COMP_TYPE.ROOT}
        />
        {dispRootSchemaIds.length > 0 && (
          <Tabs id="root-tabs">
            {dispRootSchemaIds.map((id: number) => {
              // TODO 仮。本来はAPI
              const title = GetSchemaInfo(id)?.title ?? '';
              const description = getRootDescription(GetSchemaInfo(id)?.documentSchema) ?? '';
              return (
                // TODO TabSchemaにTabを置くとうまく動作しなくなる
                <Tab
                  key={`root-tab-${id}`}
                  className="panel-style"
                  eventKey={id}
                  title={
                    <>
                      <span>{title} </span>
                      <JESGOComp.DescriptionToolTip descriptionText={description} />
                    </>
                  }
                >
                  <RootSchema
                    key={`root-${id}`}
                    schemaId={id}
                    dispSchemaIds={dispRootSchemaIds}
                    setDispSchemaIds={setDispRootSchemaIds}
                  />
                </Tab>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default Registration;