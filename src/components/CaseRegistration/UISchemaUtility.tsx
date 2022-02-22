import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { UiSchema } from "@rjsf/core"
import {JESGOFiledTemplete} from "./JESGOFieldTemplete";
import { Const } from "../../common/Const"

// uiSchema作成用Utility

export type UiSchemaProp = {
    schema:JSONSchema7;
}

export const createUiSchemaProperties = (propNames: string[], items: { [key: string]: JSONSchema7Definition }, uiSchema: UiSchema, orderList: string[]) => {
    propNames.map((propName: string) => {
        const item = items[propName] as JSONSchema7;

        if(uiSchema === undefined){
            uiSchema = {};
        }

        // 直下のproperties
        AddUiSchema(propName, items, uiSchema, orderList);
        CreateOrderList(orderList, propName);

        // objectの場合は再帰的に呼び出し
        if (item.type === "object") {
            const childItems: { [key: string]: JSONSchema7Definition } | undefined = item.properties!;
            if (childItems === undefined) return;
            let childPropNames = Object.keys(childItems);
            createUiSchemaProperties(childPropNames, childItems, uiSchema[propName], orderList);
        }

        // TODO:oneofの対応も必要
    })
}

export const CreateUISchema = (schema: JSONSchema7) => {
    let uiSchema: UiSchema = {};

    // uischemaの作成
    const items: { [key: string]: JSONSchema7Definition } | undefined = schema.properties!;
    if (items === undefined) return uiSchema;
    let propNames = Object.keys(schema.properties!)
    if (propNames === undefined) return uiSchema;
    let orderList: string[] = [];

    // properties
    createUiSchemaProperties(propNames, items, uiSchema, orderList);

    // dependencies
    const depItems = schema.dependencies;
    if (depItems !== undefined) {
        const depPropNames = Object.keys(schema.dependencies!);
        if (depPropNames !== undefined) {
            depPropNames.map((depName: string) => {
                const item: JSONSchema7Definition = depItems![depName] as JSONSchema7;
                if (item === undefined) return;
                const itemPropName = Object.keys(item);

                // oneOf
                if (itemPropName.includes("oneOf")) {
                    const oneOfItems = item["oneOf"]! as JSONSchema7[];
                    if (oneOfItems === undefined) return;
                    for (const oneOfItem of oneOfItems) {
                        const oneOfItems = oneOfItem.properties!;
                        if(oneOfItems === undefined) continue;
                        const oneOfItemNames = Object.keys(oneOfItems);
                        if(oneOfItemNames === undefined) continue;

                        oneOfItemNames.map((oneOfItemName: string) => {
                            // TODO dependenciesに同項目に対し条件が複数あるとおかしくなる（uischemaが重複する）。要修正
                            if (oneOfItemName !== depName) {
                                AddUiSchema(oneOfItemName, oneOfItems, uiSchema, orderList);
                                CreateOrderList(orderList, oneOfItemName, depName);
                            }
                        })
                    }
                }
            })
        }
    }
    // TODO $defの場合の対応も必要。defはorderlistそのまま並べたらNGなので、あらかじめ保持して出てきたら都度orderlistに入れるイメージになるかも

    // Schemaの指定順に項目を並べる
    uiSchema[Const.UI_WIDGET.ORDER] = orderList;

    return uiSchema;
}

// 各プロパティに沿ったuiSchemaを追加
const AddUiSchema = (propName: string, items: { [key: string]: JSONSchema7Definition }, uiSchema: UiSchema, orderList: string[]) => {
    const item: JSONSchema7 = items![propName] as JSONSchema7;
    if (item === undefined) return;
    const itemPropName = Object.keys(item);
    if(uiSchema[propName] === undefined){
        uiSchema[propName] = {};
    }

    // "jesgo:required"
    if (itemPropName.includes(Const.EX_VOCABULARY.REQUIRED)) {
        uiSchema[propName][Const.UI_WIDGET.FIELD_TEMPLATE] = JESGOFiledTemplete.WithTypeLableTemplete;
    }

    // "jesgo:ui:textarea"
    if (itemPropName.includes(Const.EX_VOCABULARY.UI_TEXTAREA)) {
        const rows = item[Const.EX_VOCABULARY.UI_TEXTAREA] as number | boolean;
        uiSchema[propName][Const.UI_WIDGET.WIDGET] = "textarea";
        if (typeof rows === "number") {
            uiSchema[propName][Const.UI_WIDGET.OPTIONS] = { rows: rows };
        }
    }

    // 日付入力Widget
    const key: keyof JSONSchema7 = "format";
    if (itemPropName.includes(key) && item[key] === "date") {
        uiSchema[propName][Const.UI_WIDGET.CLASS] = "input-date";
    }

    // 数値入力Widget
    const kType: keyof JSONSchema7 = "type";
    if (itemPropName.includes(kType) && ["integer", "number"].includes(item[kType] as string)) {
        uiSchema[propName][Const.UI_WIDGET.CLASS] = "input-integer";
    }

    // oneOf
    // 「typeがobject」「oneOfを持つ」
    // ・個々のラベル非表示
    // ・タイトルを他Widgetと同様のスタイルに変更
    const keyType = "type";
    const keyOneOf = "oneOf"
    if (itemPropName.includes(keyType) && item[keyType] === "object") {
        if (itemPropName.includes(keyOneOf)) {
            uiSchema[propName][Const.UI_WIDGET.OBJECT_FIELD_TEMPLATE] = JESGOFiledTemplete.OneOfFieldTemplate;
            uiSchema[propName][Const.UI_WIDGET.OPTIONS] = { label: false };
        }
    }
}

// ソート順の追加
const CreateOrderList = (orderList: string[], propName: string, parentPropName?: string) => {
    if (parentPropName) {
        // 親の次に追加
        const index = orderList.indexOf(parentPropName!);
        orderList.splice(index + 1, 0, propName);
    }else{
        orderList.push(propName);
    }
}