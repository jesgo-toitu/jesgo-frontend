import React, { useState } from "react";
import { UiSchema } from "@rjsf/core";
import { PanelSchema } from "./PanelSchema"
import {JESGOFiledTemplete} from "./JESGOFieldTemplete"
import { CreateUISchema } from './UISchemaUtility';
import { CustomDivForm } from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton,COMP_TYPE } from './ControlButton';
import { useDispatch } from "react-redux";

// ルートディレクトリ直下の子スキーマ
type Props = {
    schemaId: number,
    dispSchemaIds: number[],
    setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>,
}

export const TabSchema = React.memo((props: Props) => {
    console.log("call TabSchema");
    const { schemaId, dispSchemaIds, setDispSchemaIds } = props;
    // schemaIdをもとに情報を取得
    const schemaInfo = GetSchemaInfo(schemaId);
    const { document_schema, subschema,child_schema } = schemaInfo!;
    let uiSchema: UiSchema = CreateUISchema(document_schema);
    uiSchema["ui:ObjectFieldTemplate"] = JESGOFiledTemplete.TabItemFieldTemplate;
    
    // 表示中のchild_schema
    const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
    const [formData, setFormData] = useState<any>({});
    const dispatch = useDispatch();

    // console.log("---[TabSchema]schema---");
    // console.log(document_schema);
    // console.log("---[TabSchema]uiSchema---");
    // console.log(uiSchema);

    return (
        <>
            <ControlButton schemaId={schemaId} Type={COMP_TYPE.TAB}
                dispSchemaIds={dispSchemaIds} setDispSchemaIds={setDispSchemaIds}
                dispChildSchemaIds={dispChildSchemaIds} setDispChildSchemaIds={setDispChildSchemaIds} childSchemaIds={child_schema}></ControlButton>
            <CustomDivForm schemaId={schemaId} dispatch={dispatch} setFormData={setFormData}
                schema={document_schema} uiSchema={uiSchema} formData={formData} />
            {
                (subschema.length > 0) &&
                subschema.map((id: number) => {
                    return (
                        <PanelSchema key={id} schemaId={id} setDispSchemaIds={setDispChildSchemaIds} dispSchemaIds={dispChildSchemaIds}></PanelSchema>
                    )
                })
            }
            {
                // childSchema表示
                (dispChildSchemaIds.length > 0) &&
                dispChildSchemaIds.map((id: number) => {
                    return (
                        <PanelSchema key={id} schemaId={id} setDispSchemaIds={setDispChildSchemaIds} dispSchemaIds={dispChildSchemaIds}></PanelSchema>
                    )
                })
            }
        </>

    )
}
)