import React from "react";
import SchemaForm from "@rjsf/core";
import { Panel } from 'react-bootstrap';
import { DevSchema } from "../../common/DevSchema"
import "../../views/Registration.css"

// 孫スキーマ以降
type Props = {
    schemaId: number,
}

export function GetSchemaInfo(id: number) {
    const result = DevSchema.temp_record.find(info => { return info.id === id; });
    return result;
}

export const PanelSchema = React.memo((props: Props) => {
    const { schemaId } = props;
    // schemaIdをもとに情報を取得
    const schemaInfo = GetSchemaInfo(schemaId);
    if(schemaInfo === undefined){
        return null;
    }
    const { schema, subschema } = schemaInfo!;

    return (
        <Panel key={`panel-${schemaId}`} className="panel-style">
            <SchemaForm key={`div-${schemaId}`} schema={schema} tagName="div"><div></div></SchemaForm>
            {
                (subschema.length > 0) &&
                subschema.map((id: number) => {
                    return (
                        <PanelSchema key={id} schemaId={id}></PanelSchema>
                    )
                })
            }
        </Panel>
    )
}
)