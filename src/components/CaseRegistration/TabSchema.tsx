import React from "react";
import SchemaForm, { UiSchema } from "@rjsf/core";
import { DevSchema } from "../../common/DevSchema"
import { PanelSchema } from "./PanelSchema"
import {JESGOFiledTemplete} from "./JESGOFieldTemplete"

// ルートディレクトリ直下の子スキーマ
type Props = {
    schemaId: number,
}

export function GetSchemaInfo(id: number) {
    const result = DevSchema.temp_record.find(info => { return info.id === id; });
    return result;
}

export const TabSchema = React.memo((props: Props) => {
    const { schemaId } = props;
    // schemaIdをもとに情報を取得
    const schemaInfo = GetSchemaInfo(schemaId);
    const { schema, subschema } = schemaInfo!;
    let uiSchema: UiSchema = { "ui:ObjectFieldTemplate": JESGOFiledTemplete.TabItemFieldTemplate };

    return (
        <>
        <SchemaForm schema={schema} uiSchema={uiSchema} tagName="div">
            <div></div>
        </SchemaForm>
        {
            (subschema.length > 0) &&
            subschema.map((id:number) => {
                return (
                    <PanelSchema key={id} schemaId={id}></PanelSchema>
                )
            })
        }
        </>
        
    )
}
)