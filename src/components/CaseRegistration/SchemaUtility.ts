import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Object,
  JSONSchema7Array,
} from 'json-schema'; // eslint-disable-line import/no-unresolved
import JSONPointer from 'jsonpointer';
import lodash from 'lodash';
import { Const } from '../../common/Const';

/** Schema加工用Utility */
type schemaItem = {
  pItems: { [key: string]: JSONSchema7Definition };
  pNames: string[];
};

/** JSONSchema7のkeyを全て取得 */
export const getSchemaItemNames = (schema: JSONSchema7) => {
  if (schema == null) return [] as string[];
  const result: string[] = Object.keys(schema) ?? [];
  return result;
};

/** schemaのタイプを取得 */
export const getSchemaType = (schema: JSONSchema7) => {
  if (schema == null) return undefined;
  return schema.type
}

/** JSONSchema7のpropertiesのkeyと値を全て取得 */
export const getPropItemsAndNames = (item: JSONSchema7) => {
  if (item.properties == null) return { pItems: {}, pNames: [] } as schemaItem;
  const result: schemaItem = {
    pItems: item.properties ?? {},
    pNames: Object.keys(item.properties) ?? [],
  };
  return result;
};

/** schemaのマージ */
const mergeSchemaItem = (props: {
  targetSchema: JSONSchema7;
  setSchema: JSONSchema7;
}) => {
  let { targetSchema } = props;
  const { setSchema } = props;

  const setRootItemNames = Object.keys(setSchema);
  setRootItemNames.forEach((itemName: string) => {
    const setValue = setSchema[itemName as keyof JSONSchema7Definition];
    // 上書きではなくマージ
    targetSchema = lodash.merge(targetSchema, { [itemName]: setValue });

    // enumのみマージではなく上書き
    if (targetSchema.properties && setSchema.properties) {
      const setItem = getPropItemsAndNames(setSchema);
      const targetItem = getPropItemsAndNames(targetSchema);
      setItem.pNames.forEach((pName: string) => {
        if (targetItem.pNames.includes(pName)) {
          const pitem = setItem.pItems[pName] as JSONSchema7;
          const tItem = targetItem.pItems[pName] as JSONSchema7;
          if (pitem && pitem.enum && tItem && tItem.enum) {
            tItem.enum = pitem.enum;
          }
        }
      });
    }
  });
};

/** 
 * Schemaの書き換え
 * - refをdefの内容に置き換え
 * - oneOfで複数Typeの指定がある場合、type:stringに置き換え
 * */
export const transferSchemaItem = (
  schema: JSONSchema7,
  item: JSONSchema7,
  itemNames: string[],
) => {
  let result = lodash.cloneDeep(item);
  const itemType = getSchemaType(item);
  itemNames.forEach((iName: string) => {
    if (iName === Const.JSONSchema7Keys.PROP) {
      // さらに中の塊を再解析
      const targetSchema = getPropItemsAndNames(result);
      targetSchema.pNames.forEach((name: string) => {
        const targetItem = targetSchema.pItems[name] as JSONSchema7;
        const targetName = getSchemaItemNames(targetItem);
        targetSchema.pItems[name] = transferSchemaItem(
          schema,
          targetItem,
          targetName
        );
      });
    } else if (
      itemType === Const.JSONSchema7Types.ARRAY &&
      iName === Const.JSONSchema7Keys.ITEMS
    ) {
      // itemsの中を再解析
      const targetSchema = result[iName] as JSONSchema7;
      const targetName = getSchemaItemNames(targetSchema);
      result[iName] = transferSchemaItem(schema, targetSchema, targetName);
    } else if (
      iName === Const.JSONSchema7Keys.IF ||
      iName === Const.JSONSchema7Keys.THEN ||
      iName === Const.JSONSchema7Keys.ELSE
    ) {
      // 1階層下を再解析
      const targetSchema = result[iName] as JSONSchema7;
      const targetName = getSchemaItemNames(targetSchema);
      result[iName] = transferSchemaItem(schema, targetSchema, targetName);
    } else if (itemType == null && iName === 'oneOf') {
      // oneOf、かつtypeなし
      const oneOfValue = result[iName];
      if (Array.isArray(oneOfValue)) {
        // Type:stringにしないとCustomWidgetが反映されない
        result.type = 'string';
        result['jesgo:ui:listtype'] = 'combo';
      }
    } else if (iName === 'allOf') {
      const allOfItems = result.allOf;
      allOfItems?.forEach((allOfitem: JSONSchema7Definition, index: number) => {
        if (result.allOf) {
          allOfItems[index] = transferSchemaItem(
            schema,
            allOfitem as JSONSchema7,
            getSchemaItemNames(allOfitem as JSONSchema7)
          ) as JSONSchema7Definition;
        }
      });
      result.allOf = allOfItems;
    } else if (iName === Const.JSONSchema7Keys.REF) {
      let refValue = result[iName] ?? '';
      if (refValue.startsWith('#')) {
        // #は除去
        refValue = refValue.substring(1);
      }
      // defの内容に置き換え
      result = JSONPointer.get(schema, refValue) as JSONSchema7;
    } else if (iName === '$comment') {
      // $commentのみのフィールドになるとエラーになるためあらかじめ除去
      delete result.$comment;
    }else if (iName === 'examples'){
      // 不要な選択肢が出るためあらかじめ除去
      delete result.examples;
    }
  });

  return result;
};

/**
 * if~then~elseの書き換え
 * @param allOfItem 
 * @param schema 
 * @param formData 
 * @returns 
 */
 const customSchemaIfThenElse = (
  allOfItem: JSONSchema7,
  schema: JSONSchema7,
  formData: any
) => {
  const result = lodash.cloneDeep(schema);
  if (allOfItem.if != null && allOfItem.then != null) {
    const rootSchemaItem = getPropItemsAndNames(result);

    // ifの確認
    const ifItem = getPropItemsAndNames(allOfItem.if as JSONSchema7);
    // 切り替え条件のプロパティ
    const matchFlgs: boolean[] = [];
    ifItem.pNames.forEach((pName: string) => {
      let matchFlg = false;
      if (rootSchemaItem.pNames.includes(pName)) {
        // ifの条件のプロパティが親のプロパティにある
        const condValueMaps = ifItem.pItems[pName] as JSONSchema7;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const selectValue:
          | string
          | number
          | boolean
          | JSONSchema7Object
          | JSONSchema7Array
          | null = formData[pName]; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        const conditionValues = [];
        let conditionPattern: RegExp | undefined;
        if (condValueMaps.const != null) {
          conditionValues.push(condValueMaps.const);
        } else if (condValueMaps.enum != null) {
          conditionValues.push(...condValueMaps.enum);
        } else if (condValueMaps.pattern != null) {
          conditionPattern = new RegExp(condValueMaps.pattern);
        }
        if (conditionPattern != null) {
          // patternの場合
          const value = selectValue as string ?? '';
          if (value.match(conditionPattern)) {
            matchFlg = true;
          }
        } else if (conditionValues.includes(selectValue)) {
          // const,enumの場合
          matchFlg = true;
        }
      }
      matchFlgs.push(matchFlg);
    });

    if (!matchFlgs.includes(false)) {
      // ifの条件に全て該当すればthenを適用
      mergeSchemaItem({
        targetSchema: result,
        setSchema: allOfItem.then as JSONSchema7,
      });
    } else if (allOfItem.else != null) {
      // それ以外はelseの適用（あれば）
      mergeSchemaItem({
        targetSchema: result,
        setSchema: allOfItem.else as JSONSchema7,
      });
    }
  }
  return result;
};

/**
 * フィールド内のif~Then~elseの置き換え
 * @param schema 
 * @param formData 
 * @returns 
 */
const customSchemaIfThenElseOnField = (schema: JSONSchema7, formData: any) => {
  let result = lodash.cloneDeep(schema);
  const itemNames = getSchemaItemNames(result);
  itemNames.forEach((name: string) => {
    
    if (name === Const.JSONSchema7Keys.IF) {
      result = customSchemaIfThenElse(result, result, formData);

    } else if (name === Const.JSONSchema7Keys.PROP) {
      const targetSchema = getPropItemsAndNames(result);
      targetSchema.pNames.forEach((iname: string) => {
        const targetItem = targetSchema.pItems[iname] as JSONSchema7;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        targetSchema.pItems[iname] = customSchemaIfThenElseOnField(targetItem, formData[iname] ?? {});
      });
    }
  });
  return result;
};

export const transferSchemaMaps = (
  rootSchema: JSONSchema7,
  targetItems: { [key: string]: JSONSchema7Definition },
) => {
  const result = lodash.cloneDeep(targetItems);

  const defsNames = getSchemaItemNames(result); // TNM,pTMN,T…
  defsNames.forEach((name: string) => {
    const item = result[name] as JSONSchema7;
    const itemNames = getSchemaItemNames(item);
    result[name] = transferSchemaItem(rootSchema, item, itemNames);
  });
  return result;
};

/**
 * Schemaの書き換え
 * @param props 
 * @returns 
 */
export const CustomSchema = (props: {
  orgSchema: JSONSchema7;
  formData: any;
}) => {
  const { orgSchema, formData } = props; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  // schemaの編集
  let schema = lodash.cloneDeep(orgSchema);
  if (schema == null) return schema;

  // refがあれば$defsの内容に全て置き換え
  const defItems = schema.$defs;
  if (defItems) {
    // まずは$def内のrefを全て置き換える
    schema.$defs = transferSchemaMaps(schema, defItems);
  }

  // それ以外のrefを置き換える
  // TODO 他直下のプロパティを使うなら追記必要。
  // TODO if,then,elseはどうするか。直接のif~then~elseを許すなら必要。
  const targetNames = getSchemaItemNames(schema);
  schema = transferSchemaItem(schema, schema, targetNames);


  // フィールド内のif~Thenを入力値に合わせて書き換え
  if (schema.properties) {
    schema = customSchemaIfThenElseOnField(schema, formData);
  } else {
    // propertiesの宣言がないとエラーになるため、空のpropertiesを追加
    schema.properties = {};
  }

  // allOf
  // 入力値に合わせてスキーマの書き換え
  if (schema.allOf != null) {
    const allOfItemArray = schema.allOf as JSONSchema7[];
    allOfItemArray.forEach((allOfItem: JSONSchema7) => {
      schema = customSchemaIfThenElse(allOfItem, schema, formData);
    });
  }

  return schema;
};

export const getRootDescription = (schema: JSONSchema7 | undefined) => {
  if (schema == null) return 'undefined';
  return schema.description ?? undefined;
}
