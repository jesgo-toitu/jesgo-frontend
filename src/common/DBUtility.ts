/* eslint-disable camelcase */
/* eslint-disable no-alert */
/* eslint-disable import/prefer-default-export */
import { JSONSchema7 } from 'json-schema';
import React, { Dispatch } from 'react';
import lodash from 'lodash';
import {
  CustomSchema,
  getPropItemsAndNames,
} from '../components/CaseRegistration/SchemaUtility';
import { SaveDataObjDefine } from '../store/formDataReducer';
import { JesgoDocumentSchema } from '../store/schemaDataReducer';
import apiAccess, { METHOD_TYPE, RESULT } from './ApiAccess';
import { GetSchemaInfo } from './CaseRegistrationUtility';

export interface responseResult {
  resCode?: number;
  message: string;
  loadedSaveData?: SaveDataObjDefine;
  caseId?: number;
  anyValue?: unknown;
}

// 日付文字列をyyyy/MM/ddなどの形式に変換
export const formatDate = (dtStr: string, separator: string) => {
  if (!dtStr) return '';
  try {
    const dateObj = new Date(dtStr);
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}${separator}${m}${separator}${d}`;
  } catch {
    return '';
  }
};

// 症例データの保存
export const SaveFormDataToDB = async (
  saveData: SaveDataObjDefine,
  resFunc: React.Dispatch<React.SetStateAction<responseResult>>,
  isBack: boolean
) => {
  const res: responseResult = {
    message: '',
    resCode: -1,
  };

  // API経由でのDB保存

  const apiResult = await apiAccess(
    METHOD_TYPE.POST,
    `registrationCaseAndDocument/`,
    saveData
  );

  res.resCode = apiResult.statusNum;
  res.anyValue = isBack;

  if (res.resCode === RESULT.NORMAL_TERMINATION) {
    res.message = '保存しました。';
  } else if (res.resCode === RESULT.ID_DUPLICATION) {
    res.message = '既に登録されている患者IDです';
  } else if (res.resCode === RESULT.TOO_LARGE_ERROR) {
    res.message = '保存サイズが大きすぎます。';
  } else if (res.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
    res.message = 'トークン期限切れ';
  } else {
    res.message = '保存に失敗しました。';
  }

  // case_idが返却される
  if (apiResult.body && !isNaN(apiResult.body as any)) {
    res.caseId = apiResult.body as number;
  }

  // 結果を呼び元に返す
  resFunc(res);
};

// 症例情報(1患者)読み込み
export const loadJesgoCaseAndDocument = async (
  caseId: number,
  setJesgoCaseData: React.Dispatch<React.SetStateAction<responseResult>>
) => {
  const res: responseResult = { message: '' };

  const apiResult = await apiAccess(
    METHOD_TYPE.GET,
    `getCaseAndDocument/${caseId}`
  );

  res.resCode = apiResult.statusNum;

  if (res.resCode === RESULT.NORMAL_TERMINATION) {
    res.loadedSaveData = apiResult.body as SaveDataObjDefine;

    if (res.loadedSaveData) {
      // 日付文字列の変換
      // 生年月日
      res.loadedSaveData.jesgo_case.date_of_birth = formatDate(
        res.loadedSaveData.jesgo_case.date_of_birth,
        '-'
      );
      // 死亡日時
      res.loadedSaveData.jesgo_case.date_of_death = formatDate(
        res.loadedSaveData.jesgo_case.date_of_death,
        '-'
      );

      res.loadedSaveData.jesgo_document.forEach((doc) => {
        if (doc.value.child_documents && doc.value.child_documents.length > 0) {
          // eslint-disable-next-line no-param-reassign
          doc.value.child_documents = doc.value.child_documents.map((p) =>
            p.toString()
          );
        }
      });
    }
  }

  // 呼び元に返す
  setJesgoCaseData(res);
};

// 保存処理の呼び出し
const SaveChanges = async (
  dispatch: Dispatch<any>,
  formDatas: Map<string, any>,
  saveData: SaveDataObjDefine,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  isBack: boolean
) => {
  const copySaveData = lodash.cloneDeep(saveData);

  // jesgo_document更新
  if (formDatas) {
    formDatas.forEach((formData: any, docId) => {
      const idx = copySaveData.jesgo_document.findIndex((p) => p.key === docId);
      if (idx > -1) {
        const jesgoDoc = copySaveData.jesgo_document[idx];
        jesgoDoc.value.document = formData; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

        let eventDatePropName = '';
        let deathDataPropName = '';
        const { document_schema: documentSchema } = GetSchemaInfo(
          jesgoDoc.value.schema_id
        ) as JesgoDocumentSchema;
        const customSchema = CustomSchema({
          orgSchema: documentSchema,
          formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        });
        const propList = getPropItemsAndNames(customSchema);
        propList.pNames.forEach((propName: string) => {
          const pItem = propList.pItems[propName] as JSONSchema7;
          if (pItem['jesgo:set'] === 'eventdate') {
            eventDatePropName = propName;
          } else if (pItem['jesgo:set'] === 'death') {
            deathDataPropName = propName;
          }
        });

        jesgoDoc.event_date_prop_name = eventDatePropName;
        jesgoDoc.death_data_prop_name = deathDataPropName;

        // event_dateの設定
        if (jesgoDoc.event_date_prop_name && formData) {
          // formDataからevent_dateに指定されているプロパティの値を取得する
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const eventDateProp = Object.entries(formData).find(
            (p) => p[0] === jesgoDoc.event_date_prop_name
          );

          jesgoDoc.value.event_date = eventDateProp
            ? (eventDateProp[1] as string)
            : '';
        }

        // 死亡日時の設定(jesgo_case)
        if (
          jesgoDoc.death_data_prop_name &&
          jesgoDoc.event_date_prop_name &&
          formData
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const deathProp = Object.entries(formData).find(
            (p) => p[0] === jesgoDoc.death_data_prop_name
          );
          if (deathProp && (deathProp[1] as boolean) === true) {
            // 死亡フラグが立っていればevent_dateを死亡日時にセットする
            copySaveData.jesgo_case.date_of_death = jesgoDoc.value.event_date;
          } else {
            copySaveData.jesgo_case.date_of_death = '';
          }
          // saveData.jesgo_case.last_updated = updateDate;
        }
        // jesgoDoc.value.last_updated = updateDate;
      }
    });

    // storeに保存
    dispatch({ type: 'SAVE', saveData: copySaveData });
  }

  // console.log(JSON.stringify(copySaveData));

  // API経由でのDB保存
  await SaveFormDataToDB(copySaveData, setSaveResponse, isBack);
};

// ヘッダのエラーチェック
// TODO: ここはvalidationにすべき
export const hasJesgoCaseError = (saveData: SaveDataObjDefine) => {
  const messages: string[] = [];

  if (!saveData.jesgo_case.his_id) {
    messages.push('患者IDを入力してください。');
  }
  if (!saveData.jesgo_case.date_of_birth) {
    messages.push('生年月日を入力してください。');
  }

  if (messages.length > 0) {
    messages.unshift('【症例入力エラー】');
    alert(messages.join('\n'));
    return true;
  }

  return false;
};

/**
 * 保存コマンド
 * @param formDatas
 * @param saveData
 * @param dispatch
 * @param setIsLoading
 * @param setSaveResponse
 * @param isBack
 * @returns
 */
const SaveCommand = (
  formDatas: Map<string, any>,
  saveData: SaveDataObjDefine,
  dispatch: Dispatch<any>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  isBack: boolean
) => {
  if (hasJesgoCaseError(saveData)) {
    return;
  }
  setIsLoading(true);

  // 保存処理実行
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  SaveChanges(dispatch, formDatas, saveData, setSaveResponse, isBack);
};

export default SaveCommand;
