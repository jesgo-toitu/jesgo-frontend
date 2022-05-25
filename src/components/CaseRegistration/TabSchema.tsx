/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import { UiSchema } from '@rjsf/core';
import { useDispatch } from 'react-redux';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { CreateUISchema } from './UISchemaUtility';
import CustomDivForm from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { CustomSchema } from './SchemaUtility';
import {
  ChildTabSelectedFuncObj,
  createPanels,
  createTabs,
} from './FormCommonComponents';
import { Const } from '../../common/Const';
import { responseResult } from '../../common/DBUtility';
import '../../views/Registration.css';
import store from '../../store';

// ルートディレクトリ直下の子スキーマ
type Props = {
  tabId: string;
  parentTabsId: string;
  schemaId: number;
  dispSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  documentId: string;
  isChildSchema: boolean;
  loadedData: SaveDataObjDefine | undefined;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>;
  subSchemaCount: number;
  isSchemaChange: boolean | undefined;
  selectedTabKey: any;
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void;
};

const TabSchema = React.memo((props: Props) => {
  const {
    tabId,
    parentTabsId,
    schemaId,
    dispSchemaIds,
    setDispSchemaIds,
    documentId,
    isChildSchema,
    loadedData,
    setIsLoading,
    setSaveResponse,
    setSelectedTabKey,
    subSchemaCount,
    isSchemaChange,
    selectedTabKey,
    schemaAddModFunc,
  } = props;

  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId) as JesgoDocumentSchema;
  const {
    document_schema: documentSchema,
    subschema,
    child_schema: childSchema,
  } = schemaInfo;

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

  const [addedDocumentCount, setAddedDocumentCount] = useState<number>(0);

  const dispatch = useDispatch();

  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const isTab = customSchema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE] === 'tab';
  const uiSchema: UiSchema = CreateUISchema(customSchema);
  uiSchema['ui:ObjectFieldTemplate'] = JESGOFiledTemplete.TabItemFieldTemplate;

  const [childTabSelectedFunc, setChildTabSelectedFunc] =
    useState<ChildTabSelectedFuncObj>({
      fnAddDocument: schemaAddModFunc, // ドキュメント追加後のTabSelectEvent
      fnSchemaChange: schemaAddModFunc, // 継承後のTabSelectEvent
    });

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

  useLayoutEffect(() => {
    const scrollTop = store.getState().commonReducer.scrollTop;
    if (scrollTop && document.scrollingElement) {
      document.scrollingElement.scrollTop = scrollTop;
    }
  });

  return (
    <>
      <div className="content-area">
        <CustomDivForm
          documentId={documentId}
          schemaId={schemaId}
          dispatch={dispatch}
          setFormData={setFormData}
          schema={customSchema}
          uiSchema={uiSchema}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        />
        <ControlButton
          tabId={tabId}
          parentTabsId={parentTabsId}
          schemaId={schemaId}
          Type={COMP_TYPE.TAB}
          isChildSchema={isChildSchema}
          dispatch={dispatch}
          dispSchemaIds={[...dispSchemaIds]}
          setDispSchemaIds={setDispSchemaIds}
          dispChildSchemaIds={[...dispChildSchemaIds]}
          dispSubSchemaIds={[...dispSubSchemaIdsNotDeleted]}
          setDispChildSchemaIds={setDispChildSchemaIds}
          childSchemaIds={childSchema}
          documentId={documentId}
          setFormData={setFormData}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          setSelectedTabKey={setSelectedTabKey}
          subSchemaCount={subSchemaCount}
          tabSelectEvents={childTabSelectedFunc}
        />
      </div>
      {isTab
        ? // タブ表示
          createTabs(
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
          )
        : // パネル表示
          createPanels(
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            loadedData,
            setIsLoading,
            setSaveResponse,
            selectedTabKey,
            schemaAddModFunc,
            tabId
          )}
    </>
  );
});

export default TabSchema;
