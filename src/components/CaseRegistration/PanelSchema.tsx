import React, { useEffect, useMemo, useState } from 'react';
import { Panel } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import '../../views/Registration.css';
import CustomDivForm from './JESGOCustomForm';
import { CreateUISchema } from './UISchemaUtility';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { CustomSchema } from './SchemaUtility';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { createPanels, createTabs } from './FormCommonComponents';

// 孫スキーマ以降
type Props = {
  schemaId: number;
  setDispSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  dispSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  documentId: string;
  isChildSchema: boolean;
  loadedData: SaveDataObjDefine | undefined;
};

const PanelSchema = React.memo((props: Props) => {
  const {
    schemaId,
    setDispSchemaIds,
    dispSchemaIds,
    documentId,
    isChildSchema,
    loadedData,
  } = props;
  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  if (schemaInfo == null) {
    return null;
  }

  // 表示中のchild_schema
  const [dispChildSchemaIds, setDispChildSchemaIds] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);
  const [dispChildSchemaIdsNotDeleted, setDispChildSchemaIdsNotDeleted] =
    useState<dispSchemaIdAndDocumentIdDefine[]>([]);

  const [formData, setFormData] = useState<any>({}); // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  // サブスキーマ用
  const [dispSubSchemaIds, setDispSubSchemaIds] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);
  const [dispSubSchemaIdsNotDeleted, setDispSubSchemaIdsNotDeleted] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);

  const dispatch = useDispatch();

  const { documentSchema, subschema, childSchema } = schemaInfo;
  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const isTab = customSchema['jesgo:ui:subschemastyle'] === 'tab';

  const uiSchema = CreateUISchema(customSchema);

  // console.log('---[PanelSchema]schemaInfo---');
  // console.log(schemaInfo);
  // console.log('---[PanelSchema]schema---');
  // console.log(customSchema);
  // console.log('---[PanelSchema]uiSchema---');
  // console.log(uiSchema);

  // DBから読み込んだデータを設定
  useEffect(() => {
    if (loadedData) {
      const parentDoc = loadedData.jesgo_document.find(
        (p) => p.key === documentId
      );
      if (parentDoc) {
        // このスキーマのformDataを設定
        setFormData(parentDoc.value.document);

        const childDocuments = parentDoc.value.child_documents;

        // 子ドキュメントがあればサブスキーマとchildスキーマを判定してそれぞれの配列に格納
        if (childDocuments.length > 0) {
          childDocuments.forEach((childDocId) => {
            const childDoc = loadedData.jesgo_document.find(
              (p) => p.key === childDocId
            );
            if (childDoc) {
              const item: dispSchemaIdAndDocumentIdDefine = {
                documentId: childDoc.key,
                schemaId: childDoc.value.schema_id,
                deleted: childDoc.value.deleted,
              };

              // サブスキーマに追加
              if (
                subschema.length > 0 &&
                subschema.includes(childDoc.value.schema_id)
              ) {
                dispSubSchemaIds.push(item);
              } else {
                // childスキーマに追加
                dispChildSchemaIds.push(item);
              }
            }
          });

          if (dispSubSchemaIds.length > 0) {
            setDispSubSchemaIds(dispSubSchemaIds);
          }
          if (dispChildSchemaIds.length > 0) {
            setDispChildSchemaIds(dispChildSchemaIds);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (subschema.length > 0 && dispSubSchemaIds.length === 0) {
      subschema.forEach((id) => {
        const item: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: id,
          deleted: false,
        };
        dispSubSchemaIds.push(item);

        // 新規時は必ずドキュメント作成する
        if (!item.documentId) {
          dispatch({
            type: 'ADD_CHILD',
            schemaId: item.schemaId,
            documentId: item.documentId,
            formData: {},
            parentDocumentId: documentId,
            dispChildSchemaIds: dispSubSchemaIds,
            setDispChildSchemaIds: setDispSubSchemaIds,
            isRootSchema: false,
          });
        }
      });
    }
  }, [dispSubSchemaIds]);

  useEffect(() => {
    setDispSubSchemaIdsNotDeleted(
      dispSubSchemaIds.filter((p) => p.deleted === false)
    );
  }, [dispSubSchemaIds]);

  // childスキーマ
  useEffect(() => {
    if (dispChildSchemaIds.length > 0) {
      dispChildSchemaIds.forEach((item) => {
        // 新規時は必ずドキュメント作成する
        if (!item.documentId) {
          dispatch({
            type: 'ADD_CHILD',
            schemaId: item.schemaId,
            documentId: item.documentId,
            formData: {},
            parentDocumentId: documentId,
            dispChildSchemaIds,
            setDispChildSchemaIds,
            isRootSchema: false,
          });
        }
      });
    }
  }, [dispChildSchemaIds]);

  useEffect(() => {
    setDispChildSchemaIdsNotDeleted(
      dispChildSchemaIds.filter((p) => p.deleted === false)
    );
  }, [dispChildSchemaIds]);

  // ドキュメントの並び順を更新
  useEffect(() => {
    dispatch({
      type: 'SORT',
      subSchemaIds: dispSubSchemaIds,
      dispChildSchemaIds,
      isRootSchema: false,
    });
  }, [dispSubSchemaIds, dispChildSchemaIds]);

  return (
    <Panel key={`panel-${schemaId}`} className="panel-style">
      <ControlButton
        Type={COMP_TYPE.PANEL}
        isChildSchema={isChildSchema}
        schemaId={schemaId}
        documentId={documentId}
        dispSchemaIds={[...dispSchemaIds]}
        setDispSchemaIds={setDispSchemaIds}
        dispChildSchemaIds={[...dispChildSchemaIds]}
        setDispChildSchemaIds={setDispChildSchemaIds}
        childSchemaIds={childSchema}
        dispatch={dispatch}
        setFormData={setFormData}
      />
      <CustomDivForm
        documentId={documentId}
        schemaId={schemaId}
        dispatch={dispatch}
        setFormData={setFormData}
        key={`div-${schemaId}`}
        schema={customSchema}
        uiSchema={uiSchema}
        formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      />
      {isTab
        ? // タブ表示
          createTabs(
            'panelschema',
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            loadedData
          )
        : // パネル表示
          createPanels(
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            loadedData
          )}
    </Panel>
  );
});

export default PanelSchema;
