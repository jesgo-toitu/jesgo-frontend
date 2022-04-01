import React from 'react';
// eslint-disable-next-line import/no-unresolved
import {JSONSchema7} from 'json-schema';
import {
  FieldProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  ArrayFieldTemplateProps,
  utils,
} from '@rjsf/core';
import { JESGOComp } from './JESGOComponent';
import { Const } from '../../common/Const';
import './JESGOFieldTemplete.css';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JESGOFiledTemplete {
  // https://github.com/rjsf-team/react-jsonschema-form/blob/4542cd254ffdc6dfaf55e8c9f6f17dc900d0d041/packages/core/src/components/fields/TitleField.js
  // Latest commit ef8b7fc
  // カスタムタイトル
  export const CustomTitle = (props: FieldProps) => {
    const { id, title, required, schema, uiSchema } = props;
    return (
      <legend id={id}>
        {title}
        {required && <span className="required">{Const.REQUIRED_FIELD_SYMBOL}</span>}
        {/* <JESGOComp.TypeLabel
          requireType={schema['jesgo:required'] ?? []}
          pId={id ?? ''}
        /> */}
        <JESGOComp.DescriptionToolTip
          descriptionText={schema?.description ?? ''}
        />
      </legend>
    );
  };

  // カスタムラベルを使用するフィールドテンプレート
  // - jesgo:required：ラベルで表示
  // - description使用：ツールチップで表示
  export const CustomLableTemplete = (props: FieldTemplateProps) => {
    const {
      id,
      classNames,
      label,
      help,
      required,
      rawDescription,
      errors,
      children,
      schema,
    } = props;
    return (
      <div className={classNames}>
        {label && (
          <div>
            <label className="label-type" htmlFor={id}>
              {label}
              {required ? '*' : null}
            </label>
            <JESGOComp.TypeLabel
              requireType={schema['jesgo:required'] ?? []}
              pId={id}
            />
            <JESGOComp.DescriptionToolTip descriptionText={rawDescription} />
          </div>
        )}
        {children}
        {errors}
        {help}
      </div>
    );
  };

  // タブの中身のテンプレート
  export const TabItemFieldTemplate = (props: ObjectFieldTemplateProps) => {
    const {
      properties,
      DescriptionField,
      idSchema,
      schema,
      uiSchema,
      onAddClick,
      disabled,
      readonly,
      formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    } = props;
    return (
      <fieldset id={idSchema.$id}>
        {DescriptionField}
        {properties.map((prop) => prop.content)}
        {/* TODO：AdditionalPropertiesを制限事項にするので不要かも */}
        {utils.canExpand(schema, uiSchema, formData) && (
          <JESGOComp.AddButton
            className="object-property-expand"
            onClick={onAddClick(schema)}
            disabled={disabled || readonly}
          />
        )}
      </fieldset>
    );
  };

  // oneOfのテンプレート
  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ObjectField.js
  // Latest commit 89d8e43
  // DefaultObjectFieldTemplate()
  /* eslint-disable import/no-mutable-exports,no-var,react/destructuring-assignment */
  export var OneOfFieldTemplate = (props: ObjectFieldTemplateProps) => {
    const {
      idSchema,
      uiSchema,
      DescriptionField,
      // properties,
      description,
      title,
      required,
    } = props;
    return (
      <fieldset id={props.idSchema.$id}>
        {(props.uiSchema['ui:title'] || props.title) && (
          // <TitleField
          //     id={`${props.idSchema.$id}__title`}
          //     title={props.title || props.uiSchema["ui:title"]}
          //     required={props.required}
          //     // formContext={props.formContext}
          // />
          <div>
            <label className="label-type" htmlFor={`${idSchema.$id}__title`}>
              {title || uiSchema['ui:title']}
              {required ? '*' : null}
            </label>
          </div>
        )}
        {props.description && (
          <DescriptionField
            id={`${idSchema.$id}__description`}
            description={description}
            // formContext={props.formContext}
          />
        )}
        {props.properties.map((prop) => prop.content)}
        {/* {canExpand(props.schema, props.uiSchema, props.formData) && (
                    <AddButton
                        className="object-property-expand"
                        onClick={props.onAddClick(props.schema)}
                        disabled={props.disabled || props.readonly}
                    />
                )} */}
      </fieldset>
    );
  };
  /* eslint-enable */

  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
  // Latest commit 1bbd0ad
  /* eslint-disable import/no-mutable-exports,no-var,react/destructuring-assignment,@typescript-eslint/no-unsafe-assignment */
  // 配列フィールドテンプレート
  export var ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
    const { idSchema, schema, uiSchema, required, DescriptionField } = props;
    const id = `${idSchema.$id}__title`;
    const description = uiSchema['ui:description'] || schema.description;
    const items = schema.items as JSONSchema7;
    const subschemastyle = items["jesgo:ui:subschemastyle"];

    return (
      <div>
        <fieldset className={props.className} id={props.idSchema.$id}>
          <legend id={id}>
            {uiSchema['ui:title'] || props.title}
            {required && (
              <span className="required">{Const.REQUIRED_FIELD_SYMBOL}</span>
            )}
            <JESGOComp.TypeLabel
              requireType={schema['jesgo:required'] ?? []}
              pId={props.idSchema.$id ?? ''}
            />
            <JESGOComp.DescriptionToolTip descriptionText={description} />
          </legend>
          {DescriptionField}
          <div
            className="array-item-list array-item-padding"
            key={`array-item-list-${props.idSchema.$id}`}
          >
            {props.items &&
              props.items.map((item) => {
                const editItem = item;
                if (subschemastyle === 'inline') {
                  editItem.className += ' array-subschemastyle-inline';
                }
                return JESGOComp.DefaultArrayItem(editItem);
              })}
          </div>

          {props.canAdd && (
            <JESGOComp.AddButton
              className="array-item-add col-lg-1 col-md-1 col-sm-2 col-lg-offset-11 col-md-offset-11 col-sm-offset-10"
              onClick={props.onAddClick}
              disabled={props.disabled || props.readonly}
            />
          )}
        </fieldset>
      </div>
    );
  };

  // https://github.com/rjsf-team/react-jsonschema-form/blob/4542cd254ffdc6dfaf55e8c9f6f17dc900d0d041/packages/core/src/components/fields/ObjectField.js
  // Latest commit 64b8921
  export const CustiomObjectFieldTemplate = (
    props: ObjectFieldTemplateProps
  ) => {
    const {
      required,
      description,
      schema,
      uiSchema,
      formData,
      DescriptionField,
    } = props;
    return (
      <fieldset id={props.idSchema.$id}>
        {(props.uiSchema['ui:title'] || props.title) && (
          <legend id={`${props.idSchema.$id}__title`}>
            {props.title || props.uiSchema['ui:title']}
            {required && (
              <span className="required">{Const.REQUIRED_FIELD_SYMBOL}</span>
            )}
            <JESGOComp.TypeLabel
              requireType={schema['jesgo:required'] ?? []}
              pId={props.idSchema.$id ?? ''}
            />
            <JESGOComp.DescriptionToolTip descriptionText={description} />
          </legend>
        )}
        {DescriptionField}
        {props.properties.map((prop) => prop.content)}
        {utils.canExpand(schema, uiSchema, formData) && (
          <JESGOComp.AddButton
            className="object-property-expand"
            onClick={props.onAddClick(props.schema)}
            disabled={props.disabled || props.readonly}
          />
        )}
      </fieldset>
    );
  };
}
