import React from 'react';
import { ObjectFieldProps } from '@rjsf/core/lib/components/fields/ObjectField';
import { ObjectFieldTemplateProps } from '@rjsf/core';
// eslint-disable-next-line import/no-cycle
import { JESGOFiledTemplete } from './JESGOFieldTemplete';

// eslint-disable-next-line import/prefer-default-export
export const JESGOObjectField = (props: ObjectFieldProps) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formData = {},
    onChange,
    schema,
    uiSchema,
    idSchema,
    registry,
    errorSchema,
    onBlur,
    onFocus,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formContext,
    autofocus,
    disabled,
    readonly
  } = props;
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { parentFormData, parentOnChange, parentPropName, parentIndex } = formContext || {};
  const { fields } = registry;
  const SchemaField = fields.SchemaField;
  const isTabItem = uiSchema['ui:ObjectFieldTemplate'] === JESGOFiledTemplete.TabItemFieldTemplate;
  const requiredFields = schema.required || [];
  const idParts = idSchema.$id.split('_');
  let propName = idParts[idParts.length - 1];
  if (/^\d+$/.test(propName) && idParts.length > 1) propName = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, val: any) => {
    if (
      typeof parentIndex !== 'number' ||
      !parentFormData ||
      !parentOnChange ||
      !parentPropName
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onChange({ ...formData, [key]: val });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const updatedArray = Array.isArray(parentFormData[parentPropName])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ? [...parentFormData[parentPropName]]
      : [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    updatedArray[parentIndex] = {
      ...(updatedArray[parentIndex] || {}),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [key]: val,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    parentOnChange({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      formData: {
        ...parentFormData,
        [parentPropName]: updatedArray
      },
      schema,
      uiSchema,
      idSchema,
      registry
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVisible = (subschema: any): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const visibleWhenItem = subschema['jesgo:ui:visibleWhen'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!visibleWhenItem || !visibleWhenItem.properties) return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return !Object.entries(visibleWhenItem.properties).some(([conditionKey, conditionValue]: [string, any]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const value = formData[conditionKey];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { const: conditionConst, enum: conditionEnum, pattern: conditionPattern } = conditionValue;
        return (conditionConst && value !== conditionConst) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          (conditionEnum && !conditionEnum.includes(value)) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          (conditionPattern && typeof value === 'string' && !value.match(conditionPattern));
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties = Object.entries(schema.properties || {}).map(([key, subschema]: [string, any]) => {
    const visible = isVisible(subschema);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let subUiSchema = uiSchema?.[key] || {};
    if (!visible) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      subUiSchema = {
        ...subUiSchema,
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        classNames: `${subUiSchema.classNames ?? ''} visiblewhen-item`.trim()
      };
    }
    return {
      name: key,
      content: (
        <SchemaField
          key={key}
          name={key}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          schema={subschema}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          uiSchema={subUiSchema}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          formData={formData?.[key]}
          onChange={(val) => handleChange(key, val)}
          idSchema={idSchema?.[key]}
          registry={registry}
          errorSchema={errorSchema?.[key]}
          onBlur={onBlur}
          onFocus={onFocus}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          formContext={formContext}
          autofocus={autofocus}
          disabled={disabled}
          readonly={readonly}
          required={requiredFields.includes(key)}
        />
      ),
      disabled,
      readonly,
      hidden: false
    };
  });

  const descriptionField: React.FC<{
    id: string;
    description: string | React.ReactElement;
  // eslint-disable-next-line arrow-body-style
  }> = ({ id, description }) => {
    return description ?
      <p id={id} className="field-description">
        {description}
      </p>
      : null;
  };

  const titleField: React.FunctionComponent<{ id: string;
    title: string;
    required: boolean;
  }> = ({ id, title, required }) => (
    <legend id={id}>
      {title}
      {required && <span className="required">*</span>}
    </legend>
  );
    
  const templateProps: ObjectFieldTemplateProps = {
    DescriptionField: descriptionField,
    TitleField: titleField,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    title: schema.title || uiSchema['ui:title'] || propName,
    description: schema.description || '',
    disabled,
    readonly,
    required: requiredFields.length > 0,
    properties,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAddClick: (val: any) => () => {
      onChange({
        ...formData,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(val.properties || {})
      });
    },
    schema,
    uiSchema,
    idSchema,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formData,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formContext,
    registry
  };

  return isTabItem
    ? JESGOFiledTemplete.TabItemFieldTemplate(templateProps)
    : JESGOFiledTemplete.CustomObjectFieldTemplate(templateProps);
};
