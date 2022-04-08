import React, { useEffect, useMemo, useState } from 'react';
import { UiSchema } from '@rjsf/core';
import { useDispatch } from 'react-redux';
import PanelSchema from './PanelSchema';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { CreateUISchema } from './UISchemaUtility';
import CustomDivForm from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { JesgoDocumentSchema } from '../../temp/ReadSchema';
import { CustomSchema } from './SchemaUtility';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';

// ルートディレクトリ直下の子スキーマ
type Props = {
  schemaId: number;
  dispSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  documentId: string;
  isChildSchema: boolean;
  loadedData: SaveDataObjDefine | undefined;
};

const TabSchema = React.memo((props: Props) => {
  const {
    schemaId,
    dispSchemaIds,
    setDispSchemaIds,
    documentId,
    isChildSchema,
    loadedData,
  } = props;

  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  const { documentSchema, subschema, childSchema } =
    schemaInfo as JesgoDocumentSchema;

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

  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  const uiSchema: UiSchema = CreateUISchema(customSchema);
  uiSchema['ui:ObjectFieldTemplate'] = JESGOFiledTemplete.TabItemFieldTemplate;

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
            setDispSubSchemaIds([...dispSubSchemaIds]);
          }
          if (dispChildSchemaIds.length > 0) {
            setDispChildSchemaIds([...dispChildSchemaIds]);
          }
        }
      }
    }
  }, []);

  // サブスキーマ
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

  // console.log("---[TabSchema]schema---");
  // console.log(document_schema);
  // console.log("---[TabSchema]uiSchema---");
  // console.log(uiSchema);

  return (
    <>
      <ControlButton
        schemaId={schemaId}
        Type={COMP_TYPE.TAB}
        isChildSchema={isChildSchema}
        dispatch={dispatch}
        dispSchemaIds={[...dispSchemaIds]}
        setDispSchemaIds={setDispSchemaIds}
        dispChildSchemaIds={[...dispChildSchemaIds]}
        setDispChildSchemaIds={setDispChildSchemaIds}
        childSchemaIds={childSchema}
        documentId={documentId}
        setFormData={setFormData}
      />
      <CustomDivForm
        documentId={documentId}
        schemaId={schemaId}
        dispatch={dispatch}
        setFormData={setFormData}
        schema={customSchema}
        uiSchema={uiSchema}
        formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      />
      {dispSubSchemaIdsNotDeleted.length > 0 &&
        dispSubSchemaIdsNotDeleted.map(
          (info: dispSchemaIdAndDocumentIdDefine) => (
            <PanelSchema
              key={info.schemaId}
              isChildSchema={false}
              schemaId={info.schemaId}
              documentId={info.documentId}
              dispSchemaIds={[...dispSubSchemaIds]}
              setDispSchemaIds={setDispSubSchemaIds}
              loadedData={loadedData}
            />
          )
        )}
      {
        // childSchema表示
        dispChildSchemaIdsNotDeleted.length > 0 &&
          dispChildSchemaIdsNotDeleted.map(
            (info: dispSchemaIdAndDocumentIdDefine) => (
              <PanelSchema
                key={info.schemaId}
                isChildSchema={true} // eslint-disable-line react/jsx-boolean-value
                schemaId={info.schemaId}
                documentId={info.documentId}
                dispSchemaIds={[...dispChildSchemaIds]}
                setDispSchemaIds={setDispChildSchemaIds}
                loadedData={loadedData}
              />
            )
          )
      }
    </>
  );
});

export default TabSchema;
