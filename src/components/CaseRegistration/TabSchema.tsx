/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import { useDispatch } from 'react-redux';
import CustomDivForm from './JESGOCustomForm';
import {
  GetBeforeInheritDocumentData,
  GetHiddenPropertyNames,
  GetSchemaTitle,
  SetSameSchemaTitleNumbering,
  SetTabStyle,
  hasFormDataInput,
  isInfiniteLoopBlackList,
} from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import {
  dispSchemaIdAndDocumentIdDefine,
  jesgoDocumentObjDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { CustomSchema, GetSchemaInfo } from './SchemaUtility';
import { createPanels, createTabs } from './FormCommonComponents';
import { ChildTabSelectedFuncObj, RegistrationErrors } from './Definition';
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>;
  subSchemaCount: number;
  isSchemaChange: boolean | undefined;
  isParentSchemaChange: boolean | undefined;
  setErrors: React.Dispatch<React.SetStateAction<RegistrationErrors[]>>;
  selectedTabKey: any;
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void;
  setUpdateFormData: React.Dispatch<React.SetStateAction<boolean>>;
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
    setIsLoading,
    setSaveResponse,
    setSelectedTabKey,
    subSchemaCount,
    isSchemaChange,
    isParentSchemaChange,
    setErrors,
    selectedTabKey,
    schemaAddModFunc,
    setUpdateFormData,
  } = props;

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

  const [addedDocumentCount, setAddedDocumentCount] = useState<number>(-1);

  // 子ドキュメントの更新有無
  const [updateChildFormData, setUpdateChildFormData] =
    useState<boolean>(false);

  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId) as JesgoDocumentSchema;
  const {
    document_schema: documentSchema,
    subschema,
    child_schema: childSchema,
  } = schemaInfo;

  // unique=falseの追加可能なサブスキーマまたは未作成サブスキーマ
  const addableSubSchemaIds = useMemo(() => {
    const retIds: number[] = [];
    if (subschema.length > 0) {
      subschema.forEach((id) => {
        const info = GetSchemaInfo(id);
        if (info) {
          if (
            (info.document_schema[Const.EX_VOCABULARY.UNIQUE] ?? false) ===
              false ||
            !dispSubSchemaIds.find(
              (p) => p.deleted === false && p.schemaId === info.schema_id
            )
          ) {
            retIds.push(id);
          }
        }
      });
    }
    return retIds;
  }, [subschema, dispSubSchemaIds]);

  const dispatch = useDispatch();

  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const isTab = customSchema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE] === 'tab';

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
      dispSubSchemaIds.length > 0 &&
      dispSubSchemaIds.find((p) => p.documentId === '')
    ) {
      // unieque=falseのサブスキーマ追加
      const newItem = dispSubSchemaIds.find((p) => p.documentId === '');
      if (newItem) {
        const itemSchemaInfo = GetSchemaInfo(newItem.schemaId);
        dispatch({
          type: 'ADD_CHILD',
          schemaId: newItem.schemaId,
          documentId: newItem.documentId,
          formData: {},
          parentDocumentId: documentId,
          dispChildSchemaIds: dispSubSchemaIds,
          setDispChildSchemaIds: setDispSubSchemaIds,
          isRootSchema: false,
          schemaInfo: itemSchemaInfo,
          setAddedDocumentCount,
          isNotUniqueSubSchemaAdded: true,
        });
      }
    } else if (
      subschema.length > 0 &&
      (isSchemaChange ||
        isParentSchemaChange ||
        (dispSubSchemaIds.length === 0 && documentId.startsWith('K')))
    ) {
      dispSubSchemaIds.length = 0; // 一旦クリア
      subschema.forEach((id) => {
        const item: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: id,
          deleted: false,
          compId: '',
          title: GetSchemaTitle(id),
          isParentSchemaChange: isParentSchemaChange || isSchemaChange,
        };
        if (isInfiniteLoopBlackList(item.schemaId) === false) {
          dispSubSchemaIds.push(item);

          let inheritDocuments: jesgoDocumentObjDefine[] = [];
          // 継承した場合は削除したドキュメントの中から同じスキーマのドキュメントを取得
          if (isSchemaChange || isParentSchemaChange) {
            inheritDocuments = GetBeforeInheritDocumentData(documentId, id);
          }

          if (inheritDocuments.length > 0) {
            inheritDocuments.forEach((inheritItem) => {
              const itemSchemaInfo = GetSchemaInfo(inheritItem.value.schema_id);

              // 同一サブスキーマが複数あった場合の対応
              if (
                inheritDocuments.length >
                dispSubSchemaIds.filter((p) => p.schemaId === id).length
              ) {
                dispSubSchemaIds.push({
                  documentId: '',
                  schemaId: inheritItem.value.schema_id,
                  deleted: false,
                  compId: '',
                  title: GetSchemaTitle(inheritItem.value.schema_id),
                  isParentSchemaChange: isParentSchemaChange || isSchemaChange,
                });
              }

              dispatch({
                type: 'ADD_CHILD',
                schemaId: inheritItem.value.schema_id,
                documentId: '',
                formData: inheritItem.value.document,
                parentDocumentId: documentId,
                dispChildSchemaIds: dispSubSchemaIds,
                setDispChildSchemaIds: setDispSubSchemaIds,
                isRootSchema: false,
                schemaInfo: itemSchemaInfo,
                setAddedDocumentCount,
                processedDocId: inheritItem.key,
              });
            });
          } else if (!item.documentId) {
            // 新規時は必ずドキュメント作成する
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
        }
      });
    } else if (dispSubSchemaIds.length > 0) {
      // サブスキーマがあるスキーマからないスキーマへ継承時に残ってしまうのでクリアする
      if (subschema.length === 0 && (isSchemaChange || isParentSchemaChange)) {
        dispSubSchemaIds.length = 0;
      }
      // タイトル振り直し
      dispSubSchemaIds.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.title = GetSchemaTitle(item.schemaId);
      });
    }

    SetSameSchemaTitleNumbering(dispSubSchemaIds, dispChildSchemaIds);

    setDispSubSchemaIdsNotDeleted(
      dispSubSchemaIds.filter((p) => p.deleted === false)
    );

    // 継承スキーマの場合は再作成完了後に親ドキュメントのフラグを降ろす
    if (isSchemaChange || isParentSchemaChange) {
      setDispSchemaIds(
        dispSchemaIds.map((p) => {
          if (p.documentId === documentId) {
            p.isSchemaChange = false;
            p.isParentSchemaChange = false;
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
    // 編集中のデータ
    const editedDocuments =
      store.getState().formDataReducer.saveData.jesgo_document;

    let parentDoc = editedDocuments.find((p) => p.key === documentId);

    if (isParentSchemaChange) {
      // TODO: ★関数化したい
      // データ引継ぎ済みdocumentId一覧
      const processedDocumentIds =
        store.getState().formDataReducer.processedDocumentIds;
      let sourceDoc: jesgoDocumentObjDefine | undefined;
      store.getState().formDataReducer.deletedDocuments.some((item1) =>
        // スキーマ継承により削除されたドキュメントの中から同じスキーマIDのものを復元する
        item1.deletedChildDocuments.some((item2) => {
          if (
            item2.value.schema_id === schemaId &&
            !processedDocumentIds.find((p) => p[0] === item2.key)
          ) {
            sourceDoc = item2;
            return true;
          }
          return false;
        })
      );

      if (sourceDoc) {
        parentDoc = sourceDoc;
        dispatch({
          type: 'DATA_TRANSFER_PROCESSED',
          processedDocId: sourceDoc.key,
          processedNewDocId: documentId,
        });
      }
    }
    if (parentDoc) {
      setFormData(parentDoc.value.document);
      dispatch({
        type: 'INPUT',
        schemaId,
        formData: parentDoc.value.document,
        documentId,
        isUpdateInput: false,
      });

      const childDocuments = parentDoc.value.child_documents;

      // 子ドキュメントがあればサブスキーマとchildスキーマを判定してそれぞれの配列に格納
      if (childDocuments.length > 0) {
        childDocuments.forEach((childDocId) => {
          const childDoc = editedDocuments.find((p) => p.key === childDocId);
          if (childDoc) {
            const item: dispSchemaIdAndDocumentIdDefine = {
              documentId: childDoc.key,
              schemaId: childDoc.value.schema_id,
              deleted: childDoc.value.deleted,
              compId: childDoc.compId,
              title: GetSchemaTitle(childDoc.value.schema_id),
            };

            const cDocSchemaInfo = GetSchemaInfo(childDoc.value.schema_id);

            // サブスキーマに追加
            // unique=falseのサブスキーマの場合もサブスキーマに追加する必要あり
            if (
              subschema.length > 0 &&
              (!dispSubSchemaIds.find(
                (p) => p.schemaId === childDoc.value.schema_id
              ) ||
                addableSubSchemaIds.includes(childDoc.value.schema_id)) &&
              subSchemaAndInherit.includes(childDoc.value.schema_id)
            ) {
              dispSubSchemaIds.push(item);
            } else if (
              cDocSchemaInfo?.base_schema &&
              addableSubSchemaIds.includes(cDocSchemaInfo.base_schema)
            ) {
              // 継承元のスキーマがサブスキーマの場合もサブスキーマに追加
              dispSubSchemaIds.push(item);
            } else {
              // childスキーマに追加
              dispChildSchemaIds.push(item);
            }
          }
        });

        SetSameSchemaTitleNumbering(dispSubSchemaIds, dispChildSchemaIds);

        if (dispSubSchemaIds.length > 0) {
          setDispSubSchemaIds([...dispSubSchemaIds]);
        }
        if (dispChildSchemaIds.length > 0) {
          setDispChildSchemaIds([...dispChildSchemaIds]);
        }
      }
    }
  }, [documentId]);

  // サブスキーマ
  useEffect(() => {
    createSubSchemaDocument();
  }, [dispSubSchemaIds, isSchemaChange]);

  // childスキーマの生成
  useEffect(() => {
    if (isSchemaChange || isParentSchemaChange) {
      dispChildSchemaIds.length = 0; // 一旦クリア
      // 継承した場合は削除したドキュメントの中から同じスキーマのドキュメントを取得
      if (childSchema.length > 0) {
        const searchChildDocs: jesgoDocumentObjDefine[] = [];
        childSchema.forEach((id) => {
          if (isSchemaChange || isParentSchemaChange) {
            searchChildDocs.push(
              ...GetBeforeInheritDocumentData(documentId, id)
            );
          }
        });

        if (searchChildDocs && searchChildDocs.length > 0) {
          searchChildDocs.forEach((doc) => {
            const item: dispSchemaIdAndDocumentIdDefine = {
              documentId: '',
              schemaId: doc.value.schema_id,
              deleted: false,
              compId: '',
              title: GetSchemaTitle(doc.value.schema_id),
              isParentSchemaChange: isParentSchemaChange || isSchemaChange,
            };
            dispChildSchemaIds.push(item);

            dispatch({
              type: 'ADD_CHILD',
              schemaId: item.schemaId,
              documentId: item.documentId,
              formData: doc.value.document,
              parentDocumentId: documentId,
              dispChildSchemaIds,
              setDispChildSchemaIds,
              isRootSchema: false,
              schemaInfo: GetSchemaInfo(doc.value.schema_id),
              setAddedDocumentCount,
              processedDocId: doc.key,
            });
          });
        }
      }
    }

    if (
      dispChildSchemaIds.length > 0 &&
      !isSchemaChange &&
      !isParentSchemaChange
    ) {
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
        item.title = GetSchemaTitle(item.schemaId);
      });

      SetSameSchemaTitleNumbering(dispSubSchemaIds, dispChildSchemaIds);
    }
    setDispChildSchemaIdsNotDeleted(
      dispChildSchemaIds.filter((p) => p.deleted === false)
    );
  }, [dispChildSchemaIds, isSchemaChange]);

  // ドキュメントの並び順を更新
  useEffect(() => {
    dispatch({
      type: 'SORT',
      subSchemaIds: dispSubSchemaIds,
      dispChildSchemaIds,
      isRootSchema: false,
    });
  }, [dispSubSchemaIds, dispChildSchemaIds]);

  // スクロール位置復元
  useLayoutEffect(() => {
    const scrollTop = store.getState().commonReducer.scrollTop;
    if (scrollTop && document.scrollingElement) {
      document.scrollingElement.scrollTop = scrollTop;
    }
  }, []);

  useEffect(() => {
    // 入力内容に応じてタブのフォントを設定

    // 変更前の現在のドキュメントの入力状態
    const beforeInputState =
      store.getState().formDataReducer.formDataInputStates.get(documentId) ??
      false;

    let hasInput = false;
    // 子のドキュメントはsaveDataから検索
    const docIdList = dispSubSchemaIdsNotDeleted.map((p) => p.documentId);
    docIdList.push(...dispChildSchemaIdsNotDeleted.map((p) => p.documentId));

    const formDataInputStates =
      store.getState().formDataReducer.formDataInputStates;
    // eslint-disable-next-line no-restricted-syntax
    for (const docId of docIdList) {
      if (formDataInputStates.get(docId)) {
        hasInput = true;
        break;
      }
    }
    setUpdateChildFormData(false);

    // 子ドキュメントに入力がなければ自身のドキュメントチェック
    if (!hasInput) {
      const hiddenItems = GetHiddenPropertyNames(customSchema);
      // 非表示項目は除外
      const copyFormData = lodash.omit(formData, hiddenItems);
      hasInput = hasFormDataInput(copyFormData, schemaId);
    }

    if (beforeInputState !== hasInput) {
      SetTabStyle(`${parentTabsId}-tabs-tab-${tabId}`, hasInput);

      dispatch({
        type: 'SET_FORMDATA_INPUT_STATE',
        documentId,
        hasFormDataInput: hasInput,
      });

      // 親タブに子タブの更新を伝える
      setUpdateFormData(true);
    }
  }, [formData, updateChildFormData]);

  return (
    <>
      <div className="content-area">
        <CustomDivForm
          documentId={documentId}
          schemaId={schemaId}
          dispatch={dispatch}
          setFormData={setFormData}
          schema={customSchema}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          isTabItem
          setErrors={setErrors}
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
          dispSubSchemaIds={[...dispSubSchemaIds]}
          setDispSubSchemaIds={setDispSubSchemaIds}
          setDispChildSchemaIds={setDispChildSchemaIds}
          childSchemaIds={childSchema}
          documentId={documentId}
          setFormData={setFormData}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          setSelectedTabKey={setSelectedTabKey}
          subSchemaCount={subSchemaCount}
          tabSelectEvents={childTabSelectedFunc}
          addableSubSchemaIds={addableSubSchemaIds}
          setIsLoading={setIsLoading}
        />
      </div>
      {isTab
        ? // タブ表示
          createTabs(
            tabId,
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            setIsLoading,
            setSaveResponse,
            setErrors,
            childTabSelectedFunc,
            setChildTabSelectedFunc,
            setUpdateChildFormData
          )
        : // パネル表示
          createPanels(
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            setIsLoading,
            setSaveResponse,
            setErrors,
            selectedTabKey,
            schemaAddModFunc,
            tabId,
            setUpdateChildFormData
          )}
    </>
  );
});

export default TabSchema;
