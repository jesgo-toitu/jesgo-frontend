import React, { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
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
import { Const } from '../../common/Const';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import { responseResult } from '../../common/DBUtility';
import store from '../../store';

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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>;
  isSchemaChange: boolean | undefined;
};

const PanelSchema = React.memo((props: Props) => {
  const {
    schemaId,
    setDispSchemaIds,
    dispSchemaIds,
    documentId,
    isChildSchema,
    loadedData,
    setIsLoading,
    setSaveResponse,
    isSchemaChange,
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

  const dispatch = useDispatch();

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
          formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          subSchemaCount={subschema.length}
        />
      </div>
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
    </Panel>
  );
});

export default PanelSchema;
