import React, { useState } from "react";
import { Tabs, Tab,Panel } from 'react-bootstrap';
import { TabSchema} from './TabSchema';
import "../../views/Registration.css"
import { CreateUISchema } from './UISchemaUtility';
import { CustomDivForm } from "./JESGOCustomForm";
import { GetSchemaInfo } from "../../common/CaseRegistrationUtility";
import { ControlButton,COMP_TYPE } from './ControlButton';
import { useDispatch } from "react-redux";

type Props = {
    schemaId: number,
    dispSchemaIds: number[],
    setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>,
}

// ルートディレクトリのスキーマ
export const RootSchema = React.memo((props: Props) => {
    const { schemaId, dispSchemaIds, setDispSchemaIds } = props;
    console.log("call RootSchema");

    // 表示中のchild_schema
    const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
    const [formData, setFormData] = useState<any>({});
    const dispatch = useDispatch();

    // ルートのschema情報を取得
    const schemaInfo = GetSchemaInfo(schemaId);
    if(schemaInfo === undefined){
        return null;
    }
    const { document_schema, subschema,child_schema } = schemaInfo!;
    const uiSchema = CreateUISchema(document_schema);
  
    // console.log("---[RootSchema]schema---");
    // console.log(document_schema);
    // console.log("---[RootSchema]uiSchema---");
    // console.log(uiSchema);

    const createTab = (schemaIds:number[]) => {
        // subschema表示
        return schemaIds.map((id: number) => {
            // TODO 仮。本来はAPI
            const subtitle = GetSchemaInfo(id)?.title;
            if (subtitle === undefined) return;
            return (
                // TODO TabSchemaにTabを置くとうまく動作しなくなる
                <Tab key={`tab-${id}`} className="panel-style" eventKey={id} title={subtitle}>
                    <TabSchema key={`tabitem-${id}`} schemaId={id} dispSchemaIds={dispChildSchemaIds} setDispSchemaIds={setDispChildSchemaIds}></TabSchema>
                </Tab>
            )
        })
    }

    return (
        <>
            <ControlButton schemaId={schemaId} Type={COMP_TYPE.ROOT_TAB}
                dispSchemaIds={dispSchemaIds} setDispSchemaIds={setDispSchemaIds}
                dispChildSchemaIds={dispChildSchemaIds} setDispChildSchemaIds={setDispChildSchemaIds} childSchemaIds={child_schema}></ControlButton>
            <CustomDivForm schemaId={schemaId} dispatch={dispatch} setFormData={setFormData} formData={formData} uiSchema={uiSchema} schema={document_schema} />
            {
                (subschema.length > 0 || dispChildSchemaIds.length > 0) &&
                <Tabs id="subschema-tabs">
                    {/* subschema表示 */}
                    {createTab(subschema)}

                    {/* childSchema表示 */}
                    {createTab(dispChildSchemaIds)}
                </Tabs>
            }
        </>
    )
})