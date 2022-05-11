/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { Dispatch } from 'redux';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { JESGOComp } from './JESGOComponent';
import store from '../../store';

interface CustomDivFormProp extends FormProps<any> {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  schemaId: number;
  dispatch: Dispatch;
  setFormData: React.Dispatch<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  documentId: string;
}

// カスタムフォーム
// - <Form></Form>ではなく<div></div>で返す
// - submitボタンは非表示
// - 配列Widgetのボタン調整
// - onChangeでuseStateで保持しているformDataを更新する
const CustomDivForm = (props: CustomDivFormProp) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { schemaId, dispatch, setFormData, documentId } = props;
  let { formData } = props;

  const saveData = store.getState().formDataReducer.saveData;
  const thisDocument = saveData.jesgo_document.find(
    (p) => p.key === documentId
  );
  if (thisDocument) {
    formData = thisDocument.value.document;
  }

  // 描画の段階でstore側にフォームデータを保存しておく
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  dispatch({ type: 'INPUT', schemaId, formData, documentId });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChange = (e: IChangeEvent<any>) => {
    setFormData(e.formData);
    // TODO formDataだと一つ前のデータが表示されるため、変更後の値を直接更新
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dispatch({ type: 'INPUT', schemaId, formData: e.formData, documentId });
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
  };

  return (
    <Form
      className="input-form"
      tagName="div"
      ArrayFieldTemplate={JESGOFiledTemplete.ArrayFieldTemplate}
      onChange={onChange}
      fields={customFields}
      widgets={customWidgets}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <div />
    </Form>
  );
};

export default CustomDivForm;
