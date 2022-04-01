import React from 'react';
import Form, { FormProps, IChangeEvent } from '@rjsf/core';
import { Dispatch } from 'redux';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { JESGOComp } from './JESGOComponent';

interface CustomDivFormProp extends FormProps<any> {  // eslint-disable-line @typescript-eslint/no-explicit-any
  schemaId: number;
  dispatch: Dispatch;
  setFormData: React.Dispatch<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// カスタムフォーム
// - <Form></Form>ではなく<div></div>で返す
// - submitボタンは非表示
// - 配列Widgetのボタン調整
// - onChangeでuseStateで保持しているformDataを更新する
const CustomDivForm = (props: CustomDivFormProp) => {
  const { schemaId, dispatch, setFormData } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChange = (e: IChangeEvent<any>) => {
    setFormData(e.formData);
    // TODO formDataだと一つ前のデータが表示されるため、変更後の値を直接更新
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dispatch({ type: 'ADD', id: schemaId, formData: e.formData });
  };

  // TODO OneOfFieldについては他に影響ないか確認
  const customFields = {
    DescriptionField: () => null, // 注釈は非表示
    OneOfField: () => null,       // defaultのOneOfFieldは使わない
  };

  const customWidgets = {
    layerDropdown: JESGOComp.LayerDropdown,
    multiTypeTextBox: JESGOComp.MultiTypeTextBox,
    datalistTextBox: JESGOComp.DatalistTextBox,
    withUnits: JESGOComp.WithUnits,
  };

  return (
    <Form
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
