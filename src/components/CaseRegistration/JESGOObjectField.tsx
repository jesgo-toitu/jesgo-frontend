import React, { useRef, useLayoutEffect } from 'react';
import { ObjectFieldProps } from '@rjsf/core/lib/components/fields/ObjectField';

// eslint-disable-next-line import/prefer-default-export
export const JESGOObjectField = (props: ObjectFieldProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  const { parentFormData, parentOnChange } = formContext;
  const { fields } = registry;
  const SchemaField = fields.SchemaField;

  const isArray = idSchema?.$id?.match(/_\d+(_|$)/);

  const idParts = idSchema?.$id?.split('_') || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  const arrayIndex = idParts.findIndex((part: any) => /^\d+$/.test(part));
  const propName = arrayIndex > 0 ? idParts[arrayIndex - 1] : null;
  const index = arrayIndex >= 0 ? Number(idParts[arrayIndex]) : null;

  const requiredFields = schema.required || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, val: any) => {
    if (index === null || !parentFormData || !parentOnChange || !propName) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onChange({ ...formData, [key]: val });
      return;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const updatedArray = Array.isArray(parentFormData[propName]) ? [...parentFormData[propName]] : [];
    updatedArray[index] = {
      ...(updatedArray[index] || {}),
      [key]: val,
    };
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    parentOnChange({
      formData: {
        ...parentFormData,
        [propName]: updatedArray
      },
      schema,
      uiSchema,
      idSchema,
      registry
    });
  };

  const content = Object.entries(schema.properties || {}).map(([key, subschema]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visibleWhenItem = (subschema as any)['jesgo:ui:visibleWhen'];
    const visible = !(
      visibleWhenItem &&
      visibleWhenItem.properties &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.entries(visibleWhenItem.properties).some(([conditionKey, conditionValue]) => {
        const inputValue = formData[conditionKey];
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const conditionConst = (conditionValue as any).const;
        const conditionEnum = (conditionValue as any).enum;
        const conditionPattern = (conditionValue as any).pattern;
        /* eslint-disable @typescript-eslint/no-explicit-any */ 
        return (conditionConst && inputValue !== conditionConst) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          (conditionEnum && !conditionEnum.includes(inputValue)) ||
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          (conditionPattern && typeof inputValue === 'string' && !inputValue.match(conditionPattern));
      }));
    const childFormData = formData[key];
    const className = visible ? 'visiblewhen' : 'visiblewhen-item'
    return (
      <div key={key} className={className}>
        <SchemaField
          name={key}
          schema={subschema as any}
          uiSchema={uiSchema?.[key]}
          formData={childFormData}
          onChange={(val: any) => handleChange(key, val)}
          idSchema={idSchema?.[key]}
          registry={registry}
          errorSchema={errorSchema?.[key]}
          onBlur={onBlur}
          onFocus={onFocus}
          formContext={formContext}
          autofocus={autofocus}
          disabled={disabled}
          readonly={readonly}
          required={requiredFields.includes(key)}
        />
      </div>
    );
  });

  return isArray ? (
    <fieldset id={idSchema?.$id}>
      {content}
    </fieldset>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {content}
    </>
  );
}
