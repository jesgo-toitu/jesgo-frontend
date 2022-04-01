import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import TabSchema from './TabSchema';
import '../../views/Registration.css';
import { CreateUISchema } from './UISchemaUtility';
import CustomDivForm from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { CustomSchema, getRootDescription } from './SchemaUtility';
import { JESGOFiledTemplete } from "./JESGOFieldTemplete";
import { JESGOComp } from './JESGOComponent';

type Props = {
  schemaId: number;
  dispSchemaIds: number[];
  setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>;
};

// ルートディレクトリのスキーマ
const RootSchema = React.memo((props: Props) => {
  const { schemaId, dispSchemaIds, setDispSchemaIds } = props;

  // 表示中のchild_schema
  const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});
  const dispatch = useDispatch();

  // ルートのschema情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  if (schemaInfo === undefined) {
    return null;
  }
  const { documentSchema, subschema, childSchema } = schemaInfo;
  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const uiSchema = CreateUISchema(customSchema);
  uiSchema["ui:ObjectFieldTemplate"] = JESGOFiledTemplete.TabItemFieldTemplate;

  // console.log("---[RootSchema]schema---");
  // console.log(document_schema);
  // console.log("---[RootSchema]uiSchema---");
  // console.log(uiSchema);

  const createTab = (schemaIds: number[]) => 
    // subschema表示
     schemaIds.map((id: number) => {
      // TODO 仮。本来はAPI
      const title = GetSchemaInfo(id)?.title ?? '';
      const description = getRootDescription(GetSchemaInfo(id)?.documentSchema) ?? '';
      return (
        // TODO TabSchemaにTabを置くとうまく動作しなくなる
        <Tab
          key={`tab-${id}`}
          className="panel-style"
          eventKey={id}
          title={
            <>
              <span>{title} </span>
              <JESGOComp.DescriptionToolTip descriptionText={description} />
            </>
          }
        >
          <TabSchema
            key={`tabitem-${id}`}
            schemaId={id}
            dispSchemaIds={dispChildSchemaIds}
            setDispSchemaIds={setDispChildSchemaIds}
          />
        </Tab>
      );
    })
  ;

  return (
    <>
      <ControlButton
        schemaId={schemaId}
        Type={COMP_TYPE.ROOT_TAB}
        dispSchemaIds={dispSchemaIds}
        setDispSchemaIds={setDispSchemaIds}
        dispChildSchemaIds={dispChildSchemaIds}
        setDispChildSchemaIds={setDispChildSchemaIds}
        childSchemaIds={childSchema}
       />
      <CustomDivForm
        schemaId={schemaId}
        dispatch={dispatch}
        setFormData={setFormData}
        formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        uiSchema={uiSchema}
        schema={customSchema}
      />
      {(subschema.length > 0 || dispChildSchemaIds.length > 0) && (
        <Tabs id="subschema-tabs">
          {/* subschema表示 */}
          {createTab(subschema)}

          {/* childSchema表示 */}
          {createTab(dispChildSchemaIds)}
        </Tabs>
      )}
    </>
  );
});

export default RootSchema;