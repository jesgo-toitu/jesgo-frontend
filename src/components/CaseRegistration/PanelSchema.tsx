import React, { useState } from 'react';
import { Panel } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import '../../views/Registration.css';
import CustomDivForm from './JESGOCustomForm';
import { CreateUISchema } from './UISchemaUtility';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { ControlButton, COMP_TYPE } from './ControlButton';
import { CustomSchema } from './SchemaUtility';

// 孫スキーマ以降
type Props = {
  schemaId: number;
  setDispSchemaIds: React.Dispatch<React.SetStateAction<number[]>>;
  dispSchemaIds: number[];
};

const PanelSchema = React.memo((props: Props) => {
  const { schemaId, setDispSchemaIds, dispSchemaIds } = props;
  // schemaIdをもとに情報を取得
  const schemaInfo = GetSchemaInfo(schemaId);
  if (schemaInfo == null) {
    return null;
  }
  
  // 表示中のchild_schema
  const [dispChildSchemaIds, setDispChildSchemaIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});  // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
  const dispatch = useDispatch();

  const { documentSchema, subschema, childSchema } = schemaInfo ;
  const customSchema = CustomSchema({ orgSchema: documentSchema, formData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const uiSchema = CreateUISchema(customSchema);

  // console.log('---[PanelSchema]schemaInfo---');
  // console.log(schemaInfo);
  // console.log('---[PanelSchema]schema---');
  // console.log(customSchema);
  // console.log('---[PanelSchema]uiSchema---');
  // console.log(uiSchema);

  return (
    <Panel key={`panel-${schemaId}`} className="panel-style">
      <ControlButton
        Type={COMP_TYPE.PANEL}
        schemaId={schemaId}
        setDispSchemaIds={setDispSchemaIds}
        dispSchemaIds={dispSchemaIds}
        dispChildSchemaIds={dispChildSchemaIds}
        setDispChildSchemaIds={setDispChildSchemaIds}
        childSchemaIds={childSchema}
      />
      <CustomDivForm
        schemaId={schemaId}
        dispatch={dispatch}
        setFormData={setFormData}
        key={`div-${schemaId}`}
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
      {dispChildSchemaIds.length > 0 &&
        dispChildSchemaIds.map((id: number) => (
            <PanelSchema
              key={id}
              schemaId={id}
              setDispSchemaIds={setDispChildSchemaIds}
              dispSchemaIds={dispChildSchemaIds}
             />
          ))}
    </Panel>
  );
});

export default PanelSchema;
