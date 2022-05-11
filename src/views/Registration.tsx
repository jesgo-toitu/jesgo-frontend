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
import {
  GetRootSchema,
  GetSchemaInfo,
} from '../common/CaseRegistrationUtility';
import './Registration.css';
import {
  headerInfoAction,
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
  jesgoDocumentObjDefine,
} from '../store/formDataReducer';
import SaveCommand, {
  loadJesgoCaseAndDocument,
  responseResult,
} from '../common/DBUtility';
import Loading from '../components/CaseRegistration/Loading';
import apiAccess, { RESULT, METHOD_TYPE } from '../common/ApiAccess';
import {
  AddBeforeUnloadEvent,
  calcAge,
  TabSelectMessage,
  RemoveBeforeUnloadEvent,
} from '../common/CommonUtility';
import store from '../store';
import { Const } from '../common/Const';

// 症例入力のおおもとの画面
const Registration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

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

  // 症例ID
  const [caseId, setCaseId] = useState<number>();
  // リロードフラグ
  const [isReload, setIsReload] = useState<boolean>(false);

  // 読み込み中フラグ
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 保存時の応答
  const [saveResponse, setSaveResponse] = useState<responseResult>({
    message: '',
  });

  // スキーマ所持中フラグ
  const [hasSchema, setHasSchema] = useState<boolean>(
    GetRootSchema().length > 0
  );

  // ヘッダの患者情報
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [decline, setDecline] = useState<boolean>(false);

  const [patientIdReadOnly, setPatientIdReadOnly] = useState(false);

  let age = ''; // 年齢

  // 選択中のタブeventKey
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [selectedTabKey, setSelectedTabKey] = useState<any>();

  // eslint-disable-next-line prefer-const
  let [loadData, setLoadData] = useState<SaveDataObjDefine | undefined>();

  // 初期設定
  useEffect(() => {
    const asyncFunc = async () => {
      // スキーマ取得処理
      const returnSchemaApiObject = await apiAccess(
        METHOD_TYPE.GET,
        `getJsonSchema`
      );

      // ルートスキーマID取得処理
      if (returnSchemaApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
        dispatch({
          type: 'SCHEMA',
          schemaDatas: returnSchemaApiObject.body,
        });
      }

      const returnRootSchemaIdsApiObject = await apiAccess(
        METHOD_TYPE.GET,
        `getRootSchemaIds`
      );
      if (
        returnRootSchemaIdsApiObject.statusNum === RESULT.NORMAL_TERMINATION
      ) {
        dispatch({
          type: 'ROOT',
          rootSchemas: returnRootSchemaIdsApiObject.body,
        });
      }
      setHasSchema(true);
    };

    console.log('hasschema');
    console.log(hasSchema);

    if (!hasSchema) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      asyncFunc();
    }
  });

  const LoadDataFromDB = () => {
    let paramCaseId = '';
    if (caseId) {
      paramCaseId = caseId.toString();
    } else {
      const query = new URLSearchParams(search);
      paramCaseId = query.get('id') ?? '';
    }

    if (paramCaseId && (loadedJesgoCase.resCode === undefined || isReload)) {
      // DBからデータ読み込み
      loadJesgoCaseAndDocument(parseInt(paramCaseId, 10), setLoadedJesgoCase);
    } else {
      // 新規の場合は読み込み完了とする
      setIsLoading(false);
    }
  };

  // 初期設定
  useEffect(() => {
    // ブラウザの戻る・更新の防止
    AddBeforeUnloadEvent();
  }, []);

  useEffect(() => {
    // 初回のデータ読み込み
    LoadDataFromDB();
  }, []);

  useEffect(() => {
    if (isReload) {
      setIsLoading(true);
      LoadDataFromDB();
    }
  }, [isReload]);

  // データ読み込み後のコールバック
  useEffect(() => {
    if (loadedJesgoCase.resCode === RESULT.ABNORMAL_TERMINATION) {
      // eslint-disable-next-line no-alert
      alert('読み込みに失敗しました。');
      setIsLoading(false);
      RemoveBeforeUnloadEvent();
      navigate('/Patients');
    } else if (loadedJesgoCase.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
      // ログイン画面に戻る
      setIsLoading(false);
      RemoveBeforeUnloadEvent();
      navigate('/login');
    } else if (loadedJesgoCase.resCode === RESULT.NORMAL_TERMINATION) {
      // 読み込み成功

      loadData = loadedJesgoCase.loadedSaveData as SaveDataObjDefine;
      loadData.jesgo_case.is_new_case = false;

      setPatientId(loadData.jesgo_case.his_id);
      setPatientName(loadData.jesgo_case.name);
      setBirthday(loadData.jesgo_case.date_of_birth);
      setDecline(loadData.jesgo_case.decline);

      setPatientIdReadOnly(true);

      // 読み込んだデータをstoreに反映
      dispatch({ type: 'SAVE_LOADDATA', saveData: loadData });

      // console.log(JSON.stringify(loadData));

      // 読み込んだデータからルートドキュメント追加
      const jesgoDocument = loadData.jesgo_document;
      if (jesgoDocument.length > 0) {
        // 初期化
        dispRootSchemaIds.length = 0;

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
        setDispRootSchemaIds([...dispRootSchemaIds]);
        setLoadData(loadData);

        // 先頭のタブを選択する
        if (!selectedTabKey && dispRootSchemaIds.length > 0) {
          setSelectedTabKey(0);
        }
      }

      // setIsLoading(false);
      setIsReload(false);

      // 患者情報しか入力されてない場合はローディング画面解除されないのでここで解除する
      if (jesgoDocument.length === 0) {
        setIsLoading(false);
      }

      // TODO: これだと読み込み後にまた再描画かかる？
      if (caseId) {
        navigate(`/registration?id=${caseId}`);
      }
    }
  }, [loadedJesgoCase]);

  useEffect(() => {
    if (dispRootSchemaIds.length > 0) {
      dispRootSchemaIds.forEach((info: dispSchemaIdAndDocumentIdDefine) => {
        // ドキュメントIDがなければ作成する
        if (!info.documentId) {
          const schemaInfo = GetSchemaInfo(info.schemaId);
          dispatch({
            type: 'ADD_PARENT',
            schemaId: info.schemaId,
            documentId: info.documentId,
            formData: {},
            dispChildSchemaIds: dispRootSchemaIds,
            setDispChildSchemaIds: setDispRootSchemaIds,
            isRootSchema: true,
            schemaInfo,
          });
        }
      });
    }

    // 削除済みはフィルタ
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

  // 表示用のルートスキーマ更新終わった時点でローディング解除
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [dispRootSchemaIdsNotDeleted]);

  // ヘッダ情報更新時のイベント
  const onChangeItem = (event: any) => {
    const eventTarget: EventTarget & HTMLInputElement =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  // タブ選択イベント
  const onTabSelectEvent = (eventKey: any) => {
    if (eventKey === selectedTabKey) return;

    // TODO：タブ移動での保存は一時的にオフ
    setSelectedTabKey(eventKey);
    return;

    // 保存しますかメッセージ
    // if (TabSelectMessage()) {
    if (true) {
      const formDatas = store.getState().formDataReducer.formDatas;
      const saveData = store.getState().formDataReducer.saveData;

      // 保存処理
      SaveCommand(
        formDatas,
        saveData,
        dispatch,
        setIsLoading,
        setSaveResponse,
        false
      );

      setSelectedTabKey(eventKey);
    } else {
      // TODO: キャンセルの場合は留まる？
      // setSelectedTabKey(selectedTabKey);
      setSelectedTabKey(eventKey);
    }
  };

  // 保存後のコールバック
  useEffect(() => {
    if (saveResponse.resCode !== undefined) {
      if (
        saveResponse.resCode === RESULT.ABNORMAL_TERMINATION ||
        saveResponse.resCode === RESULT.ID_DUPLICATION
      ) {
        alert(saveResponse.message);
      }

      // TODO: 再読み込みする
      if (saveResponse.caseId) {
        setIsLoading(true);
        setLoadedJesgoCase({
          message: '',
          resCode: undefined,
          loadedSaveData: undefined,
        });
        setCaseId(saveResponse.caseId);
        setIsReload(true);
      } else {
        // TODO: 読み込み失敗
        setIsLoading(false);
        RemoveBeforeUnloadEvent();
        navigate('/Patients');
      }
    }
  }, [saveResponse]);

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
                  max={Const.INPUT_DATE_MAX}
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
            <SubmitButton
              setIsLoading={setIsLoading}
              setLoadedJesgoCase={setLoadedJesgoCase}
              setCaseId={setCaseId}
              setIsReload={setIsReload}
            />
          </Row>
        </Panel>
      </div>
      {!isLoading && hasSchema && (
        <div className="content-area">
          <div className="input-form">
            {dispRootSchemaIdsNotDeleted.length > 0 && (
              <Tabs
                id="root-tabs"
                activeKey={selectedTabKey} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
                onSelect={(eventKey) => onTabSelectEvent(eventKey)}
              >
                {dispRootSchemaIdsNotDeleted.map(
                  (info: dispSchemaIdAndDocumentIdDefine, index: number) => {
                    // TODO: サブタイトル追加は暫定対応。今後使用しない可能性あり
                    const schemaInfo = GetSchemaInfo(info.schemaId);
                    let title = schemaInfo?.title ?? '';
                    if (schemaInfo?.subtitle) {
                      title += ` ${schemaInfo.subtitle}`;
                    }

                    return (
                      // TODO TabSchemaにTabを置くとうまく動作しなくなる
                      <Tab
                        key={`root-tab-${info.schemaId}`}
                        className="panel-style"
                        eventKey={index}
                        title={<span>{title} </span>}
                      >
                        <RootSchema
                          key={`root-${info.schemaId}`}
                          schemaId={info.schemaId}
                          documentId={info.documentId}
                          dispSchemaIds={[...dispRootSchemaIds]}
                          setDispSchemaIds={setDispRootSchemaIds}
                          loadedData={loadData}
                          setSelectedTabKey={setSelectedTabKey}
                          setIsLoading={setIsLoading}
                          setSaveResponse={setSaveResponse}
                          isSchemaChange={info.isSchemaChange}
                        />
                      </Tab>
                    );
                  }
                )}
              </Tabs>
            )}
          </div>
          <ControlButton
            Type={COMP_TYPE.ROOT}
            isChildSchema={false} // eslint-disable-line react/jsx-boolean-value
            schemaId={0}
            dispChildSchemaIds={[...dispRootSchemaIds]}
            setDispChildSchemaIds={setDispRootSchemaIds}
            dispatch={dispatch}
            documentId=""
            subSchemaCount={0}
          />
        </div>
      )}
      {/* ローディング画面表示 */}
      {(isLoading || !hasSchema) && <Loading />}
    </div>
  );
};

export default Registration;
