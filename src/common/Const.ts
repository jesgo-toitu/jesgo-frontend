import { formatDateStr } from './DBUtility';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Const {
  // JESGO Webアプリバージョン
  export const VERSION = '1.0.0';

  // UiSchemaプロパティ
  export const UI_WIDGET = {
    ORDER: 'ui:order',
    WIDGET: 'ui:widget',
    OPTIONS: 'ui:options',
    FIELD_TEMPLATE: 'ui:FieldTemplate',
    OBJECT_FIELD_TEMPLATE: 'ui:ObjectFieldTemplate',
    CLASS: 'classNames',
  } as const;

  // 拡張ボキャブラリー
  export const EX_VOCABULARY = {
    REQUIRED: 'jesgo:required',
    UNIQUE: 'jesgo:unique',
    VALIDATION_ALERT: 'jesgo:validationalert',
    UI_TEXTAREA: 'jesgo:ui:textarea',
    UI_LISTTYPE: 'jesgo:ui:listtype',
    UI_SUBSCHEMA_STYLE: 'jesgo:ui:subschemastyle',
    UI_VISIBLE_WHWN: 'jesgo:ui:visibleWhen',
    UI_HIDDEN: 'jesgo:ui:hidden',
  } as const;

  /**
   * JSONSchema7のKey
   */
  export const JSONSchema7Keys = {
    DESCRIPTION: 'description',
    REF: '$ref',
    DEFS: '$defs',
    ITEMS: 'items',
    TYPE: 'type',
    PROP: 'properties',
    FORMAT: 'format',
    ONEOF: 'oneOf',
    IF: 'if',
    THEN: 'then',
    ELSE: 'else',
    PATTERN: 'pattern',
  } as const;

  /**
   * JSONSchema7TypesのType
   */
  export const JSONSchema7Types = {
    ARRAY: 'array',
    OBJECT: 'object',
    STRING: 'string',
    INTEGER: 'integer',
    NUMBER: 'number',
  } as const;

  /**
   * 必須項目のラベル横に出るマーク
   */
  export const REQUIRED_FIELD_SYMBOL = '*';

  /**
   * 日付入力コントロールの最小値
   */
  export const INPUT_DATE_MIN = '1900-01-01';

  /**
   * 日付入力コントロールの最大値
   */
  export const INPUT_DATE_MAX = () => formatDateStr(new Date().toString(), '-'); // 現在日を最大とする
}
