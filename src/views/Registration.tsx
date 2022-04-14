/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  headerInfoAction,
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
  jesgoDocumentObjDefine,
} from '../store/formDataReducer';
import { loadJesgoCaseAndDocument, responseResult } from '../common/DBUtility';
import Loading from '../components/CaseRegistration/Loading';
import { RESULT } from '../common/ApiAccess';
import {
  AddBeforeUnloadEvent,
  calcAge,
  RemoveBeforeUnloadEvent,
} from '../common/CommonUtility';

// 症例入力のおおもとの画面
const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search = useLocation().search;

  // 表示中のルートドキュメント
  const [dispRootSchemaIds, setDispRootSchemaIds] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);
  const [dispRootSchemaIdsNotDeleted, setDispRootSchemaIdsNotDeleted] =
    useState<dispSchemaIdAndDocumentIdDefine[]>([]);

  const [loadedJesgoCase, setLoadedJesgoCase] = useState<responseResult>({
    message: '',
    resCode: undefined,
    loadedSaveData: undefined,
  });

  // 読み込み中フラグ
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ヘッダの患者情報
  // TODO: 本来ここの初期値はDBから読み込んだ値になる
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [decline, setDecline] = useState<boolean>(false);

  const [patientIdReadOnly, setPatientIdReadOnly] = useState(false);

  let age = ''; // 年齢

  const initialData: SaveDataObjDefine = {
    jesgo_case: {
      case_id: '',
      name: '',
      his_id: '',
      sex: 'F',
      decline: false,
      date_of_death: '',
      date_of_birth: '',
      registrant: -1,
      last_updated: '',
      is_new_case: true,
    },
    jesgo_document: [],
  };

  // eslint-disable-next-line prefer-const
  let [loadData, setLoadData] = useState<SaveDataObjDefine>(initialData);

  // 初期設定
  useEffect(() => {
    const query = new URLSearchParams(search);
    const paramCaseId = query.get('id') ?? '';
    if (paramCaseId && loadData.jesgo_case.is_new_case === true) {
      // DBからデータ読み込み
      loadJesgoCaseAndDocument(parseInt(paramCaseId, 10), setLoadedJesgoCase);
    } else if (!paramCaseId) {
      // 新規の場合は読み込み完了とする
      setIsLoading(false);
    }

    // ブラウザの戻る・更新の防止
    AddBeforeUnloadEvent();
  }, []);

  useEffect(() => {
    if (loadedJesgoCase.resCode === RESULT.ABNORMAL_TERMINATION) {
      // eslint-disable-next-line no-alert
      alert('読み込みに失敗しました。');
      setIsLoading(false);
      RemoveBeforeUnloadEvent();
      navigate('/Patients');
    } else if (loadedJesgoCase.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
      // ログイン画面に戻る
      RemoveBeforeUnloadEvent();
      navigate('/login');
    } else if (loadedJesgoCase.resCode === RESULT.NORMAL_TERMINATION) {
      loadData = loadedJesgoCase.loadedSaveData as SaveDataObjDefine;
      loadData.jesgo_case.is_new_case = false;

      setPatientId(loadData.jesgo_case.his_id);
      setPatientName(loadData.jesgo_case.name);
      setBirthday(loadData.jesgo_case.date_of_birth);
      setDecline(loadData.jesgo_case.decline);

      setPatientIdReadOnly(true);

      // 読み込んだデータをstoreに反映
      dispatch({ type: 'SAVE_LOADDATA', saveData: loadData });

      console.log(JSON.stringify(loadData));

      // 読み込んだデータからルートドキュメント追加
      const jesgoDocument = loadData.jesgo_document;
      if (jesgoDocument.length > 0) {
        jesgoDocument
          .filter((p) => p.root_order !== -1) // root_orderが-1のものは子ドキュメントなのでそれ以外で読み込む
          .sort((first, second) => first.root_order - second.root_order)
          .forEach((doc: jesgoDocumentObjDefine) => {
            dispRootSchemaIds.push({
              documentId: doc.key,
              schemaId: doc.value.schema_id,
              deleted: doc.value.deleted,
            });
          });

        setLoadData(loadData);
        setDispRootSchemaIds(dispRootSchemaIds);
      }
      setIsLoading(false);
    }
  }, [loadedJesgoCase]);

  useEffect(() => {
    if (dispRootSchemaIds.length > 0) {
      dispRootSchemaIds.forEach((info: dispSchemaIdAndDocumentIdDefine) => {
        // ドキュメントIDがなければ作成する
        if (!info.documentId) {
          dispatch({
            type: 'ADD_PARENT',
            schemaId: info.schemaId,
            documentId: info.documentId,
            formData: {},
            dispChildSchemaIds: dispRootSchemaIds,
            setDispChildSchemaIds: setDispRootSchemaIds,
            isRootSchema: true,
          });
        }
      });
    }
  }, [dispRootSchemaIds]);

  // 削除済みはフィルタ
  useEffect(() => {
    setDispRootSchemaIdsNotDeleted(
      dispRootSchemaIds.filter((p) => p.deleted === false)
    );
  }, [dispRootSchemaIds, loadData]);

  useEffect(() => {
    // ドキュメントの並び順更新
    dispatch({
      type: 'SORT',
      subSchemaIds: [], // ルートにはサブスキーマない
      dispChildSchemaIds: dispRootSchemaIds,
      isRootSchema: true,
    });
  }, [dispRootSchemaIds]);

  // ヘッダ情報更新時のイベント
  const onChangeItem = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const eventTarget: EventTarget & HTMLInputElement =
      event.target as EventTarget & HTMLInputElement;

    let value: string | boolean;
    switch (eventTarget.id) {
      case 'patientId':
        value = eventTarget.value;
        setPatientId(value);
        break;
      case 'patientName':
        value = eventTarget.value;
        setPatientName(value);
        break;
      case 'birthday':
        value = eventTarget.value;
        setBirthday(value);
        break;
      case 'decline':
        value = eventTarget.checked;
        setDecline(value);
        break;

      default:
        return;
    }

    // storeに保存する
    const action: headerInfoAction = {
      type: 'INPUT_HEADER',
      headerItemName: eventTarget.id,
      value,
    };
    dispatch(action);
  };

  // 年齢
  age = calcAge(birthday);

  return (
    <div className="page-area">
      {/* 患者情報入力 */}
      <div className="patient-area">
        <Panel className="panel-style">
          <Row className="patientInfo user-info-row">
            <Col lg={2} md={2}>
              <FormGroup controlId="patientId">
                <ControlLabel>患者ID：</ControlLabel>
                <FormControl
                  type="text"
                  onChange={onChangeItem}
                  value={patientId}
                  readOnly={patientIdReadOnly}
                />
              </FormGroup>
            </Col>
            <Col lg={2} md={2}>
              <FormGroup controlId="patientName">
                <ControlLabel>患者氏名：</ControlLabel>
                <FormControl
                  type="text"
                  onChange={onChangeItem}
                  value={patientName}
                />
              </FormGroup>
            </Col>
            <Col lg={2} md={3}>
              <FormGroup controlId="birthday">
                <ControlLabel>生年月日</ControlLabel>
                <FormControl
                  type="date"
                  onChange={onChangeItem}
                  value={birthday}
                />
              </FormGroup>
            </Col>
            <Col lg={1} md={1}>
              <FormGroup>
                <ControlLabel>年齢</ControlLabel>
                <div>
                  <FormControl.Static className="user-info-age">
                    {age}歳
                  </FormControl.Static>
                </div>
              </FormGroup>
            </Col>
            <Col lg={2} md={2}>
              <FormGroup>
                <ControlLabel>登録拒否</ControlLabel>
                <div>
                  <Checkbox
                    className="user-info-checkbox"
                    id="decline"
                    onChange={onChangeItem}
                    checked={decline}
                  >
                    なし
                  </Checkbox>
                </div>
              </FormGroup>
            </Col>
            <SubmitButton setIsLoading={setIsLoading} />
          </Row>
        </Panel>
      </div>
      {!isLoading && (
        <div className="registration-area">
          <div className="content-area">
            <ControlButton
              Type={COMP_TYPE.ROOT}
              isChildSchema={false} // eslint-disable-line react/jsx-boolean-value
              schemaId={0}
              dispChildSchemaIds={[...dispRootSchemaIds]}
              setDispChildSchemaIds={setDispRootSchemaIds}
              dispatch={dispatch}
              documentId=""
            />
            {dispRootSchemaIdsNotDeleted.length > 0 && (
              <Tabs id="root-tabs">
                {dispRootSchemaIdsNotDeleted.map(
                  (info: dispSchemaIdAndDocumentIdDefine) => {
                    // TODO 仮。本来はAPI
                    const title = GetSchemaInfo(info.schemaId)?.title ?? '';
                    const description =
                      getRootDescription(
                        GetSchemaInfo(info.schemaId)?.documentSchema
                      ) ?? '';

                    return (
                      // TODO TabSchemaにTabを置くとうまく動作しなくなる
                      <Tab
                        key={`root-tab-${info.schemaId}`}
                        className="panel-style"
                        eventKey={info.schemaId}
                        title={
                          <>
                            <span>{title} </span>
                            <JESGOComp.DescriptionToolTip
                              descriptionText={description}
                            />
                          </>
                        }
                      >
                        <RootSchema
                          key={`root-${info.schemaId}`}
                          schemaId={info.schemaId}
                          documentId={info.documentId}
                          dispSchemaIds={[...dispRootSchemaIds]}
                          setDispSchemaIds={setDispRootSchemaIds}
                          loadedData={loadData}
                        />
                      </Tab>
                    );
                  }
                )}
              </Tabs>
            )}
          </div>
        </div>
      )}
      {/* ローディング画面表示 */}
      {isLoading && <Loading />}
    </div>
  );
};

export default Registration;
