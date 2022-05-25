/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import { Panel } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import '../../views/Registration.css';
import { useLocation } from 'react-router-dom';
import CustomDivForm from './JESGOCustomForm';
import { CreateUISchema } from './UISchemaUtility';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { CustomSchema } from './SchemaUtility';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import {
  ChildTabSelectedFuncObj,
  createPanels,
  createTabs,
} from './FormCommonComponents';
import { Const } from '../../common/Const';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import { responseResult } from '../../common/DBUtility';
import store from '../../store';

// 孫スキーマ以降
type Props = {
  schemaId: number;
  parentTabsId: string;
  setDispSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  dispSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  documentId: string;
  isChildSchema: boolean;
  loadedData: SaveDataObjDefine | undefined;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
  isSchemaChange: boolean | undefined;
  selectedTabKey: any;
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void;
};

const PanelSchema = React.memo((props: Props) => {
  const {
    schemaId,
    parentTabsId,
    setDispSchemaIds,
    dispSchemaIds,
    documentId,
    isChildSchema,
    loadedData,
    setIsLoading,
    setSaveResponse,
    isSchemaChange,
    selectedTabKey,
    schemaAddModFunc,
  } = props;
  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId) as JesgoDocumentSchema;
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

  const [addedDocumentCount, setAddedDocumentCount] = useState<number>(0);

  const [childTabSelectedFunc, setChildTabSelectedFunc] =
    useState<ChildTabSelectedFuncObj>({
      fnAddDocument: schemaAddModFunc,
      fnSchemaChange: schemaAddModFunc,
    });

  const dispatch = useDispatch();
  const { state } = useLocation();

  const {
    document_schema: documentSchema,
    subschema,
    child_schema: childSchema,
  } = schemaInfo;
  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const isTab = customSchema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE] === 'tab';

  const uiSchema = CreateUISchema(customSchema);

  // console.log('---[PanelSchema]schemaInfo---');
  // console.log(schemaInfo);
  // console.log('---[PanelSchema]schema---');
  // console.log(customSchema);
  // console.log('---[PanelSchema]uiSchema---');
  // console.log(uiSchema);

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
            setAddedDocumentCount,
          });
        }
      });
    }
    setDispChildSchemaIdsNotDeleted(
      dispChildSchemaIds.filter((p) => p.deleted === false)
    );
  }, [dispChildSchemaIds]);

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
  });

  return (
    <Panel key={`panel-${schemaId}`} className="panel-style">
      <div className="content-area">
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
        <ControlButton
          tabId={parentTabsId}
          parentTabsId=""
          Type={COMP_TYPE.PANEL}
          isChildSchema={isChildSchema}
          schemaId={schemaId}
          documentId={documentId}
          dispSchemaIds={[...dispSchemaIds]}
          setDispSchemaIds={setDispSchemaIds}
          dispSubSchemaIds={[...dispSubSchemaIdsNotDeleted]}
          dispChildSchemaIds={[...dispChildSchemaIds]}
          setDispChildSchemaIds={setDispChildSchemaIds}
          childSchemaIds={childSchema}
          dispatch={dispatch}
          setFormData={setFormData}
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          subSchemaCount={subschema.length}
          tabSelectEvents={childTabSelectedFunc}
        />
      </div>
      {isTab
        ? // タブ表示
          createTabs(
            parentTabsId,
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
            parentTabsId
          )}
    </Panel>
  );
});

export default PanelSchema;
