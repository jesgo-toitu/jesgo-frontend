import React from "react";
import Form, { FormProps,IChangeEvent } from "@rjsf/core";
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { Dispatch } from "redux";


interface CustomDivFormProp extends FormProps<any> {
    schemaId: number,
    dispatch: Dispatch, 
    setFormData: React.Dispatch<any>
}


// カスタムフォーム
// - <Form></Form>ではなく<div></div>で返す
// - submitボタンは非表示
// - 配列Widgetのボタン調整
// - onChangeでuseStateで保持しているformDataを更新する
export const CustomDivForm =
    (props: CustomDivFormProp) => {
        const { schemaId, dispatch, setFormData } = props;

        const onChange = (e: IChangeEvent<any>) => {
            setFormData(e.formData);
            // TODO formDataだと一つ前のデータが表示されるため、変更後の値を直接更新
            dispatch({ type: "ADD", id: schemaId, formData: e.formData });
        }

        return (
            <Form
                tagName="div"
                ArrayFieldTemplate={JESGOFiledTemplete.ArrayFieldTemplate}
                onChange={onChange}
                {...props}>
                <div></div>
            </Form>
        )
    }