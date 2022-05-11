import React, { useEffect, useMemo, useState } from 'react';
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
import { createPanels, createTabs } from './FormCommonComponents';
import { Const } from '../../common/Const';
import { responseResult } from '../../common/DBUtility';
import '../../views/Registration.css';
import store from '../../store';

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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
  parentTabsId: string;
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>;
  subSchemaCount: number;
  isSchemaChange: boolean | undefined;
};

const TabSchema = React.memo((props: Props) => {
  const {
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
  } = props;

  // console.log('tabschema');
  // console.log(GetRootSchema());
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

  const dispatch = useDispatch();

  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const isTab = customSchema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE] === 'tab';
  const uiSchema: UiSchema = CreateUISchema(customSchema);
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
      dispSubSchemaIds.length === 0 &&
      (!loadedData || documentId.startsWith('K') || isSchemaChange)
    ) {
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

        if (isSchemaChange) {
          // 継承した場合は子ドキュメントがクリアされるので、サブスキーマ再作成
          createSubSchemaDocument();
        } else {
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
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          setSelectedTabKey={setSelectedTabKey}
          subSchemaCount={subSchemaCount}
        />
      </div>
      {isTab
        ? // タブ表示
          createTabs(
            'tabschema',
            dispSubSchemaIds,
            dispSubSchemaIdsNotDeleted,
            setDispSubSchemaIds,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            loadedData,
            setIsLoading,
            setSaveResponse
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
            setSaveResponse
          )}
    </>
  );
});

export default TabSchema;
