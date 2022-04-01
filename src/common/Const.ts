/* eslint-disable @typescript-eslint/no-namespace */
export namespace Const {
  // サーバーIPアドレス
  export const END_POINT = 'http://localhost:3000/';

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
    UI_TEXTAREA: 'jesgo:ui:textarea',
    UI_LISTTYPE: 'jesgo:ui:listtype',
    UI_SUBSCHEMA_STYLE: 'jesgo:ui:subschemastyle',
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
    ONEOF:'oneOf',
    IF: 'if',
    THEN: 'then',
    ELSE: 'else',
  } as const;

  /**
   * JSONSchema7TypesのType
   */
  export const JSONSchema7Types = {
    ARRAY: 'array',
    OBJECT:'object',
    STRING:'string'
  } as const;

  /**
   * 必須項目のラベル横に出るマーク
   */
  export const REQUIRED_FIELD_SYMBOL = '*';
}
