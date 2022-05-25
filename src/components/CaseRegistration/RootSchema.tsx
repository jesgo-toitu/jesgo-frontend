/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import { useDispatch } from 'react-redux';
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
import { ChildTabSelectedFuncObj, createTabs } from './FormCommonComponents';
import { responseResult } from '../../common/DBUtility';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import store from '../../store';

type Props = {
  tabId: string;
  parentTabsId: string;
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
  isSchemaChange: boolean | undefined;
  selectedTabKey: any;
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void;
};

// ルートディレクトリのスキーマ
const RootSchema = React.memo((props: Props) => {
  const {
    tabId,
    parentTabsId,
    schemaId,
    dispSchemaIds,
    setDispSchemaIds,
    documentId,
    loadedData,
    setSelectedTabKey,
    setIsLoading,
    setSaveResponse,
    isSchemaChange,
    selectedTabKey,
    schemaAddModFunc,
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

  // ドキュメント追加検知用
  const [addedDocumentCount, setAddedDocumentCount] = useState<number>(0);

  const dispatch = useDispatch();

  // ルートのschema情報を取得
  const schemaInfo = GetSchemaInfo(schemaId) as JesgoDocumentSchema;
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

  // サブスキーマとサブスキーマから派生できる継承スキーマ一覧取得
  const subSchemaAndInherit = useMemo(() => {
    let subSchemaArray: number[] = [];
    if (subschema.length > 0) {
      subSchemaArray.push(...subschema);
      subschema.forEach((subSchemaId: number) => {
        // 基底スキーマを取得
        const baseSchemaId = GetSchemaInfo(subSchemaId)?.base_schema;
        // 継承スキーマを取得
        const inheritIds = baseSchemaId
          ? GetSchemaInfo(baseSchemaId)?.inherit_schema
          : GetSchemaInfo(subSchemaId)?.inherit_schema;

        if (baseSchemaId) {
          subSchemaArray.push(baseSchemaId);
        }
        if (inheritIds) {
          subSchemaArray.push(...inheritIds);
        }
      });

      subSchemaArray = lodash.uniq(subSchemaArray);
    }
    return subSchemaArray;
  }, [subschema]);

  // サブスキーマのドキュメント作成
  const createSubSchemaDocument = () => {
    if (
      subschema.length > 0 &&
      (isSchemaChange ||
        (dispSubSchemaIds.length === 0 &&
          (!loadedData || documentId.startsWith('K'))))
    ) {
      dispSubSchemaIds.length = 0; // 一旦クリア
      subschema.forEach((id) => {
        const item: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: id,
          deleted: false,
          compId: '',
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
            setAddedDocumentCount,
          });
        }
      });
    }

    setDispSubSchemaIdsNotDeleted(
      dispSubSchemaIds.filter((p) => p.deleted === false)
    );

    // 継承スキーマの場合は再作成完了後に親ドキュメントのフラグを降ろす
    if (isSchemaChange) {
      setDispSchemaIds(
        dispSchemaIds.map((p) => {
          if (p.documentId === documentId) {
            p.isSchemaChange = false;
          }
          return p;
        })
      );
    }
  };

  // ドキュメント追加後の保存
  useEffect(() => {
    const {
      maxDocumentCount: maxCount,
      addedDocumentCount: nowCount,
      selectedTabKeyName: eventKey,
    } = store.getState().formDataReducer;
    const tabSelectEvent = store.getState().formDataReducer.tabSelectEvent;
    // すべてのドキュメントが作成完了したら保存する
    if (maxCount !== undefined && maxCount === nowCount) {
      if (tabSelectEvent) {
        tabSelectEvent(false, eventKey);
      }
      dispatch({ type: 'ADD_DOCUMENT_STATUS', maxDocumentCount: undefined });
    }
  }, [addedDocumentCount]);

  // DBから読み込んだデータを設定
  useEffect(() => {
    if (loadedData) {
      let parentDoc = loadedData.jesgo_document.find(
        (p) => p.key === documentId
      );

      // 編集中のデータ
      const saveParentDoc = store
        .getState()
        .formDataReducer.saveData.jesgo_document.find(
          (p) => p.key === documentId
        );
      // 継承した場合は編集中のデータをセットする
      if (saveParentDoc && isSchemaChange) {
        parentDoc = saveParentDoc;
      }

      if (parentDoc) {
        setFormData(parentDoc.value.document);
        dispatch({
          type: 'INPUT',
          schemaId,
          formData: parentDoc.value.document,
          documentId,
        });

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
                compId: childDoc.compId,
              };

              // サブスキーマに追加
              if (
                subschema.length > 0 &&
                !dispSubSchemaIds.find(
                  (p) => p.schemaId === childDoc.value.schema_id
                ) &&
                subSchemaAndInherit.includes(childDoc.value.schema_id)
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
    createSubSchemaDocument();
  }, [dispSubSchemaIds, isSchemaChange]);

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
            setAddedDocumentCount,
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

  const [childTabSelectedFunc, setChildTabSelectedFunc] =
    useState<ChildTabSelectedFuncObj>({
      fnAddDocument: schemaAddModFunc,
      fnSchemaChange: schemaAddModFunc,
    });

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
          tabId={tabId}
          parentTabsId={parentTabsId}
          schemaId={schemaId}
          Type={COMP_TYPE.ROOT_TAB}
          isChildSchema={true} // eslint-disable-line react/jsx-boolean-value
          dispSchemaIds={[...dispSchemaIds]}
          setDispSchemaIds={setDispSchemaIds}
          dispChildSchemaIds={[...dispChildSchemaIds]}
          dispSubSchemaIds={[...dispSubSchemaIdsNotDeleted]}
          setDispChildSchemaIds={setDispChildSchemaIds}
          childSchemaIds={childSchema}
          dispatch={dispatch}
          documentId={documentId}
          setFormData={setFormData}
          setSelectedTabKey={setSelectedTabKey}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          subSchemaCount={0}
          tabSelectEvents={childTabSelectedFunc}
        />
      </div>
      {createTabs(
        `${tabId}`,
        dispSubSchemaIds,
        dispSubSchemaIdsNotDeleted,
        setDispSubSchemaIds,
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        loadedData,
        setIsLoading,
        setSaveResponse,
        childTabSelectedFunc,
        setChildTabSelectedFunc
      )}
    </>
  );
});

export default RootSchema;
