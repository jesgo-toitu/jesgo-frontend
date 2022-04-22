import React, { useEffect, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import TabSchema from './TabSchema';
import '../../views/Registration.css';
import { CreateUISchema } from './UISchemaUtility';
import CustomDivForm from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { CustomSchema } from './SchemaUtility';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { createTabs } from './FormCommonComponents';
import { responseResult } from '../../common/DBUtility';

type Props = {
  schemaId: number;
  dispSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  documentId: string;
  loadedData: SaveDataObjDefine | undefined;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
};

// ルートディレクトリのスキーマ
const RootSchema = React.memo((props: Props) => {
  const {
    schemaId,
    dispSchemaIds,
    setDispSchemaIds,
    documentId,
    loadedData,
    setSelectedTabKey,
    setIsLoading,
    setSaveResponse,
  } = props;

  // 表示中のchild_schema
  const [dispChildSchemaIds, setDispChildSchemaIds] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);
  const [dispChildSchemaIdsNotDeleted, setDispChildSchemaIdsNotDeleted] =
    useState<dispSchemaIdAndDocumentIdDefine[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});
  // const [formData, setFormData] = useState<any>({});
  // サブスキーマ用
  const [dispSubSchemaIds, setDispSubSchemaIds] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);

  const [dispSubSchemaIdsNotDeleted, setDispSubSchemaIdsNotDeleted] = useState<
    dispSchemaIdAndDocumentIdDefine[]
  >([]);

  const dispatch = useDispatch();

  // ルートのschema情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  if (schemaInfo === undefined) {
    return null;
  }
  const {
    document_schema: documentSchema,
    subschema,
    child_schema: childSchema,
  } = schemaInfo;
  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const uiSchema = CreateUISchema(customSchema);
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
  }, [loadedData, documentId]);

  // サブスキーマ
  useEffect(() => {
    if (
      subschema.length > 0 &&
      dispSubSchemaIds.length === 0 &&
      (!loadedData || documentId.startsWith('K'))
    ) {
      // TODO: 読み込んだデータがある場合、documentIdはそのデータを入れたい
      subschema.forEach((id) => {
        const item: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: id,
          deleted: false,
        };
        dispSubSchemaIds.push(item);

        // 新規時は必ずドキュメント作成する
        if (!item.documentId) {
          const itemSchemaInfo = GetSchemaInfo(item.schemaId);
          dispatch({
            type: 'ADD_CHILD',
            schemaId: item.schemaId,
            documentId: item.documentId,
            formData: {},
            parentDocumentId: documentId,
            dispChildSchemaIds: dispSubSchemaIds,
            setDispChildSchemaIds: setDispSubSchemaIds,
            isRootSchema: false,
            schemaInfo: itemSchemaInfo,
          });
        }
      });
    }
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
          const itemSchemaInfo = GetSchemaInfo(item.schemaId);
          dispatch({
            type: 'ADD_CHILD',
            schemaId: item.schemaId,
            documentId: item.documentId,
            formData: {},
            parentDocumentId: documentId,
            dispChildSchemaIds,
            setDispChildSchemaIds,
            isRootSchema: false,
            schemaInfo: itemSchemaInfo,
          });
        }
      });
    }
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

  // console.log("---[RootSchema]schema---");
  // console.log(document_schema);
  // console.log("---[RootSchema]uiSchema---");
  // console.log(uiSchema);

  return (
    <>
      <div className="content-area">
        <CustomDivForm
          documentId={documentId}
          schemaId={schemaId}
          dispatch={dispatch}
          setFormData={setFormData}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          uiSchema={uiSchema}
          schema={customSchema}
        />
        <ControlButton
          schemaId={schemaId}
          Type={COMP_TYPE.ROOT_TAB}
          isChildSchema={true} // eslint-disable-line react/jsx-boolean-value
          dispSchemaIds={[...dispSchemaIds]}
          setDispSchemaIds={setDispSchemaIds}
          dispChildSchemaIds={[...dispChildSchemaIds]}
          setDispChildSchemaIds={setDispChildSchemaIds}
          childSchemaIds={childSchema}
          dispatch={dispatch}
          documentId={documentId}
          setFormData={setFormData}
          setSelectedTabKey={setSelectedTabKey}
        />
      </div>
      {createTabs(
        'root',
        dispSubSchemaIds,
        dispSubSchemaIdsNotDeleted,
        setDispSubSchemaIds,
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        loadedData,
        setIsLoading,
        setSaveResponse
      )}
    </>
  );
});

export default RootSchema;
