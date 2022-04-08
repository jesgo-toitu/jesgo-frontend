import { UiSchema } from '@rjsf/core';
// TODO eslintのエラーが消えないので一旦コメントで抑制
// eslint-disable-next-line import/no-unresolved
import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Type,
} from 'json-schema'; // eslint-disable-line import/no-unresolved
import lodash from 'lodash';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { Const } from '../../common/Const';
import { getPropItemsAndNames, getSchemaType } from './SchemaUtility';

// uiSchema作成用Utility

export type UiSchemaProp = {
  schema: JSONSchema7;
};

/**
 * 各プロパティに合ったuiSchemaを追加
 * @param schema 定義スキーマ
 * @param uiSchema UiSchema
 * @param isRequired 必須かどうか
 * @returns 書き換え後UiSchema
 */
const AddUiSchema = (
  schema: JSONSchema7,
  uiSchema: UiSchema,
  isRequired: boolean
) => {
  let resultUiSchema: UiSchema = lodash.cloneDeep(uiSchema);
  if (resultUiSchema === undefined) {
    resultUiSchema = {};
  }
  if (schema === undefined) return resultUiSchema;
  const itemPropName = Object.keys(schema);

  const kType: keyof JSONSchema7 = Const.JSONSchema7Keys.TYPE;
  const classNames: string[] = [];

  // requiredの場合
  if (isRequired) {
    classNames.push('required-item');
  }

  // "jesgo:ui:subschemastyle"
  if (schema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE]) {
    if (schema[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE] === 'inline') {
      classNames.push('subschemastyle-inline');
    }
  }

  // "jesgo:ui:visiblewhen"
  if (schema[Const.EX_VOCABULARY.UI_VISIBLE_WHWN]) {
    classNames.push('visiblewhen');
  }

  // "jesgo:required"、または"description"がある場合、カスタムラベルを使用
  // ※type:arrayの場合は除く
  if (
    !(getSchemaType(schema) === Const.JSONSchema7Types.ARRAY) &&
    (itemPropName.includes(Const.EX_VOCABULARY.REQUIRED) ||
      itemPropName.includes(Const.JSONSchema7Keys.DESCRIPTION))
  ) {
    if (getSchemaType(schema) === Const.JSONSchema7Types.OBJECT) {
      resultUiSchema[Const.UI_WIDGET.OBJECT_FIELD_TEMPLATE] =
        JESGOFiledTemplete.CustiomObjectFieldTemplate;
    } else {
      resultUiSchema[Const.UI_WIDGET.FIELD_TEMPLATE] =
        JESGOFiledTemplete.CustomLableTemplete;
    }
  }

  // "jesgo:ui:textarea"
  if (itemPropName.includes(Const.EX_VOCABULARY.UI_TEXTAREA)) {
    let rows = 3; // 3行がデフォルト
    resultUiSchema[Const.UI_WIDGET.WIDGET] = 'textarea';
    if (typeof schema[Const.EX_VOCABULARY.UI_TEXTAREA] === 'number') {
      rows = schema[Const.EX_VOCABULARY.UI_TEXTAREA] as number;
    }
    resultUiSchema[Const.UI_WIDGET.OPTIONS] = { rows };
  }

  // units
  if (schema.units) {
    resultUiSchema[Const.UI_WIDGET.WIDGET] = 'withUnits';
  }

  // 日付入力Widget
  const kFormat: keyof JSONSchema7 = Const.JSONSchema7Keys.FORMAT;
  if (itemPropName.includes(kFormat) && schema[kFormat] === 'date') {
    classNames.push('input-date');
  }

  // 数値入力Widget
  if (['integer', 'number'].includes(getSchemaType(schema) as string)) {
    classNames.push('input-integer');
  }

  // oneOf
  if (itemPropName.includes(Const.JSONSchema7Keys.ONEOF)) {
    if (itemPropName.includes(kType)) {
      switch (getSchemaType(schema)) {
        case Const.JSONSchema7Types.OBJECT:
          // ・個々のラベル非表示
          // ・タイトルを他Widgetと同様のスタイルに変更
          resultUiSchema[Const.UI_WIDGET.OBJECT_FIELD_TEMPLATE] =
            JESGOFiledTemplete.OneOfFieldTemplate;
          resultUiSchema[Const.UI_WIDGET.OPTIONS] = { label: false };
          break;
        case Const.JSONSchema7Types.STRING:
          if (schema[Const.EX_VOCABULARY.UI_LISTTYPE] === 'combo') {
            // oneOfの中身解析
            const oneOfItems = schema[
              Const.JSONSchema7Keys.ONEOF
            ] as JSONSchema7[];
            let selectItem: JSONSchema7Type[] = [];
            oneOfItems.forEach((oneOfItem: JSONSchema7) => {
              if (
                getSchemaType(oneOfItem) === Const.JSONSchema7Types.STRING &&
                oneOfItem.enum != null
              ) {
                // selectがある
                selectItem = oneOfItem.enum;
              }
            });
            if (selectItem.length > 0) {
              resultUiSchema[Const.UI_WIDGET.WIDGET] = 'datalistTextBox';
            } else {
              resultUiSchema[Const.UI_WIDGET.WIDGET] = 'multiTypeTextBox';
            }
            resultUiSchema[Const.UI_WIDGET.FIELD_TEMPLATE] =
              JESGOFiledTemplete.CustomLableTemplete;
          } else {
            // 階層表示用selectの適用
            resultUiSchema[Const.UI_WIDGET.WIDGET] = 'layerDropdown';
            resultUiSchema[Const.UI_WIDGET.FIELD_TEMPLATE] =
              JESGOFiledTemplete.CustomLableTemplete;
          }
          break;
        default:
          break;
      }
    }
  }

  // classNameは最後に入れる
  if (classNames.length > 0) {
    resultUiSchema[Const.UI_WIDGET.CLASS] = classNames.join(' ');
  }

  // eslint-disable-next-line no-param-reassign
  return resultUiSchema;
};

// ソート順の追加
const CreateOrderList = (
  orderList: string[],
  propName: string,
  parentPropName?: string
) => {
  if (parentPropName) {
    // 親の次に追加
    const index = orderList.indexOf(parentPropName);
    orderList.splice(index + 1, 0, propName);
  } else {
    orderList.push(propName);
  }
};

/**
 * properties のUISchema作成
 * @param requiredNames 必須対象の項目名
 * @param propNames 
 * @param items 
 * @param uiSchema 
 * @param orderList 
 * @returns 
 */
export const createUiSchemaProperties = (
  requiredNames : string[],
  propNames: string[],
  items: { [key: string]: JSONSchema7Definition },
  uiSchema: UiSchema,
  orderList: string[]
) => {
  let resUiSchema: UiSchema = lodash.cloneDeep(uiSchema);
  if (resUiSchema == null) {
    // eslint-disable-next-line no-param-reassign
    resUiSchema = {};
  }

  propNames.forEach((propName: string) => {
    const item = items[propName] as JSONSchema7;

    // 直下のproperties
    resUiSchema[propName] = AddUiSchema(
      item,
      resUiSchema[propName] as UiSchema,
      requiredNames.includes(propName)
    );
    CreateOrderList(orderList, propName);

    const type = getSchemaType(item);
    // object,Arrayの場合は再帰的に呼び出し
    if (type === Const.JSONSchema7Types.OBJECT) {
      const childItems: { [key: string]: JSONSchema7Definition } | undefined =
        item.properties;
      if (childItems === undefined) return;
      const childPropNames = Object.keys(childItems);
      resUiSchema[propName] = createUiSchemaProperties(
        item.required ?? [],
        childPropNames,
        childItems,
        resUiSchema[propName] as UiSchema,
        orderList
      );
    } else if (type === Const.JSONSchema7Types.ARRAY) {
      const childItem = item.items;
      if (childItem === undefined) return;

      // TODO childItemが配列だった場合の判定はしていない。現状のスキーマにもない。要制限事項
      const propItem = getPropItemsAndNames(childItem as JSONSchema7);
      let itemsUiSchema = lodash.cloneDeep(resUiSchema[propName]) as UiSchema;

      itemsUiSchema = createUiSchemaProperties(
        item.required ?? [],
        propItem.pNames,
        propItem.pItems,
        itemsUiSchema,
        orderList
      );

      // 配列は'items'の中にuiSchemaを定義
      const propUiSchema = resUiSchema[propName] as UiSchema;
      propUiSchema['items' as string] = itemsUiSchema;
    }

    // TODO:oneofの対応も必要
  });

  return resUiSchema;
};

/**
 * UISchemaの作成
 * @param schema
 * @returns
 */
export const CreateUISchema = (schema: JSONSchema7) => {
  let uiSchema: UiSchema = {};
  const orderList: string[] = [];
  // ルート
  uiSchema = AddUiSchema(schema, uiSchema, false);

  // items
  const items = schema.items;
  if (items) {
    // TODO itemsが配列はあり得る？
    if (Array.isArray(items)) {
      items.forEach((item: JSONSchema7Definition) => {
        const propItems = getPropItemsAndNames(item as JSONSchema7);
        if (propItems) {
          uiSchema["items" as string] = createUiSchemaProperties(
            schema.required ?? [],
            propItems.pNames,
            propItems.pItems,
            uiSchema,
            orderList
          );
        }
      });
    } else {
      const propItems = getPropItemsAndNames(items as JSONSchema7);
        if (propItems) {
          uiSchema["items" as string]  = createUiSchemaProperties(
            schema.required ?? [],
            propItems.pNames,
            propItems.pItems,
            uiSchema,
            orderList
          );
        }
    }
  }

  // properties
  const properties = schema.properties;
  if (properties) {
    uiSchema = createUiSchemaProperties(
      schema.required ?? [],
      Object.keys(properties),
      properties,
      uiSchema,
      orderList
    );
  }

  // dependencies
  const depItems = schema.dependencies;
  if (depItems != null) {
    const depPropNames = Object.keys(depItems);
    if (depPropNames !== undefined) {
      depPropNames.forEach((depName: string) => {
        const item: JSONSchema7Definition = depItems[depName] as JSONSchema7;
        if (item === undefined) return;
        const itemPropName = Object.keys(item);

        // oneOf
        if (itemPropName.includes('oneOf')) {
          const oneOfItems = item.oneOf as JSONSchema7[];
          if (oneOfItems === undefined) return;
          oneOfItems.forEach((oneOfItem: JSONSchema7) => {
            const oneOfItemProp = oneOfItem.properties;
            const oneOfRequired = oneOfItem.required ?? [];

            if (oneOfItemProp != null) {
              const oneOfItemNames = Object.keys(oneOfItemProp);
              if (oneOfItemNames != null) {
                oneOfItemNames.forEach((oneOfItemName: string) => {
                  // TODO dependenciesに同項目に対し条件が複数あるとおかしくなる（uischemaが重複する）。要修正
                  if (oneOfItemName !== depName) {
                    uiSchema[oneOfItemName] = AddUiSchema(
                      oneOfItemProp[oneOfItemName] as JSONSchema7,
                      uiSchema[oneOfItemName] as UiSchema,
                      oneOfRequired.includes(oneOfItemName)
                    );
                    CreateOrderList(orderList, oneOfItemName, depName);
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  // Schemaの指定順に項目を並べる
  uiSchema[Const.UI_WIDGET.ORDER] = orderList;

  return uiSchema;
};
