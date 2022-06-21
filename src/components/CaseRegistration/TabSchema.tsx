/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import { useDispatch } from 'react-redux';
import CustomDivForm from './JESGOCustomForm';
import {
  GetBeforeInheritDocumentData,
  GetHiddenPropertyNames,
  GetInheritFormData,
  GetSchemaInfo,
  RegistrationErrors,
  GetSchemaTitle,
  SetSameSchemaTitleNumbering,
  SetTabStyle,
} from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import {
  dispSchemaIdAndDocumentIdDefine,
  jesgoDocumentObjDefine,
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
  isParentSchemaChange: boolean | undefined;
  setErrors: React.Dispatch<React.SetStateAction<RegistrationErrors[]>>;
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
    isParentSchemaChange,
    setErrors,
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

  // unique=falseの追加可能なサブスキーマ
  const addableSubSchemaIds = useMemo(() => {
    const retIds: number[] = [];
    if (subschema.length > 0) {
      subschema.forEach((id) => {
        const info = GetSchemaInfo(id);
        if (info) {
          if (
            (info.document_schema[Const.EX_VOCABULARY.UNIQUE] ?? false) ===
            false
          ) {
            retIds.push(id);
          }
        }
      });
    }
    return retIds;
  }, [subschema]);

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

  const [updateChildPanelFormData, setUpdateChildPanelFormData] =
    useState<boolean>(false);

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
          title: GetSchemaTitle(id),
          isParentSchemaChange: isParentSchemaChange || isSchemaChange,
        };
        dispSubSchemaIds.push(item);

        let inheritDocuments: jesgoDocumentObjDefine[] = [];
        // 継承した場合は削除したドキュメントの中から同じスキーマのドキュメントを取得
        if (isSchemaChange) {
          inheritDocuments = GetBeforeInheritDocumentData(documentId, id);
        } else if (isParentSchemaChange) {
          // 親スキーマで継承されていた場合は自身のdocIdは振り直しされているので全検索する
          inheritDocuments = GetBeforeInheritDocumentData('', id);
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
            });

            dispatch({
              type: 'DATA_TRANSFER_PROCESSED',
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
              !processedDocumentIds.has(item2.key)
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
            const childDoc = loadedData.jesgo_document.find(
              (p) => p.key === childDocId
            );
            if (childDoc) {
              const item: dispSchemaIdAndDocumentIdDefine = {
                documentId: childDoc.key,
                schemaId: childDoc.value.schema_id,
                deleted: childDoc.value.deleted,
                compId: childDoc.compId,
                title: GetSchemaTitle(childDoc.value.schema_id),
              };

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
    }
  }, [loadedData, documentId]);

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
          if (isSchemaChange) {
            searchChildDocs.push(
              ...GetBeforeInheritDocumentData(documentId, id)
            );
          } else if (isParentSchemaChange) {
            searchChildDocs.push(...GetBeforeInheritDocumentData('', id));
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
            });

            dispatch({
              type: 'DATA_TRANSFER_PROCESSED',
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

    const hiddenItems = GetHiddenPropertyNames(customSchema);
    // 非表示項目は除外
    const copyFormData = lodash.omit(formData, hiddenItems);

    SetTabStyle(`${parentTabsId}-tabs-tab-${tabId}`, copyFormData, schemaId);
  }, [formData]);

  // 子のパネルスキーマの入力内容変更時のタブフォント設定
  useEffect(() => {
    if (updateChildPanelFormData) {
      const formDataArray: any[] = [];

      const hiddenItems = GetHiddenPropertyNames(customSchema);
      const copyFormData = lodash.omit(formData, hiddenItems);
      formDataArray.push(copyFormData); // 自分自身のフォームデータもチェック対象

      // パネル表示の場合、子のドキュメントをチェックする
      if (!isTab) {
        const jesgoDocument =
          store.getState().formDataReducer.saveData.jesgo_document;
        // 子のドキュメントはsaveDataから検索
        const docIdList = dispSubSchemaIdsNotDeleted.map((p) => p.documentId);
        docIdList.push(
          ...dispChildSchemaIdsNotDeleted.map((p) => p.documentId)
        );

        jesgoDocument
          .filter((p) => docIdList.includes(p.key))
          .forEach((document) => {
            // スキーマ情報取得
            const tmpSchemaInfo = GetSchemaInfo(document.value.schema_id);
            if (tmpSchemaInfo) {
              // UIスキーマ生成
              const tmpCustomSchema = CustomSchema({
                orgSchema: tmpSchemaInfo.document_schema,
                formData: document.value.document,
              }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

              // 非表示項目を除外したformDataを生成
              const tmpHiddenItems = GetHiddenPropertyNames(tmpCustomSchema);
              const tmpCopyFormData = lodash.omit(
                document.value.document,
                tmpHiddenItems
              );

              formDataArray.push(tmpCopyFormData);
            }
          });
      }

      // 入力内容に応じてタブのフォントを設定
      SetTabStyle(`${parentTabsId}-tabs-tab-${tabId}`, formDataArray, schemaId);

      setUpdateChildPanelFormData(false);
    }
  }, [updateChildPanelFormData]);

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
            loadedData,
            setIsLoading,
            setSaveResponse,
            setErrors,
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
            setErrors,
            selectedTabKey,
            schemaAddModFunc,
            tabId,
            setUpdateChildPanelFormData
          )}
    </>
  );
});

export default TabSchema;
