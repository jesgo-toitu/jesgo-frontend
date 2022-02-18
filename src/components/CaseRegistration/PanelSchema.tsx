import React, { useState } from "react";
import { Panel } from 'react-bootstrap';
import "../../views/Registration.css"
import { CustomDivForm } from './JESGOCustomForm';
import { CreateUISchema } from './UISchemaUtility';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton,COMP_TYPE } from './ControlButton';
import { useDispatch } from "react-redux";


// 孫スキーマ以降
type Props = {
    schemaId: number,
    setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>,
    dispSchemaIds: number[],
}

export const PanelSchema = React.memo((props: Props) => {
    const { schemaId, setDispSchemaIds, dispSchemaIds } = props;
    // schemaIdをもとに情報を取得
    const schemaInfo = GetSchemaInfo(schemaId);
    if (schemaInfo === undefined) {
        return null;
    }
    const { document_schema, subschema, child_schema } = schemaInfo!;
    let uiSchema = CreateUISchema(document_schema);

    // 表示中のchild_schema
    const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
    const [formData, setFormData] = useState<any>({});
    const dispatch = useDispatch();

    return (
        <Panel key={`panel-${schemaId}`} className="panel-style">
            <ControlButton Type={COMP_TYPE.PANEL} schemaId={schemaId} setDispSchemaIds={setDispSchemaIds} dispSchemaIds={dispSchemaIds}
                dispSubSchemaIds={dispChildSchemaIds} setDispSubSchemaIds={setDispChildSchemaIds} childSchemaIds={child_schema} />
            <CustomDivForm schemaId={schemaId} dispatch={dispatch} setFormData={setFormData}
                key={`div-${schemaId}`} schema={document_schema} uiSchema={uiSchema} formData={formData} />
            {
                (subschema.length > 0) &&
                subschema.map((id: number) => {
                    return (
                        <PanelSchema key={id} schemaId={id} setDispSchemaIds={setDispChildSchemaIds} dispSchemaIds={dispChildSchemaIds}></PanelSchema>
                    )
                })
            }
            {
                (dispChildSchemaIds.length > 0) &&
                dispChildSchemaIds.map((id: number) => {
                    return (
                        <PanelSchema key={id} schemaId={id} setDispSchemaIds={setDispChildSchemaIds} dispSchemaIds={dispChildSchemaIds}></PanelSchema>
                    )
                })
            }
        </Panel>
    )
}
)
