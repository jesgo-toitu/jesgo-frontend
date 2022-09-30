/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { Dispatch } from 'redux';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { JESGOComp } from './JESGOComponent';
import store from '../../store';
import { JSONSchema7 } from 'webpack/node_modules/schema-utils/declarations/ValidationError';
import {
  isNotEmptyObject,
  RegistrationErrors,
} from '../../common/CaseRegistrationUtility';
import { CreateUISchema } from './UISchemaUtility';

interface CustomDivFormProp extends FormProps<any> {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  schemaId: number;
  dispatch: Dispatch;
  setFormData: React.Dispatch<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  documentId: string;
  isTabItem: boolean;
}

// カスタムフォーム
// - <Form></Form>ではなく<div></div>で返す
// - submitボタンは非表示
// - 配列Widgetのボタン調整
// - onChangeでuseStateで保持しているformDataを更新する
const CustomDivForm = (props: CustomDivFormProp) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { schemaId, dispatch, setFormData, documentId, isTabItem } = props;
  let { formData, schema } = props;

  const copyProps = { ...props };

  const saveData = store.getState().formDataReducer.saveData;
  const thisDocument = saveData.jesgo_document.find(
    (p) => p.key === documentId
  );
  if (thisDocument) {
    formData = thisDocument.value.document;
  }

  // 継承直後、データ入力判定を動かすためにsetFormDataする
  if (JSON.stringify(copyProps.formData) !== JSON.stringify(formData)) {
    setFormData(formData);
  }
  copyProps.formData = formData;

  // validationエラーの取得
  const errors = store.getState().formDataReducer.extraErrors;
  if (errors) {
    const targetErrors = errors.find(
      (x: RegistrationErrors) => x.documentId === documentId
    );
    // エラーがある場合はエラー情報を埋め込んだスキーマに置き換える
    if (targetErrors) {
      // プロパティは現在のスキーマに置き換える
      targetErrors.validationResult.schema.properties = schema.properties;
      schema = targetErrors.validationResult.schema;
    }
  }

  // uiSchema作成
  const uiSchema = CreateUISchema(schema);
  if (isTabItem) {
    uiSchema['ui:ObjectFieldTemplate'] =
      JESGOFiledTemplete.TabItemFieldTemplate;
  }

  // 必須項目に入力があれば赤枠のスタイル解除
  if (schema.required && schema.required.length > 0) {
    Object.entries(uiSchema)
      .filter((p) => schema.required?.includes(p[0]))
      .forEach((item) => {
        const propName = item[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const classNames = item[1].classNames as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (classNames && isNotEmptyObject(formData[propName])) {
          // classNamesからrequired-itemを除外して赤枠を解除
          const schemaItem = uiSchema[propName];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          schemaItem.classNames = classNames
            .replace(/required-item/g, '')
            .trim();

          // itemsもあればそちらも解除する
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (schemaItem.items) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            schemaItem.items.classNames = schemaItem.items.classNames
              .replace(/required-item/g, '')
              .trim();
          }
        }
      });
  }

  // 描画の段階でstore側にフォームデータを保存しておく
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  dispatch({
    type: 'INPUT',
    schemaId,
    formData,
    documentId,
    isUpdateInput: false,
  });

  // 初回onChangeフラグ
  const [isFirstOnChange, setIsFirstOnChange] = useState<boolean>(true);
  // 初回描画済みフラグ
  const [isFirstRederComplited, setIsFirstRederComplited] =
    useState<boolean>(false);

  useEffect(() => {
    // 初回描画済みフラグを立てる
    setIsFirstRederComplited(true);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChange = (e: IChangeEvent<any>) => {
    let data = e.formData;
    // データがないと保存時にnot null制約違反になるため空オブジェクトに変換
    if (data === undefined || data === null) {
      data = {};
    }

    let hasDefault = false;
    if (e.schema.properties) {
      // デフォルト値を持っているプロパティ有無
      hasDefault = JSON.stringify(e.schema.properties).includes('"default"');
      if (!hasDefault) {
        // objectの場合もデフォルト値になるのでチェック
        hasDefault =
          Object.entries(e.schema.properties).filter((p) => {
            const tmpSchema = p[1] as JSONSchema7;
            switch (tmpSchema.type) {
              case 'object':
                return true;
              // case 'array': {
              //   return (tmpSchema.items as JSONSchema7).type === 'object';
              // }
              default:
                return false;
            }
          }).length > 0;
      }
    }

    if (isFirstOnChange && hasDefault && !isFirstRederComplited) {
      // 作成直後のデフォルト値設定によるonChangeの場合は表示中のデータとデフォルト値をマージする
      data = lodash.merge(formData, e.formData);
    }

    setFormData(data);

    if (
      !isFirstOnChange ||
      !hasDefault ||
      (isFirstOnChange && isFirstRederComplited)
    ) {
      // TODO formDataだと一つ前のデータが表示されるため、変更後の値を直接更新
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dispatch({
        type: 'INPUT',
        schemaId,
        formData: data,
        documentId,
        isUpdateInput: true,
      });
    }

    setIsFirstOnChange(false);
  };

  // TODO OneOfFieldについては他に影響ないか確認
  const customFields = {
    OneOfField: () => null, // defaultのOneOfFieldは使わない
  };

  const customWidgets = {
    // 既存のWidget
    DateWidget: JESGOComp.CustomDateWidget,
    TextareaWidget: JESGOComp.CustomTextareaWidget,

    // オリジナルのWidget
    layerDropdown: JESGOComp.LayerDropdown,
    multiTypeTextBox: JESGOComp.MultiTypeTextBox,
    datalistTextBox: JESGOComp.DatalistTextBox,
    withUnits: JESGOComp.WithUnits,
    layerRadioButton: JESGOComp.LayerRadioButton,
    layerComboBox: JESGOComp.LayerComboBox,
    customCheckboxesWidget: JESGOComp.CustomCheckboxesWidget,
  };

  return (
    <Form
      className="input-form"
      tagName="div"
      ArrayFieldTemplate={JESGOFiledTemplete.ArrayFieldTemplate}
      onChange={onChange}
      fields={customFields}
      widgets={customWidgets}
      noHtml5Validate
      showErrorList={false}
      uiSchema={uiSchema}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...copyProps}
    >
      <div />
    </Form>
  );
};

export default CustomDivForm;
