import React, { useState } from 'react';
import { UiSchema } from '@rjsf/core';
import { useDispatch } from 'react-redux';
import PanelSchema from './PanelSchema';
import { JESGOFiledTemplete } from './JESGOFieldTemplete';
import { CreateUISchema } from './UISchemaUtility';
import CustomDivForm from './JESGOCustomForm';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { JesgoDocumentSchema } from '../../temp/ReadSchema';
import { CustomSchema } from './SchemaUtility';

// ルートディレクトリ直下の子スキーマ
type Props = {
  schemaId: number;
  dispSchemaIds: number[];
  setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const TabSchema = React.memo((props: Props) => {
  const { schemaId, dispSchemaIds, setDispSchemaIds } = props;
  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  const { documentSchema, subschema, childSchema } = schemaInfo as JesgoDocumentSchema;

  // 表示中のchild_schema
  const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});  // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  const dispatch = useDispatch();

  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  const uiSchema: UiSchema = CreateUISchema(customSchema);
  uiSchema['ui:ObjectFieldTemplate'] = JESGOFiledTemplete.TabItemFieldTemplate;

  // console.log("---[TabSchema]schema---");
  // console.log(document_schema);
  // console.log("---[TabSchema]uiSchema---");
  // console.log(uiSchema);

  return (
    <>
      <ControlButton
        schemaId={schemaId}
        Type={COMP_TYPE.TAB}
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
        schema={customSchema}
        uiSchema={uiSchema}
        formData={formData} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      />
      {subschema.length > 0 &&
        subschema.map((id: number) => (
          <PanelSchema
            key={id}
            schemaId={id}
            setDispSchemaIds={setDispChildSchemaIds}
            dispSchemaIds={dispChildSchemaIds}
          />
        ))}
      {
        // childSchema表示
        dispChildSchemaIds.length > 0 &&
          dispChildSchemaIds.map((id: number) => (
            <PanelSchema
              key={id}
              schemaId={id}
              setDispSchemaIds={setDispChildSchemaIds}
              dispSchemaIds={dispChildSchemaIds}
            />
          ))
      }
    </>
  );
});

export default TabSchema;