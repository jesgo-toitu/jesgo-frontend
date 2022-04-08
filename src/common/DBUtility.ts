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
import { JesgoDocumentSchema } from '../temp/ReadSchema';
import apiAccess, { METHOD_TYPE, RESULT } from './ApiAccess';
import { GetSchemaInfo } from './CaseRegistrationUtility';

export interface responseResult {
  resCode?: number;
  message: string;
  loadedSaveData?: SaveDataObjDefine;
}

// 日付文字列をyyyy-MM-ddの形式に変換
export const formatDate = (dtStr: string) => {
  if (!dtStr) return '';
  try {
    const dateObj = new Date(dtStr);
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
};

// 症例データの保存
export const SaveFormDataToDB = async (
  saveData: SaveDataObjDefine,
  resFunc: React.Dispatch<React.SetStateAction<responseResult>>
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

  if (res.resCode === RESULT.NORMAL_TERMINATION) {
    res.message = '保存しました。';
  } else if (res.resCode === RESULT.ID_DUPLICATION) {
    res.message = '既に登録されている患者IDです';
  } else if (res.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
    res.message = 'トークン期限切れ';
  } else {
    res.message = '保存に失敗しました。';
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
        res.loadedSaveData.jesgo_case.date_of_birth
      );
      // 死亡日時
      res.loadedSaveData.jesgo_case.date_of_death = formatDate(
        res.loadedSaveData.jesgo_case.date_of_death
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
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>
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
        const { documentSchema } = GetSchemaInfo(
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

  console.log(JSON.stringify(copySaveData));

  // API経由でのDB保存
  await SaveFormDataToDB(copySaveData, setSaveResponse);
};

export default SaveChanges;
