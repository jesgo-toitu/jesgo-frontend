import React, { Dispatch, SetStateAction, useState } from "react";
import SchemaForm from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import { Tabs, Tab } from 'react-bootstrap';
import { TabSchema, GetSchemaInfo } from './TabSchema';
import {Documents} from "../../views/Registration"
import "../../views/Registration.css"

// ルートディレクトリのスキーマ
// TODO：スキーマテーブルが持つ情報の型を共通で作る
type Props = {
    schemaId: number,
    schema: JSONSchema7,
    subSchemaIds: number[],
    docInfo: Documents[] | undefined,
    setdocInfo: Dispatch<SetStateAction<Documents[] | undefined>>,
    setChildInfo: Dispatch<SetStateAction<Documents | undefined>>,
}

export const RootSchema = React.memo((props: Props) => {
    console.log("RootSchema");
    const { schemaId, schema, subSchemaIds, setChildInfo } = props;

    const onChange = (formData: any) => {
        setChildInfo({ "document_id": schemaId, "document": formData });
    }

    return (
        <>
            <SchemaForm onChange={onChange} schema={schema} tagName="div"><div></div></SchemaForm>
            {
                (subSchemaIds.length > 0) &&
                <Tabs id="subschema-tabs" style={{ border: "1px solid #ddd" }}>
                    {
                        subSchemaIds.map((id: number) => {
                            // TODO 可能ならループの外でやりたい
                            const subtitle = GetSchemaInfo(id)?.title;
                            if (subtitle === undefined) return;
                            return (
                                <Tab className="panel-style" key={id} eventKey={id} title={subtitle}>
                                    <TabSchema schemaId={id}></TabSchema>
                                </Tab>
                            )
                        })
                    }
                </Tabs>
            }
        </>
    )
})