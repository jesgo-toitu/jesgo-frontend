import lodash from 'lodash';
import { Reducer } from 'redux';
import React from 'react';

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
};

export interface SaveDataObjDefine {
  jesgo_case: jesgoCaseDefine;
  jesgo_document: jesgoDocumentObjDefine[];
}
export interface formDataState {
  formDatas: Map<string, any>;
  saveData: SaveDataObjDefine;
  nextSeqNo: number;
}

export interface dispSchemaIdAndDocumentIdDefine {
  documentId: string;
  schemaId: number;
  deleted: boolean;
}

// フォームデータ用Action
export interface formDataAction {
  type: string;
  id: string;
  schemaId: number;
  parentDocumentId: string;
  documentId: string;
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
  nextSeqNo: 1,
};

// 保存用オブジェクト作成(1スキーマ1オブジェクト)
const createJesgoDocumentValueItem = (
  actionType: string,
  schemaId: number,
  formData: any
) => {
  const valueItem: jesgoDocumentValueItem = {
    case_id: '',
    event_date: '',
    document: null,
    child_documents: [],
    schema_id: -1,
    schema_major_version: -1,
    registrant: -1, // TODO: ログインIDはどこから取得する？
    last_updated: '',
    readonly: false,
    deleted: false,
  };

  if (actionType.includes('ADD')) {
    valueItem.schema_id = schemaId;
    // TODO: メジャーバージョンどこから持ってくる？
    // ret.schemaMajorVersion
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

// ドキュメント削除関数
const deleteDocument = (
  jesgoDocument: jesgoDocumentObjDefine[],
  documentId: string
) => {
  // TODO: 未保存データの削除は物理削除したい

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
  const copyState = lodash.cloneDeep(state); // 現在の状態をコピー

  const { formDatas, saveData } = copyState;

  console.log(`action.type=${action.type}`);
  console.log(action);

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

        // フォームデータの更新
        formDatas.set(docId, action.formData);

        // 保存用オブジェクト作成
        const item = createJesgoDocumentValueItem(
          action.type,
          action.schemaId,
          action.formData
        );

        const objDefine: jesgoDocumentObjDefine = {
          key: docId,
          value: item,
          root_order: -1,
          event_date_prop_name: '',
          death_data_prop_name: '',
          delete_document_keys: [],
        };

        const dispChildSchemaIds = action.dispChildSchemaIds;
        // ルートドキュメントを追加した場合はルートドキュメント同士の並び順を設定
        // 末尾に追加されるので、表示スキーマの個数を設定
        if (action.isRootSchema) {
          objDefine.root_order = dispChildSchemaIds.length;
        }
        saveData.jesgo_document.push(objDefine);

        // 親ドキュメントがある場合は親のchildDdocumentsに追加
        if (parentDocId) {
          const parentDocData = saveData.jesgo_document.find(
            (p) => p.key === parentDocId
          );
          if (parentDocData) {
            parentDocData.value.child_documents.push(docId);
          }
        }

        // 子ドキュメントの並び順保持用のdocumentIdを更新。追加時は末尾なので最後の要素を書き換える
        if (
          dispChildSchemaIds &&
          dispChildSchemaIds.length > 0 &&
          action.setDispChildSchemaIds
        ) {
          dispChildSchemaIds[dispChildSchemaIds.length - 1].documentId = docId;
          action.setDispChildSchemaIds(dispChildSchemaIds);
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
          jesgoDoc.value.document = action.formData; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          jesgoDoc.value.registrant = getLoginUserId();
          jesgoDoc.value.last_updated = updateDate;
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

        break;
      }

      // ドキュメントの並び替え
      case 'SORT': {
        const dispChildSchemaIds = action.dispChildSchemaIds;
        if (action.isRootSchema) {
          // ルートタブを移動した場合、jesgo_documentのrootOrder(並び順)を更新
          // dispChildSchemaIdsに並び替え後の状態が入っているのでそれに応じてrootOrder振り直す
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < dispChildSchemaIds.length; i++) {
            const idx = saveData.jesgo_document.findIndex(
              (p) => p.key === dispChildSchemaIds[i].documentId
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

      default: {
        break;
      }
    }
  }

  return copyState;
};

export default formDataReducer;
