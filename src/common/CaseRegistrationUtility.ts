/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import lodash from 'lodash';
import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from 'json-schema';
import store from '../store';
import {
  dispSchemaIdAndDocumentIdDefine,
  jesgoDocumentObjDefine,
  SaveDataObjDefine,
} from '../store/formDataReducer';
import {
  CustomSchema,
  getPropItemsAndNames,
} from '../components/CaseRegistration/SchemaUtility';
import {} from '../store/formDataReducer';
import { JesgoDocumentSchema } from '../store/schemaDataReducer';
import { Const } from './Const';

// スキーマIDからスキーマ情報を取得
export const GetSchemaInfo = (id: number) => {
  const schemaInfos = store.getState().schemaDataReducer.schemaDatas;
  const schemaList = schemaInfos.get(id);
  if (schemaList && schemaList[0]) {
    return schemaList[0];
  }
  return undefined;
};

// ルートスキーマのschema_idを取得
export const GetRootSchema = () => {
  const roots = store.getState().schemaDataReducer.rootSchemas;
  return roots;
};

export type validationResult = {
  schema: JSONSchema7;
  messages: string[];
};

/**
 * validationエラー
 */
export type RegistrationErrors = {
  validationResult: validationResult;
  errDocTitle: string;
  schemaId: number;
  documentId: string;
};

/**
 * 入力値のvalidation
 * @param resultSchema
 * @param formData
 * @param argType
 * @returns
 */
const validateFormData = (
  resultSchema: JSONSchema7,
  formData: any,
  argType: JSONSchema7TypeName | JSONSchema7TypeName[] | undefined = undefined
) => {
  const messages: string[] = [];
  const type = argType || resultSchema.type;

  // validation用独自メッセージ
  const validationAlertMessage =
    resultSchema[Const.EX_VOCABULARY.VALIDATION_ALERT] ?? '';

  // エラーメッセージ取得Func
  const getErrMsg = (defaultMessage: string) =>
    // スキーマでエラーメッセージの内容が定義されていればそちらを優先する
    validationAlertMessage === '' ? defaultMessage : validationAlertMessage;

  // 入力がある場合のみチェック
  if (formData && typeof formData !== 'object') {
    if (type === Const.JSONSchema7Types.STRING) {
      if (resultSchema.format === 'date') {
        const value: Date = new Date(formData as string);

        const min = new Date(Const.INPUT_DATE_MIN);
        const max = new Date(Const.INPUT_DATE_MAX());
        max.setHours(23);
        max.setMinutes(59);

        // minとmaxの範囲にあるかチェック
        if (
          min.getTime() > value.getTime() ||
          max.getTime() < value.getTime()
        ) {
          // messages.push(`未来日は入力できません。`);
          messages.push(
            getErrMsg(
              `${Const.INPUT_DATE_MIN.replace(
                /-/g,
                '/'
              )} ～ ${Const.INPUT_DATE_MAX().replace(
                /-/g,
                '/'
              )}の範囲で入力してください。`
            )
          );
        }
      }

      const pattern = resultSchema.pattern;
      if (pattern) {
        // pattern
        const reg = new RegExp(pattern);
        const value: string = (formData as string) ?? '';
        if (value && !value.match(reg)) {
          messages.push(getErrMsg(`${pattern}の形式で入力してください。`));
        }
      }
      if (resultSchema.const) {
        // const
        if (resultSchema.const !== formData) {
          messages.push(
            getErrMsg(`「${resultSchema.const as string}」のみ入力できます。`)
          );
        }
      }
      if (resultSchema.enum) {
        // enum
        const enumValues = resultSchema.enum as string[];
        if (formData !== '' && !enumValues.includes(formData as string)) {
          const subMsgs: string[] = [];
          enumValues.forEach((enumValue: string) => {
            subMsgs.push(`「${enumValue}」`);
          });
          messages.push(getErrMsg(`${subMsgs.join('、')}のみ入力できます。`));
        }
      }
    } else if (
      type === Const.JSONSchema7Types.NUMBER ||
      type === Const.JSONSchema7Types.INTEGER
    ) {
      const value = Number(formData);
      let isNotNumber = false;

      if (Number.isNaN(value)) {
        messages.push(getErrMsg(`数値で入力してください。`));
        isNotNumber = true;
      } else if (
        type === Const.JSONSchema7Types.INTEGER &&
        !Number.isInteger(value)
      ) {
        messages.push(getErrMsg(`整数で入力してください。`));
        isNotNumber = true;
      }
      // 数値の場合のみ以降のチェックを行う
      if (!isNotNumber) {
        if (resultSchema.const !== undefined) {
          // const
          if (resultSchema.const !== value) {
            messages.push(
              getErrMsg(`「${resultSchema.const as string}」のみ入力できます。`)
            );
          }
        }
        if (resultSchema.minimum !== undefined) {
          // minimum
          if (value < resultSchema.minimum) {
            messages.push(
              getErrMsg(`${resultSchema.minimum}以上の値を入力してください。`)
            );
          }
        }
        if (resultSchema.maximum !== undefined) {
          // maximum
          if (value > resultSchema.maximum) {
            messages.push(
              getErrMsg(`${resultSchema.maximum}以下の値を入力してください。`)
            );
          }
        }
      }
    }
  }
  return messages;
};

/**
 * validation 必須入力チェック
 * @param formData
 * @param propName
 * @param required
 * @returns
 */
const validateRequired = (
  formData: any,
  propName: string,
  required: string[]
) => {
  let messages = '';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!Object.keys(formData).length && required.includes(propName)) {
    messages = `入力してください。`;
  }

  return messages;
};

/**
 * validationの結果によりschemaを書き換える
 * @param schema
 * @param formData
 * @param propName
 * @returns
 */
const customSchemaValidation = (
  schema: JSONSchema7,
  formData: any,
  propName: string,
  required: string[]
) => {
  const messages: string[] = [];
  const resultSchema = lodash.cloneDeep(schema);
  let errFlg = false;

  if (resultSchema.properties) {
    // propertiesの場合はさらに下の階層を解析
    const targetSchema = getPropItemsAndNames(resultSchema);
    targetSchema.pNames.forEach((iname: string) => {
      const targetItem = targetSchema.pItems[iname] as JSONSchema7;
      const itemName = targetItem.title ?? iname;
      const res = customSchemaValidation(
        targetItem,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        formData[iname] ?? {},
        itemName,
        resultSchema.required ?? []
      );
      targetSchema.pItems[iname] = res.schema;
      messages.push(...res.messages);
    });
  } else if (
    resultSchema.type === Const.JSONSchema7Types.ARRAY &&
    resultSchema.items
  ) {
    // arrayの場合
    const targetSchema = resultSchema.items as JSONSchema7;

    if (Array.isArray(formData)) {
      // minItems,maxItemsの確認
      if (resultSchema.minItems) {
        const minItems = resultSchema.minItems;
        if (formData.length < minItems) {
          errFlg = true;
          messages.push(
            `　　[ ${propName} ] ${minItems}件以上入力してください。`
          );
        }
      } else if (resultSchema.maxItems) {
        const maxItems = resultSchema.maxItems;
        // maxItemsと件数がイコールになると＋ボタンが表示されなくなるが、念のためエラーチェックも追加。
        if (formData.length > maxItems) {
          errFlg = true;
          messages.push(
            `　　[ ${propName} ] ${maxItems}件以下で入力してください。`
          );
        }
      }

      // さらにitemsの中を解析
      formData.forEach((data: any, index: number) => {
        const res = customSchemaValidation(
          targetSchema,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          data ?? {},
          propName,
          // resultSchema.required ?? []
          required ?? []
        );
        if (res.messages.length > 0) {
          errFlg = true;
          messages.push(`　[ ${propName}:${index + 1}行目 ]`);
          res.messages.forEach((message: string) => {
            messages.push(`　　${message}`);
          });
        }
      });
    }
  } else if (
    (resultSchema.oneOf || resultSchema.anyOf) &&
    typeof formData !== 'object'
  ) {
    // oneOfかつ中のアイテムにtypeがある＝複数type入力可能テキストボックス
    // anyOfの場合も同じ
    const oneOfItems =
      (resultSchema.oneOf as JSONSchema7[]) ||
      (resultSchema.anyOf as JSONSchema7[]);
    const requiredMsg = validateRequired(formData, propName, required);
    if (requiredMsg !== '') {
      errFlg = true;
      messages.push(`　[ ${propName} ] ${requiredMsg}`);
    } else {
      const oneOfMatchCondition: boolean[] = [];
      const subMessages: string[] = [];

      // 正規表現パターン取得
      let patternStr = '';
      const patternObj = oneOfItems.find((p) => p.pattern);
      if (patternObj) {
        patternStr = patternObj.pattern ?? '';
      }

      oneOfItems.forEach((oneOfItem: JSONSchema7) => {
        const errMsgs = validateFormData(
          oneOfItem,
          formData,
          patternStr ? resultSchema.type : undefined
        );
        if (errMsgs.length === 0) {
          oneOfMatchCondition.push(true);
        } else {
          subMessages.push(...errMsgs);
        }
      });
      if (oneOfMatchCondition.length === 0) {
        errFlg = true;
        messages.push(`　[ ${propName} ] ${subMessages.join('または、')}`);
      }
    }
  } else {
    // 通常のフィールド
    const errMsgs: string[] = [];
    const requiredMsg = validateRequired(formData, propName, required);
    if (requiredMsg !== '') {
      errMsgs.push(requiredMsg);
    } else {
      errMsgs.push(...validateFormData(resultSchema, formData));
    }

    if (errMsgs.length > 0) {
      errFlg = true;
      messages.push(`　[ ${propName} ] ${errMsgs.join('')}`);
    }
  }

  if (errFlg) {
    // エラーのある項目は内部用の独自ボキャブラリーを付与
    resultSchema['jesgo:validation:haserror'] = true;
  }
  const result: validationResult = { schema: resultSchema, messages };
  return result;
};

// 同一スキーマ複数時のナンバリングタブタイトル取得(saveData使用)
const GetNumberingTabTitle = (
  saveData: SaveDataObjDefine,
  document: jesgoDocumentObjDefine,
  baseTitle: string
) => {
  let title = baseTitle;

  // ルートドキュメントの場合
  if (document.root_order > -1) {
    // ルートドキュメント内で同一スキーマIDを持つドキュメントを取得
    const sameSchemaDocs = saveData.jesgo_document
      .filter(
        (p) =>
          p.root_order > -1 &&
          p.value.schema_id === document.value.schema_id &&
          p.value.deleted === false
      )
      .sort((f, s) => f.root_order - s.root_order);

    // 2件以上あれば番号を振る
    if (sameSchemaDocs.length > 1) {
      const index = sameSchemaDocs.findIndex((p) => p.key === document.key);
      title += (index + 1).toString();
    }
  } else {
    // 子ドキュメントの場合
    const parentDoc = saveData.jesgo_document.find((p) =>
      p.value.child_documents.includes(document.key)
    );

    if (parentDoc) {
      // 親ドキュメントのchildDocumentから同一スキーマIDを持つドキュメントを検索
      const sameSchemaDocs = parentDoc.value.child_documents.filter(
        (childDocId) =>
          saveData.jesgo_document.find(
            (p) =>
              p.key === childDocId &&
              p.value.deleted === false &&
              p.value.schema_id === document.value.schema_id
          )
      );
      // 2件以上あれば番号を振る
      if (sameSchemaDocs.length > 1) {
        const index = sameSchemaDocs.indexOf(document.key);
        title += (index + 1).toString();
      }
    }
  }
  return title;
};

// 親ドキュメントのタイトル取得
const GetParentDocumentTitle = (saveData: SaveDataObjDefine, docId: string) => {
  const titleNames: string[] = [];

  // childDocumentから親ドキュメントを検索
  const parentDoc = saveData.jesgo_document.find((p) =>
    p.value.child_documents.includes(docId)
  );
  // 最上位まで取れたら終了
  if (!parentDoc) {
    return titleNames;
  }
  const schemaInfo = GetSchemaInfo(parentDoc.value.schema_id);
  if (!schemaInfo) {
    return titleNames;
  }

  // スキーマ情報からタイトル取得
  let title = `${schemaInfo.title ?? ''} ${schemaInfo.subtitle ?? ''}`.trim();
  title = GetNumberingTabTitle(saveData, parentDoc, title);

  titleNames.push(title);

  // 再帰で更に上位の親を取得
  titleNames.push(...GetParentDocumentTitle(saveData, parentDoc.key));

  return titleNames;
};

/**
 * 自動生成部分のvalidation
 * @param saveData
 * @returns
 */
export const validateJesgoDocument = (saveData: SaveDataObjDefine) => {
  const errors: RegistrationErrors[] = [];
  saveData.jesgo_document.forEach((doc: jesgoDocumentObjDefine) => {
    // 削除されていないドキュメントだけが対象
    if (!doc.value.deleted) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const formData = doc.value.document;
      const schemaId = doc.value.schema_id;
      const documentId = doc.key;

      // schemaの取得
      const schemaInfo = GetSchemaInfo(schemaId) as JesgoDocumentSchema;
      const schema = schemaInfo.document_schema;

      // schemaのカスタマイズ
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const customSchema = CustomSchema({ orgSchema: schema, formData });
      const validResult: validationResult = customSchemaValidation(
        customSchema,
        formData,
        '',
        []
      );
      if (validResult.messages.length > 0) {
        // 親のタイトル取得
        let titleList = GetParentDocumentTitle(saveData, documentId);
        // 親→子の順にしたいのでリバース
        titleList = titleList.reverse();
        // 自身のタイトル追加
        let title = `${schemaInfo.title ?? ''} ${
          schemaInfo.subtitle ?? ''
        }`.trim();
        title = GetNumberingTabTitle(saveData, doc, title);
        titleList.push(title);

        errors.push({
          validationResult: validResult,
          errDocTitle: titleList.join(' > ') ?? '',
          schemaId,
          documentId,
        });
      }
    }
  });
  return errors;
};

export const getErrMsg = (errorList: RegistrationErrors[]) => {
  const message: string[] = [];
  if (errorList) {
    errorList.forEach((error) => {
      const documentMsg: string[] = [];
      error.validationResult.messages.forEach((msg: string) => {
        documentMsg.push(msg);
      });

      if (documentMsg.length > 0) {
        message.push(`【 ${error.errDocTitle} 】`);
        message.push(...documentMsg);
      }
    });
  }
  return message;
};
// 指定スキーマのサブスキーマIDを孫スキーマ含めすべて取得
export const GetAllSubSchemaIds = (id: number) => {
  const schemaIds: number[] = [];

  const schemaInfos = store.getState().schemaDataReducer.schemaDatas;
  const schemaInfo = schemaInfos.get(id);
  if (schemaInfo && schemaInfo[0].subschema.length > 0) {
    schemaIds.push(...schemaInfo[0].subschema);

    schemaInfo[0].subschema.forEach((schemaId) => {
      schemaIds.push(...GetAllSubSchemaIds(schemaId)); // 再帰
    });
  }

  return schemaIds;
};

// 継承先のスキーマで作成されるドキュメントの数を取得
export const GetCreatedDocCountAfterInherit = (
  schemaId: number,
  deletedChildDocumentsObj: {
    parentDocumentId: string;
    deletedChildDocuments: jesgoDocumentObjDefine[];
  }[],
  processedDocIds: Set<string>
) => {
  const schemaInfo = GetSchemaInfo(schemaId);

  let count = 0;

  if (!schemaInfo) return 0;

  // サブスキーマを処理
  if (schemaInfo.subschema.length > 0) {
    schemaInfo.subschema.forEach((id) => {
      const hasSameSchema = deletedChildDocumentsObj.some((p) => {
        const filter = p.deletedChildDocuments.filter(
          (q) => !processedDocIds.has(q.key) && q.value.schema_id === id
        );
        if (filter.length > 0) {
          filter.forEach((q) => processedDocIds.add(q.key));

          count += filter.length;
          return true;
        }
        return false;
      });

      // 継承先にしかなかったスキーマの場合、自動作成分で1プラス
      if (!hasSameSchema) {
        count += 1;
      }

      // 再帰
      count += GetCreatedDocCountAfterInherit(
        id,
        deletedChildDocumentsObj,
        processedDocIds
      );
    });
  }

  // 子スキーマを処理
  if (schemaInfo.child_schema.length > 0) {
    schemaInfo.child_schema.forEach((id) => {
      deletedChildDocumentsObj.some((p) => {
        const filter = p.deletedChildDocuments.filter(
          (q) => !processedDocIds.has(q.key) && q.value.schema_id === id
        );
        if (filter.length > 0) {
          filter.forEach((q) => processedDocIds.add(q.key));
          count += filter.length;
          return true;
        }
        return false;
      });

      // 再帰
      count += GetCreatedDocCountAfterInherit(
        id,
        deletedChildDocumentsObj,
        processedDocIds
      );
    });
  }

  return count;
};

// タブ並び順のインデックスをタブ名に変換
export const convertTabKey = (parentTabKey: string, tabKey: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let convTabKey = tabKey;
  // インデックスからタブ名に変換
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(Number(tabKey))) {
    const allTabList = store.getState().formDataReducer.allTabList;
    const tabList = allTabList.get(parentTabKey);

    const tabIndex = parseInt(tabKey as string, 10);
    if (tabList && tabList.length > tabIndex) {
      convTabKey = tabList[tabIndex];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return convTabKey;
};

// スキーマのタイトル取得
export const GetSchemaTitle = (id: number) => {
  const schemaInfo = GetSchemaInfo(id);
  let title = schemaInfo?.title ?? '';
  if (schemaInfo?.subtitle) {
    title += ` ${schemaInfo.subtitle}`;
  }
  return title;
};

// Schemaから非表示項目を取得
export const GetHiddenPropertyNames = (schema: JSONSchema7) => {
  let hiddenItemNames: string[] = [];

  if (schema.properties) {
    hiddenItemNames = Object.entries(schema.properties)
      .filter((item) => {
        const values = item[1];
        if (values) {
          const hiddenItem = Object.entries(values).find(
            (p) => p[0] === Const.EX_VOCABULARY.UI_HIDDEN
          );
          if (hiddenItem && hiddenItem[1] === true) return true;
        }
        return false;
      })
      .map((p) => p[0]);
  }

  // 項目名を返す
  return hiddenItemNames;
};

// 同一スキーマ存在時のタイトル名設定
export const SetSameSchemaTitleNumbering = (
  schemaIds1: dispSchemaIdAndDocumentIdDefine[],
  schemaIds2?: dispSchemaIdAndDocumentIdDefine[]
) => {
  const allIds: dispSchemaIdAndDocumentIdDefine[] = [];

  // サブスキーマ
  if (schemaIds1.length > 0) {
    allIds.push(...schemaIds1.filter((p) => p.deleted === false));
  }
  // 子スキーマ
  if (schemaIds2 && schemaIds2.length > 0) {
    allIds.push(...schemaIds2.filter((p) => p.deleted === false));
  }

  if (allIds.length > 0) {
    // スキーマIDでグループ化
    const group = lodash.groupBy(allIds, 'schemaId');

    Object.keys(group).forEach((schemaId) => {
      // 複数タブあるものは数字を付与
      if (group && group[schemaId].length > 1) {
        group[schemaId].forEach((p, idx) => {
          // p.title += idx + 1;
          // p.title = p.title.replace(/[0-9]/g, '') + (idx + 1);
          p.titleNum = idx + 1;
        });
      } else {
        group[schemaId][0].titleNum = undefined;
      }
    });
  }
};

// 保存用オブジェクトのソート
export const SaveObjectSort = (obj: any) => {
  // ソートする
  let sorted: [string, unknown][] = [];
  if (obj) {
    // 更新日時は除外する
    sorted = Object.entries(lodash.omit(obj, ['last_updated'])).sort();

    // 再帰的に見る
    sorted.forEach((item) => {
      const val = item[1];
      if (typeof val === 'object') {
        // eslint-disable-next-line no-param-reassign
        item[1] = SaveObjectSort(val);
      }
    });
  }

  return sorted;
};

// 更新判定
export const IsNotUpdate = () => {
  const formDataReducer = store.getState().formDataReducer;

  // 読込時点のデータと編集中のデータを比較して、同じなら更新しない
  // メモ：json変換したデータを比較。ただしオブジェクトの順番は保証されないのでソートしてから。
  return (
    JSON.stringify(SaveObjectSort(formDataReducer.loadData)) ===
    JSON.stringify(SaveObjectSort(formDataReducer.saveData))
  );
};

// オブジェクトの空チェック
export const isNotEmptyObject = (obj: any) => {
  let hasInput = false;

  if (obj === undefined || obj === null) {
    return hasInput;
  }

  if (typeof obj !== 'object') {
    // オブジェクト以外は未入力チェック(0は入力扱い)
    if (obj !== '') {
      hasInput = true;
    }
  } else if (Object.keys(obj).length > 0) {
    Object.entries(obj).forEach((item) => {
      const val = item[1];
      if (isNotEmptyObject(val as any)) {
        hasInput = true;
      }
    });
  }

  return hasInput;
};

/**
 * formData入力値判定
 * @param formData
 * @param schemaId
 * @returns
 */
export const hasFormDataInput = (formData: any, schemaId: number) => {
  let hasInput = false;

  // フォームデータの定義がないスキーマ(タブしかないもの)は入力あり扱いとする
  const schemaInfo = GetSchemaInfo(schemaId);
  if (schemaInfo?.document_schema) {
    const schema = schemaInfo.document_schema;

    if (schema.type === 'array') {
      // arrayだけどitemsの定義がないスキーマ
      if (!schema.items) {
        hasInput = true;
      }
    } else if (
      // type未設定のスキーマもしくはプロパティなし＝入力項目がないスキーマ
      schema.type === undefined ||
      !schema.properties ||
      Object.keys(schema.properties).length === 0
    ) {
      hasInput = true;
    }

    // フォームデータがあるスキーマの場合は入力値を見て判断
    if (!hasInput) {
      if (Array.isArray(formData)) {
        // formDataが複数ある場合(子のパネルスキーマあり)、1つでも入力があればありとする
        hasInput = formData.filter((data) => isNotEmptyObject(data)).length > 0;
      } else {
        hasInput = isNotEmptyObject(formData);
      }
    }
  }

  return hasInput;
};

// フォームの入力内容に応じてタブのスタイルを設定
export const SetTabStyle = (tabId: string, hasInput: boolean) => {
  // タブ文字色を変えるのでAタグ取得
  const aTag = document.getElementById(tabId) as HTMLAnchorElement;

  if (aTag) {
    if (hasInput) {
      // 入力値がある場合はCSS設定
      aTag.className = 'has-input';
    } else {
      aTag.className = '';
    }
  }
};

// プロパティ追加可能なオブジェクト定義
interface Obj {
  [prop: string]: any;
}

export const GetInheritFormData = (
  baseSchemaId: number,
  inheritSchemaId: number,
  formData: any
) => {
  if (
    !formData ||
    Object.keys(formData).length === 0 ||
    // スキーマIDが同じ場合はそのまま使用できるのでそのまま返す
    baseSchemaId === inheritSchemaId
  ) {
    return formData;
  }

  const baseSchemaInfo = GetSchemaInfo(baseSchemaId);
  const inheritSchemaInfo = GetSchemaInfo(inheritSchemaId);

  if (!baseSchemaInfo || !inheritSchemaInfo) {
    return formData;
  }

  // 継承元のスキーマ
  const baseCustomSchema = CustomSchema({
    orgSchema: baseSchemaInfo.document_schema,
    formData,
  });
  // 継承先のスキーマ
  const inheritSchema = CustomSchema({
    orgSchema: inheritSchemaInfo.document_schema,
    formData: {},
  });

  const newFormData: Obj = {};

  Object.entries(formData).forEach((item) => {
    const propName = item[0];
    const propValue = item[1];

    let jsonSchema1: JSONSchema7 | undefined;
    let jsonSchema2: JSONSchema7 | undefined;

    if (baseCustomSchema.properties) {
      jsonSchema1 = baseCustomSchema.properties[propName] as JSONSchema7;
    }
    if (inheritSchema.properties) {
      jsonSchema2 = inheritSchema.properties[propName] as JSONSchema7;
    }

    if (jsonSchema1 && !jsonSchema2) {
      // 継承先にプロパティがない → 引き継ぐ
      if (typeof propValue === 'object' && propValue) {
        // undefinedなプロパティは引き継がない
        const omitValue = lodash.omit(
          propValue,
          Object.entries(propValue)
            .filter((p) => p[1] === undefined)
            .map((p) => p[0])
        );
        // オブジェクトの中身が空でなければ引き継ぐ
        if (Object.keys(omitValue).length > 0) {
          newFormData[propName] = omitValue;
        }
      } else {
        newFormData[propName] = propValue;
      }
    } else if (jsonSchema1 && jsonSchema2) {
      // 同一名のプロパティ存在 → 引き継ぐ
      if (jsonSchema1.type === jsonSchema2.type) {
        newFormData[propName] = propValue;
      }
    } else if (!jsonSchema1 && jsonSchema2) {
      // 継承元にプロパティがない ※このケースあるか？
      newFormData[propName] = propValue;
    } else {
      // 継承元にも継承先にもプロパティがない → 引き継ぐ
      newFormData[propName] = propValue;
    }
  });

  return newFormData;
};

export const GetBeforeInheritDocumentData = (
  parentDocId: string,
  schemaId: number
) => {
  let retDocs: jesgoDocumentObjDefine[] = [];

  const deletedDocuments = store.getState().formDataReducer.deletedDocuments;

  // 処理済みドキュメント
  const processedDocumentIds =
    store.getState().formDataReducer.processedDocumentIds;

  if (parentDocId === '') {
    // documentIdの指定がない場合は全検索
    deletedDocuments.forEach((item) => {
      const filter = item.deletedChildDocuments.filter(
        (p) =>
          p.value.schema_id === schemaId && !processedDocumentIds.has(p.key)
      );
      if (filter.length > 0) {
        retDocs = filter;
      }
    });
  } else {
    // documentIdの指定がある場合はそのdocumentIdに紐づくデータを取得
    const deletedItem = deletedDocuments.find(
      (p) => p.parentDocumentId === parentDocId
    );
    if (deletedItem) {
      const baseDoc = deletedItem.deletedChildDocuments.filter(
        (p) =>
          p.value.schema_id === schemaId && !processedDocumentIds.has(p.key)
      );
      if (baseDoc.length > 0) {
        retDocs = baseDoc;
      }
    }
  }

  return retDocs;
};
