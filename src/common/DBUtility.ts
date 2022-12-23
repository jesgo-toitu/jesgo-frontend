/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable no-alert */
/* eslint-disable import/prefer-default-export */
import React, { Dispatch } from 'react';
import lodash from 'lodash';
import {
  CustomSchema,
  getJesgoSchemaPropValue,
  GetSchemaInfo,
} from '../components/CaseRegistration/SchemaUtility';
import {
  jesgoCaseDefine,
  jesgoDocumentObjDefine,
  SaveDataObjDefine,
} from '../store/formDataReducer';
import { JesgoDocumentSchema } from '../store/schemaDataReducer';
import apiAccess, { METHOD_TYPE, RESULT } from './ApiAccess';
import { validateJesgoDocument } from './CaseRegistrationUtility';
import {
  RegistrationErrors,
  VALIDATE_TYPE,
} from '../components/CaseRegistration/Definition';
import { Const } from './Const';
import { formatDate, formatDateStr } from './CommonUtility';
import store from '../store';

export interface responseResult {
  resCode?: number;
  message: string;
  loadedSaveData?: SaveDataObjDefine;
  caseId?: number;
  anyValue?: unknown;
}

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
    res.message =
      '【エラー】\n既に登録されている患者IDです。\n入力内容をご確認の上、正しいIDを入力してください。';
  } else if (res.resCode === RESULT.TOO_LARGE_ERROR) {
    res.message = '【エラー】\n保存サイズが大きすぎます。';
  } else if (res.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
    res.message = '【エラー】\nトークン期限切れ';
  } else if (res.resCode === RESULT.NETWORK_ERROR) {
    res.message = '【エラー】\nサーバーへの接続に失敗しました。';
  } else {
    res.message = '【エラー】\n保存に失敗しました。';
  }

  // case_idが返却される
  if (apiResult.body && !Number.isNaN(apiResult.body)) {
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
      res.loadedSaveData.jesgo_case.date_of_birth = formatDateStr(
        res.loadedSaveData.jesgo_case.date_of_birth,
        '-'
      );
      // 死亡日時
      res.loadedSaveData.jesgo_case.date_of_death = formatDateStr(
        res.loadedSaveData.jesgo_case.date_of_death,
        '-'
      );

      // childDocumentsのIDは数値→文字列に変更
      res.loadedSaveData.jesgo_document.forEach((doc) => {
        if (doc.value.child_documents && doc.value.child_documents.length > 0) {
          // eslint-disable-next-line no-param-reassign
          doc.value.child_documents = doc.value.child_documents.map((p) =>
            p.toString()
          );
        }

        // eventdate
        // eslint-disable-next-line no-param-reassign
        doc.value.event_date = formatDateStr(doc.value.event_date, '-');
      });
    }
  }

  // 呼び元に返す
  setJesgoCaseData(res);
};

export type schemaValueSet = {
  schema_id: number;
  primary_id: number;
  valid_from: string;
  valid_until: string | null;
  eventPropName: string;
  eventDate: string | undefined;
  majorVersion: number;
  minorVersion: number;
};

/**
 * formDataからスキーマの各バージョンごとのeventdateを取得
 * @param formData
 * @param schemaList
 * @returns
 */
export const getSchemaEventDateRelation = (
  formData: any,
  schemaList: JesgoDocumentSchema[] | undefined
): schemaValueSet[] => {
  if (!schemaList || schemaList.length === 0) {
    return [];
  }

  return schemaList.map((schema) => {
    const ret: schemaValueSet = {
      schema_id: schema.schema_id,
      primary_id: schema.schema_primary_id,
      valid_from: schema.valid_from,
      valid_until: schema.valid_until,
      eventPropName: '',
      eventDate: '',
      majorVersion: schema.version_major,
      minorVersion: schema.version_minor,
    };

    const documentSchema = schema.document_schema;

    const customSchema = CustomSchema({
      orgSchema: documentSchema,
      formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    });

    if (customSchema) {
      // eventdateの項目名を取得
      const eventDatePropName = getJesgoSchemaPropValue(
        customSchema,
        'jesgo:set',
        'eventdate'
      );

      // eventdateの項目名からeventdateの値を取得
      let eventDate = '';
      const func = (targetObject: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const eventDateProp = Object.entries(targetObject).find(
          (p) => p[0] === eventDatePropName
        );

        eventDate = eventDateProp ? (eventDateProp[1] as string) : '';
        if (!eventDate) {
          Object.entries(targetObject)
            .filter((p) => !Array.isArray(p[1]) && typeof p[1] === 'object')
            .some((item) => {
              func(item[1]);
              return !!eventDate;
            });
        }
      };
      func(formData);

      ret.eventDate = eventDate;
      ret.eventPropName = eventDatePropName;
    }
    return ret;
  });
};

/**
 * eventdateによる取得スキーマ無限ループ検知
 * @param formData
 * @param schemaList
 * @param relation
 * @returns true: 正常 false:無限ループ発生
 */
export const checkEventDateInfinityLoop = (
  formData: any,
  schemaList: JesgoDocumentSchema[] | undefined
) => {
  if (!formData || !schemaList || Object.keys(formData).length === 0)
    return true;

  // スキーマが1件しかない場合はOK
  if (schemaList.length <= 1) {
    return true;
  }

  const schemaRelation = getSchemaEventDateRelation(formData, schemaList);

  // eventdateのプロパティ名が全てのスキーマで共通ならOK
  if (
    schemaRelation.every(
      (p) => p.eventPropName === schemaRelation[0].eventPropName
    )
  ) {
    return true;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const item of schemaRelation) {
    const schemaInfo1 = GetSchemaInfo(item.schema_id, item.eventDate);
    if (schemaInfo1) {
      const tmpSchema = schemaRelation.find(
        (p) =>
          p.primary_id === schemaInfo1.schema_primary_id &&
          p.primary_id !== item.primary_id
      );
      if (tmpSchema) {
        // 切り替え先のスキーマのeventdateを用いてスキーマ再取得
        const schemaInfo2 = GetSchemaInfo(
          tmpSchema.schema_id,
          tmpSchema.eventDate
        );
        if (schemaInfo2) {
          // スキーマを再取得した結果、同じスキーマが取得できたらそこで確定できるため終了
          if (schemaInfo1.schema_primary_id === schemaInfo2.schema_primary_id) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

// event_date取得処理
export const getEventDate = (
  jesgoDoc: jesgoDocumentObjDefine,
  formData: any
): string => {
  let eventDate = '';

  // 無限ループチェック
  const isNotInfinityLoop = checkEventDateInfinityLoop(
    formData,
    store.getState().schemaDataReducer.schemaDatas.get(jesgoDoc.value.schema_id)
  );

  const { document_schema: documentSchema } = GetSchemaInfo(
    jesgoDoc.value.schema_id,
    isNotInfinityLoop ? jesgoDoc.value.event_date : formatDate(new Date(), '-') // 無限ループ発生時は現在日時点の最新スキーマ取得
  ) as JesgoDocumentSchema;
  const customSchema = CustomSchema({
    orgSchema: documentSchema,
    formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  });

  const eventDatePropName = getJesgoSchemaPropValue(
    customSchema,
    'jesgo:set',
    'eventdate'
  );

  // event_dateの設定
  if (eventDatePropName && formData) {
    const func = (targetObject: any) => {
      // formDataからevent_dateに指定されているプロパティの値を取得する
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const eventDateProp = Object.entries(targetObject).find(
        (p) => p[0] === eventDatePropName
      );

      eventDate = eventDateProp ? (eventDateProp[1] as string) : '';
      if (!eventDate) {
        Object.entries(targetObject)
          .filter((p) => !Array.isArray(p[1]) && typeof p[1] === 'object')
          .some((item) => {
            func(item[1]);
            return !!eventDate;
          });
      }
    };
    func(formData);
  }

  if (!eventDate) {
    // 親のeventDate取得処理
    const jesgoDocList =
      store.getState().formDataReducer.saveData.jesgo_document;
    const parentDoc = jesgoDocList.find((p) =>
      p.value.child_documents.includes(jesgoDoc.key)
    );
    if (parentDoc) {
      // 見つかるまでルートまで探索
      eventDate = getEventDate(parentDoc, parentDoc.value.document);
    }
  }

  return eventDate;
};

// 死亡日時取得
export const getDeathDate = (
  jesgoDoc: jesgoDocumentObjDefine,
  formData: any
): string => {
  let deathDate = '';

  const { document_schema: documentSchema } = GetSchemaInfo(
    jesgoDoc.value.schema_id,
    jesgoDoc.value.event_date
  ) as JesgoDocumentSchema;
  const customSchema = CustomSchema({
    orgSchema: documentSchema,
    formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  });

  const deathDataPropName = getJesgoSchemaPropValue(
    customSchema,
    'jesgo:set',
    'death'
  );

  if (deathDataPropName && formData) {
    const func = (targetObject: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const deathProp = Object.entries(targetObject).find(
        (p) => p[0] === deathDataPropName
      );

      if (deathProp) {
        if ((deathProp[1] as boolean) === true) {
          // 死亡フラグが立っていればevent_dateを死亡日時にセットする
          deathDate = getEventDate(jesgoDoc, formData);
        }
      } else {
        Object.entries(targetObject)
          .filter((p) => !Array.isArray(p[1]) && typeof p[1] === 'object')
          .some((item) => {
            func(item[1]);
            return !!deathDate;
          });
      }
    };
    func(formData);
  }

  return deathDate;
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
  let deathDate = '';
  // 更新用関数定義
  const func = (jesgoDocuments: jesgoDocumentObjDefine[]) => {
    jesgoDocuments.forEach((jesgoDoc) => {
      // eventDateの更新

      // eslint-disable-next-line no-param-reassign
      jesgoDoc.value.event_date = getEventDate(
        jesgoDoc,
        jesgoDoc.value.document
      );

      // 死亡日時は最初に見つかったものを取得
      if (!deathDate) {
        const tmpDeathDate = getDeathDate(jesgoDoc, jesgoDoc.value.document);
        if (tmpDeathDate) {
          deathDate = tmpDeathDate;
        }
      }

      // 子ドキュメント
      if (jesgoDoc.value.child_documents.length > 0) {
        // IDからドキュメント取得
        const childDocs = jesgoDoc.value.child_documents
          .map((childDocId) =>
            copySaveData.jesgo_document.find(
              (p) => p.key === childDocId && !p.value.deleted
            )
          )
          .filter((p) => p !== undefined);

        if (childDocs && childDocs.length > 0) {
          func(childDocs as jesgoDocumentObjDefine[]);
        }
      }
    });
  };

  // ルートのドキュメントから順番に処理
  const rootDocuments = copySaveData.jesgo_document.filter(
    (p) => p.root_order > -1 && !p.value.deleted
  );
  func(rootDocuments);

  // 死亡日時更新
  copySaveData.jesgo_case.date_of_death = deathDate;

  // storeに保存
  dispatch({ type: 'SAVE', saveData: copySaveData });

  // API経由でのDB保存
  await SaveFormDataToDB(copySaveData, setSaveResponse, isBack);
};

// ヘッダのエラーチェック
// TODO: ここはvalidationにすべき
export const hasJesgoCaseError = (
  saveData: SaveDataObjDefine,
  setErrors: React.Dispatch<React.SetStateAction<RegistrationErrors[]>>,
  dispatch: Dispatch<any>
) => {
  const messages: string[] = [];
  const digit = Number(localStorage.getItem('digit') ?? '8');
  const alignment = localStorage.getItem('alignment') === 'true';
  const alphabetEnable = localStorage.getItem('alphabet_enable') === 'true';
  const hyphenEnable = localStorage.getItem('hyphen_enable') === 'true';
  if (!saveData.jesgo_case.his_id) {
    messages.push('患者IDを入力してください。');
  } else if (saveData.jesgo_case.is_new_case) {
    if (alphabetEnable || hyphenEnable) {
      // アルファベットかハイフン許容の場合、桁数は20までで固定
      if (saveData.jesgo_case.his_id.length > 20) {
        messages.push(`患者IDは20桁以内で入力してください。`);
      }
    } else if (saveData.jesgo_case.his_id.length > digit) {
      messages.push(`患者IDは${digit}桁以内で入力してください。`);
    }
    if (
      alphabetEnable === false &&
      saveData.jesgo_case.his_id.search(/[a-zA-Z]/) !== -1
    ) {
      messages.push(`患者IDにアルファベットが含まれています。`);
    }
    if (
      hyphenEnable === false &&
      saveData.jesgo_case.his_id.indexOf('-') !== -1
    ) {
      messages.push(`患者IDにハイフンが含まれています。`);
    }
    if (!saveData.jesgo_case.his_id.match(/^[0-9a-zA-Z\\-]*$/)) {
      messages.push(`患者IDに使用できない文字が含まれています。`);

      // 参照渡しなので桁揃えもここでする
    } else if (
      alignment &&
      alphabetEnable === false &&
      hyphenEnable === false &&
      saveData.jesgo_case.his_id.length < digit
    ) {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('桁揃えを行いますか？'))
        while (saveData.jesgo_case.his_id.length < digit) {
          // eslint-disable-next-line no-param-reassign
          saveData.jesgo_case.his_id = `0${saveData.jesgo_case.his_id}`;
        }
    }
  }

  if (!saveData.jesgo_case.date_of_birth) {
    messages.push('生年月日を入力してください。');
  } else {
    const value: Date = new Date(saveData.jesgo_case.date_of_birth);

    const min = new Date(Const.INPUT_DATE_MIN);
    const max = new Date(Const.INPUT_DATE_MAX());
    max.setHours(23);
    max.setMinutes(59);

    // minとmaxの範囲にあるかチェック
    if (min.getTime() > value.getTime() || max.getTime() < value.getTime()) {
      messages.push(
        `生年月日は${Const.INPUT_DATE_MIN.replace(
          /-/g,
          '/'
        )} ～ ${Const.INPUT_DATE_MAX().replace(
          /-/g,
          '/'
        )}の範囲で入力してください。`
      );
    }
  }

  // 自動生成部分のvalidation
  const errors: RegistrationErrors[] = validateJesgoDocument(saveData);
  // エラー解消も反映させるため、必ずsetする
  setErrors(errors);
  dispatch({ type: 'SET_ERROR', extraErrors: errors });

  // 必須チェックのエラーのみの場合は保存できるようにする
  for (let i = 0; i < errors.length; i += 1) {
    const schemaError = errors[i];
    if (
      schemaError.validationResult.messages.filter(
        (p) =>
          p.validateType !== VALIDATE_TYPE.Message &&
          p.validateType !== VALIDATE_TYPE.Required
      ).length > 0
    ) {
      messages.push('症例ドキュメントに入力エラーがあるため保存できません。');
      messages.push('エラー一覧を確認し、再度保存してください。');
      break;
    }
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
  isBack: boolean,
  setErrors: React.Dispatch<React.SetStateAction<RegistrationErrors[]>>
) => {
  if (hasJesgoCaseError(saveData, setErrors, dispatch)) {
    return;
  }

  setIsLoading(true);

  // 保存処理実行
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  SaveChanges(dispatch, formDatas, saveData, setSaveResponse, isBack);
};

/**
 * スキーマファイル(zip)のアップロード処理
 * @param zipFile
 * @param setSchemaUploadResponse
 */
export const UploadSchemaFile = async (
  zipFile: File,
  setSchemaUploadResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>
) => {
  type uploadApiBody = {
    number: number;
    message: string[];
  };
  const res: responseResult = { message: '' };
  const apiResult = await apiAccess(METHOD_TYPE.POST_ZIP, `upload`, zipFile);
  const apiBody = apiResult.body as uploadApiBody;
  res.resCode = apiResult.statusNum;
  if (apiBody && apiBody.number > 0) {
    res.message = `${apiBody.number}件のスキーマを更新しました`;
  } else {
    res.message = '【エラー】\nスキーマの更新に失敗しました';
  }

  if (apiBody && apiBody.message) {
    setErrorMessages(apiBody.message);
  }

  // 呼び元に返す
  setSchemaUploadResponse(res);
};

/**
 * 一連のドキュメント取得
 * @param jesgo_case
 * @param schema_id
 * @returns
 */
export const GetPackagedDocument = async (
  jesgoCaseList: jesgoCaseDefine[],
  schema_id?: number,
  document_id?: number,
  attachPatientInfoDetail?: boolean
) => {
  const apiResult = await apiAccess(METHOD_TYPE.POST, `packaged-document/`, {
    jesgoCaseList,
    schema_id,
    document_id,
    attachPatientInfoDetail,
  });

  const res: responseResult = {
    message: '',
    resCode: -1,
  };

  res.resCode = apiResult.statusNum;
  res.anyValue = apiResult.body;

  return res;
};

export default SaveCommand;
