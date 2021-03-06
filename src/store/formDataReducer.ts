import lodash from 'lodash';
import { Reducer } from 'redux';
import React from 'react';
import { JesgoDocumentSchema } from './schemaDataReducer';
import { RegistrationErrors } from '../common/CaseRegistrationUtility';

// 症例情報の定義
export type jesgoCaseDefine = {
  case_id: string;
  name: string;
  date_of_birth: string;
  date_of_death: string;
  sex: string;
  his_id: string;
  decline: boolean;
  registrant: number;
  last_updated: string;
  is_new_case: boolean;
};

// valueの定義
export type jesgoDocumentValueItem = {
  case_id: string;
  event_date: string;
  document: any;
  child_documents: string[];
  schema_id: number;
  schema_primary_id: number;
  schema_major_version: number;
  registrant: number;
  last_updated: string;
  readonly: boolean;
  deleted: boolean;
};

export type jesgoDocumentObjDefine = {
  key: string;
  value: jesgoDocumentValueItem;
  root_order: number;
  event_date_prop_name: string;
  death_data_prop_name: string;
  // TODO: 削除したキーは必要？
  delete_document_keys: string[];
  compId: string;
};

export interface SaveDataObjDefine {
  jesgo_case: jesgoCaseDefine;
  jesgo_document: jesgoDocumentObjDefine[];
}
export interface formDataState {
  formDatas: Map<string, any>;
  saveData: SaveDataObjDefine;
  loadData: SaveDataObjDefine;
  nextSeqNo: number;
  nextCompSeqNo: number;
  extraErrors: RegistrationErrors[];
  selectedTabIds: Map<string, string>;
  allTabList: Map<string, string[]>;
  maxDocumentCount: number | undefined; // ドキュメント追加時のサブスキーマ含む全ドキュメント数
  addedDocumentCount: number; // 追加されたドキュメント数
  tabSelectEvent?: (isTabSelected: boolean, eventKey: any) => void; // 保存後に実行するタブ選択イベント
  selectedTabKeyName: string;
  deletedDocuments: {
    parentDocumentId: string;
    deletedChildDocuments: jesgoDocumentObjDefine[];
  }[];
  processedDocumentIds: Set<string>;
}

export interface dispSchemaIdAndDocumentIdDefine {
  documentId: string;
  schemaId: number;
  deleted: boolean;
  compId: string;
  isSchemaChange?: boolean;
  isParentSchemaChange?: boolean;
  title: string;
  titleNum?: number;
}

// フォームデータ用Action
export interface formDataAction {
  type: string;
  id: string;
  schemaId: number;
  parentDocumentId: string;
  documentId: string;
  isInherit: boolean;
  inheritSchema: number[];
  formData: any;
  dispSchemaIds: number[];
  setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>;
  isRootSchema: boolean;
  dispChildSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispChildSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  subSchemaIds: dispSchemaIdAndDocumentIdDefine[];

  parentSubSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setParentSubSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;

  saveData: SaveDataObjDefine;
  schemaInfo: JesgoDocumentSchema;
  selectedChildTabId: string;
  parentTabsId: string;
  extraErrors: RegistrationErrors[];
  tabList: string[];

  maxDocumentCount: number | undefined;
  setAddedDocumentCount: React.Dispatch<React.SetStateAction<number>>;
  tabSelectEvent: (isTabSelected: boolean, eventKey: any) => void;
  selectedTabKeyName: string;

  isUpdateInput: boolean;
  isNotUniqueSubSchemaAdded: boolean;
  processedDocId: string;
}

// ユーザID取得
export const getLoginUserId = () => {
  const userIdStr = localStorage.getItem('user_id');
  if (userIdStr !== null) {
    return parseInt(userIdStr, 10);
  }
  return -1;
};

// // 患者情報用Action
export interface headerInfoAction {
  type: string;
  // 項目名
  headerItemName: string;
  // 値
  value: string | boolean;
}

const initialState: formDataState = {
  formDatas: new Map(),
  saveData: {
    jesgo_case: {
      case_id: '',
      name: '',
      his_id: '',
      sex: 'F',
      decline: false,
      date_of_death: '',
      date_of_birth: '',
      registrant: -1,
      last_updated: '',
      is_new_case: true,
    },
    jesgo_document: [],
  },
  loadData: {
    jesgo_case: {
      case_id: '',
      name: '',
      his_id: '',
      sex: 'F',
      decline: false,
      date_of_death: '',
      date_of_birth: '',
      registrant: -1,
      last_updated: '',
      is_new_case: true,
    },
    jesgo_document: [],
  },
  nextSeqNo: 1,
  nextCompSeqNo: 0,
  extraErrors: [],
  selectedTabIds: new Map(),
  allTabList: new Map(),
  maxDocumentCount: undefined,
  addedDocumentCount: 0,
  tabSelectEvent: undefined,
  selectedTabKeyName: '',
  deletedDocuments: [],
  processedDocumentIds: new Set(),
};

// 保存用オブジェクト作成(1スキーマ1オブジェクト)
const createJesgoDocumentValueItem = (
  actionType: string,
  schemaId: number,
  formData: any,
  schemaInfo: JesgoDocumentSchema | undefined
) => {
  const valueItem: jesgoDocumentValueItem = {
    case_id: '',
    event_date: '',
    document: null,
    child_documents: [],
    schema_id: -1,
    schema_primary_id: -1,
    schema_major_version: -1,
    registrant: -1,
    last_updated: '',
    readonly: false,
    deleted: false,
  };

  if (actionType.includes('ADD')) {
    valueItem.schema_id = schemaId;

    // バージョン情報設定(メジャーバージョン)
    if (schemaInfo) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      valueItem.schema_major_version = schemaInfo.version_major;
    }

    // スキーマのサロゲートID
    if (schemaInfo) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      valueItem.schema_primary_id = schemaInfo.schema_primary_id;
    }
  }

  if (formData) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    valueItem.document = formData;
  } else {
    valueItem.document = '';
  }

  // ログインユーザID
  valueItem.registrant = getLoginUserId();
  valueItem.last_updated = new Date().toLocaleString();

  return valueItem;
};

// アクション種別判定(ヘッダ情報)
const isHeaderInfoAction = (arg: any): arg is headerInfoAction =>
  typeof arg === 'object' &&
  arg !== null &&
  typeof (arg as headerInfoAction).headerItemName === 'string';

// 仮番発行
const getTmpSeq = (seqNo: number) => `K${seqNo}`;

// コンポーネントID発行
const getCompId = (formState: formDataState) => {
  // eslint-disable-next-line no-param-reassign
  formState.nextCompSeqNo += 1;
  return `C${formState.nextCompSeqNo}`;
};

// ドキュメント削除関数
const deleteDocument = (
  jesgoDocument: jesgoDocumentObjDefine[],
  documentId: string
) => {
  const deletedDocumentIds: string[] = [];

  const idx = jesgoDocument.findIndex((p) => p.key === documentId);
  if (idx > -1) {
    const docItem = jesgoDocument[idx];
    // 削除フラグ立てる
    docItem.value.deleted = true;

    deletedDocumentIds.push(docItem.key);

    // 子ドキュメントがあればそれもすべて削除
    if (docItem.value.child_documents.length > 0) {
      docItem.value.child_documents.forEach((childDocId) => {
        // 再帰呼び出し
        const tmpDeletedDocIds = deleteDocument(jesgoDocument, childDocId);
        tmpDeletedDocIds.forEach((id) => deletedDocumentIds.push(id));
      });
    }
  }

  return deletedDocumentIds;
};

const formDataReducer: Reducer<
  formDataState,
  formDataAction | headerInfoAction
> = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: formDataAction | headerInfoAction // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  // 初期化の場合は常に初期値返す
  if (action.type === 'INIT_STORE') {
    return initialState;
  }

  const copyState = lodash.cloneDeep(state); // 現在の状態をコピー

  const { formDatas, saveData } = copyState;

  console.log(`action.type=${action.type}`);

  if (isHeaderInfoAction(action)) {
    // ヘッダの患者情報入力
    switch (action.type) {
      case 'INPUT_HEADER': {
        const { jesgo_case: jesgoCaseData } = copyState.saveData;
        switch (action.headerItemName) {
          // 患者ID
          case 'patientId':
            jesgoCaseData.his_id = action.value as string;
            break;
          // 患者氏名
          case 'patientName':
            jesgoCaseData.name = action.value as string;
            break;
          // 生年月日(yyyy-MM-dd)
          case 'birthday':
            jesgoCaseData.date_of_birth = action.value as string;
            break;
          // 登録拒否
          case 'decline':
            jesgoCaseData.decline = action.value as boolean;
            break;
          default:
            break;
        }

        // 更新日時
        jesgoCaseData.last_updated = new Date().toLocaleString();
        // 更新ユーザ
        jesgoCaseData.registrant = getLoginUserId();

        break;
      }
      default:
        break;
    }
  } else if (action.type) {
    switch (action.type) {
      // タブ追加
      case 'ADD_PARENT':
      case 'ADD_CHILD': {
        // 親ドキュメントID取得。「ドキュメントの追加」からの場合はdocumentId、子スキーマの自動追加時はparentDocumentIdに格納されている
        const parentDocId =
          action.type === 'ADD_PARENT'
            ? action.documentId
            : action.parentDocumentId;

        // ドキュメントIDの発行
        const docId = getTmpSeq(copyState.nextSeqNo);
        copyState.nextSeqNo += 1;

        // コンポーネントIDの発行
        const compId = getCompId(copyState);

        // フォームデータの更新
        formDatas.set(docId, action.formData);

        // 保存用オブジェクト作成
        const item = createJesgoDocumentValueItem(
          action.type,
          action.schemaId,
          action.formData,
          action.schemaInfo
        );

        const objDefine: jesgoDocumentObjDefine = {
          key: docId,
          value: item,
          root_order: -1,
          event_date_prop_name: '',
          death_data_prop_name: '',
          delete_document_keys: [],
          compId,
        };

        const dispChildSchemaIds = action.dispChildSchemaIds;
        // ルートドキュメントを追加した場合はルートドキュメント同士の並び順を設定
        // 末尾に追加されるので、表示スキーマの個数を設定
        if (action.isRootSchema) {
          objDefine.root_order = dispChildSchemaIds.filter(
            (p) => p.deleted === false
          ).length;
        }
        saveData.jesgo_document.push(objDefine);

        // #region [ childDocuments更新処理 ]
        // 親ドキュメントがある場合は親のchildDdocumentsを更新
        if (parentDocId) {
          const parentDocData = saveData.jesgo_document.find(
            (p) => p.key === parentDocId
          );
          if (parentDocData) {
            // unique=falseのサブスキーマ追加時は同スキーマの右に追加する
            if (action.isNotUniqueSubSchemaAdded) {
              for (
                let i = parentDocData.value.child_documents.length - 1;
                i >= 0;
                i -= 1
              ) {
                // 子のdocumentIdの中で同スキーマのものを検索
                const childDocId = parentDocData.value.child_documents[i];
                const searchChildDoc = saveData.jesgo_document.find(
                  (p) =>
                    p.key === childDocId &&
                    p.value.schema_id === action.schemaId &&
                    p.value.deleted === false
                );
                if (searchChildDoc) {
                  // 同スキーマの右に追加(+1)
                  parentDocData.value.child_documents.splice(i + 1, 0, docId);
                  break;
                }
              }
            } else {
              // サブスキーマの自動展開、または子スキーマの場合は末尾に追加
              parentDocData.value.child_documents.push(docId);
            }
          }
        }
        // #endregion

        // 子ドキュメントの並び順保持用のdocumentIdを更新
        if (
          dispChildSchemaIds &&
          dispChildSchemaIds.length > 0 &&
          action.setDispChildSchemaIds
        ) {
          // documentIdがないもの=新規追加したもの
          const target = dispChildSchemaIds.find((p) => p.documentId === '');
          if (target) {
            target.documentId = docId;
            target.compId = compId;
            action.setDispChildSchemaIds([...dispChildSchemaIds]);
          }
        }

        // 追加通知
        copyState.addedDocumentCount += 1;
        if (action.setAddedDocumentCount) {
          action.setAddedDocumentCount(copyState.addedDocumentCount);
        }

        break;
      }

      // フォームの入力値変更。デフォルト値が入力された場合もここに来る
      case 'INPUT': {
        const updateDate = new Date().toLocaleString();

        const docId = action.documentId;

        // フォームデータの更新
        formDatas.set(docId, action.formData);

        // jesgo_document更新
        const idx = saveData.jesgo_document.findIndex((p) => p.key === docId);
        if (idx > -1) {
          const jesgoDoc = saveData.jesgo_document[idx];
          // schemaIdが指定されている場合(継承)、schemaIdを更新
          if (action.schemaId) {
            jesgoDoc.value.schema_id = action.schemaId;
          }
          jesgoDoc.value.document = action.formData; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          // 値の入力時のみ更新者情報を更新する
          if (action.isUpdateInput) {
            jesgoDoc.value.registrant = getLoginUserId();
            jesgoDoc.value.last_updated = updateDate;
          }

          // 新規文書の継承の場合、継承元の子ドキュメントは削除してリセットする
          if (action.isInherit) {
            const deletedDocIds: string[] = [];

            // 子、孫含め削除するdocumentIdを取得
            jesgoDoc.value.child_documents.forEach((childDocId) => {
              deletedDocIds.push(
                ...deleteDocument(saveData.jesgo_document, childDocId)
              );
            });

            if (deletedDocIds.length > 0) {
              // #region 継承後のデータ引継ぎ用に削除した子ドキュメントの情報を持っておく
              copyState.deletedDocuments = []; // 初期化
              copyState.processedDocumentIds = new Set(); // 反映済みドキュメントID初期化
              deletedDocIds.forEach((deleteDocId) => {
                // 親ドキュメント
                const pDoc = saveData.jesgo_document.find((p) =>
                  p.value.child_documents.includes(deleteDocId)
                );
                // 子ドキュメント
                const cDoc = saveData.jesgo_document.find(
                  (p) => p.key === deleteDocId
                );

                const target = copyState.deletedDocuments.find(
                  (p) => p.parentDocumentId === pDoc?.key ?? ''
                );
                if (target && cDoc) {
                  target.deletedChildDocuments.push(lodash.cloneDeep(cDoc));
                } else if (cDoc) {
                  copyState.deletedDocuments.push({
                    parentDocumentId: pDoc?.key ?? '',
                    deletedChildDocuments: [lodash.cloneDeep(cDoc)],
                  });
                }
              });

              // #endregion

              // 新規文書の場合は物理削除
              if (docId.startsWith('K')) {
                // saveDataから子ドキュメントを物理削除
                saveData.jesgo_document = saveData.jesgo_document.filter(
                  (p) => !deletedDocIds.includes(p.key)
                );
                // formDatasからも物理削除
                deletedDocIds.forEach((childDocId) => {
                  formDatas.delete(childDocId);
                });
              }
            }

            // 子ドキュメントリセット
            jesgoDoc.value.child_documents.length = 0;
          }
        }
        break;
      }

      // データ引継ぎ済みdocumentIdの更新
      case 'DATA_TRANSFER_PROCESSED': {
        if (action.processedDocId) {
          copyState.processedDocumentIds.add(action.processedDocId);
        }
        break;
      }

      case 'DEL': {
        // 削除フラグを立てる
        const deletedIds = deleteDocument(
          saveData.jesgo_document,
          action.documentId
        );

        // // 削除したIDを保存
        // if(deletedIds.length > 0) {
        //   deletedIds.filter(id => saveData.delete_document_keys.includes(id) === false)
        //   .forEach(id => saveData.delete_document_keys.push(id))
        // }

        // 新規作成して保存せずに削除したドキュメントは物理削除する
        if (deletedIds.length > 0) {
          const deleteInsertIds = deletedIds.filter((id) => id.startsWith('K'));
          if (deleteInsertIds.length > 0) {
            // 削除するドキュメント以外でフィルターする
            saveData.jesgo_document = saveData.jesgo_document.filter(
              (p) => !deleteInsertIds.includes(p.key)
            );

            // 親ドキュメントがある場合はchild_documentsから削除
            deleteInsertIds.forEach((delId) => {
              const delParentDoc = saveData.jesgo_document.find((p) =>
                p.value.child_documents.includes(delId)
              );
              if (delParentDoc) {
                delParentDoc.value.child_documents =
                  delParentDoc.value.child_documents.filter((p) => p !== delId);
              }
            });
          }
        }

        break;
      }

      // ドキュメントの並び替え
      case 'SORT': {
        const dispChildSchemaIds = action.dispChildSchemaIds;
        if (action.isRootSchema) {
          const dispChildSchemaIdsNotDeleted = dispChildSchemaIds.filter(
            (p) => p.deleted === false
          );

          // ルートタブを移動した場合、jesgo_documentのrootOrder(並び順)を更新
          // dispChildSchemaIdsに並び替え後の状態が入っているのでそれに応じてrootOrder振り直す
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < dispChildSchemaIdsNotDeleted.length; i++) {
            const idx = saveData.jesgo_document.findIndex(
              (p) => p.key === dispChildSchemaIdsNotDeleted[i].documentId
            );
            if (idx > -1) {
              saveData.jesgo_document[idx].root_order = i + 1;
            }
          }
        } else if (dispChildSchemaIds.length > 0) {
          const idx = saveData.jesgo_document.findIndex((p) =>
            p.value.child_documents.includes(dispChildSchemaIds[0].documentId)
          );
          if (idx > -1) {
            // サブスキーマの並び順は変わらないので、サブスキーマ＋子スキーマでセットする
            saveData.jesgo_document[idx].value.child_documents = [
              ...action.subSchemaIds,
              ...dispChildSchemaIds,
            ].map((p) => p.documentId);
          }
        }

        break;
      }

      // DB保存時に作成されたsaveDataをstoreに保存しておく
      case 'SAVE': {
        copyState.saveData = action.saveData;
        break;
      }

      // 読み込んだデータをstoreに保存
      case 'SAVE_LOADDATA': {
        copyState.saveData = action.saveData;

        // コンポーネントID初期化
        copyState.nextCompSeqNo = 0;

        // コンポーネントIDの割り当て
        // 何故か保存の度に並び順変わることあるのでdocumentIdでソートしてから振る
        copyState.saveData.jesgo_document
          .sort(
            (f, s) =>
              Number.parseInt(f.key.toString(), 10) -
              Number.parseInt(s.key.toString(), 10)
          )
          .forEach((doc: jesgoDocumentObjDefine) => {
            // eslint-disable-next-line no-param-reassign
            doc.compId = getCompId(copyState);
          });

        // 差分比較用に読込時点のデータを保存
        copyState.loadData = lodash.cloneDeep(copyState.saveData);

        copyState.formDatas.clear();

        // フォームデータの更新
        if (action.saveData.jesgo_document.length > 0) {
          action.saveData.jesgo_document.forEach(
            (doc: jesgoDocumentObjDefine) => {
              copyState.formDatas.set(doc.key, doc.value.document);
            }
          );
        }

        break;
      }

      // 子タブ選択
      case 'SELECTED_TAB': {
        // 選択した子タブのIDと親のTabsのIDを保持する
        copyState.selectedTabIds.set(
          action.parentTabsId,
          action.selectedChildTabId
        );
        break;
      }

      case 'SET_ERROR': {
        copyState.extraErrors = action.extraErrors;
        break;
      }
      // 親タブにある子タブも含めたタブ名一覧を保持する
      case 'TAB_LIST': {
        copyState.allTabList.set(action.parentTabsId, action.tabList);
        break;
      }

      // 追加するドキュメント数など更新
      case 'ADD_DOCUMENT_STATUS': {
        copyState.maxDocumentCount = action.maxDocumentCount; // 追加ドキュメント最大数
        copyState.addedDocumentCount = 0; // 追加済み件数はリセット
        copyState.tabSelectEvent = action.tabSelectEvent; // 追加後の実行されるTabSelectEvent
        copyState.selectedTabKeyName = action.selectedTabKeyName; // 選択するタブ名
        break;
      }

      default: {
        break;
      }
    }
  }

  return copyState;
};

export default formDataReducer;
