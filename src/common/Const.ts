export namespace Const {

    // サーバーIPアドレス
    export const END_POINT: string = "http://localhost:3000/";

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
    } as const;
}