import React from 'react';
// eslint-disable-next-line import/no-unresolved
import { JSONSchema7, JSONSchema7Type } from 'json-schema';
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
import { getPropItemsAndNames } from './SchemaUtility';

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
        {required && (
          <span className="required">{Const.REQUIRED_FIELD_SYMBOL}</span>
        )}
        {/* <JESGOComp.TypeLabel
          requireType={schema['jesgo:required'] ?? []}
          pId={id ?? ''}
        /> */}
        <JESGOComp.DescriptionToolTip
          descriptionText={schema?.description ?? ''}
          documentId={id ?? ''}
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
          <div className="control-label">
            <label className="label-type" htmlFor={id}>
              {label}
              {required ? '*' : null}
            </label>
            <JESGOComp.TypeLabel
              requireType={schema['jesgo:required'] ?? []}
              pId={id}
              key={id}
            />
            <JESGOComp.DescriptionToolTip
              descriptionText={rawDescription}
              documentId={id ?? ''}
            />
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
      description,
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
        {description && (
          <DescriptionField
            id={`${idSchema.$id}__description`}
            description={description}
            // formContext={formContext}
          />
        )}
        {properties.map((prop) => prop.content)}
        {/* TODO：AdditionalPropertiesを制限事項にするので不要かも */}
        {utils.canExpand(schema, uiSchema, formData) && (
          <JESGOComp.AddButton
            className="object-property-expand"
            onClick={onAddClick(schema)}
            disabled={disabled || readonly}
            key={schema.$id}
          />
        )}
      </fieldset>
    );
  };

  // jesgo:ui:visibleWhenの条件
  type VisibleWhenItem = {
    name: string;
    values?: JSONSchema7Type[];
    pattern?: RegExp;
  };

  // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
  // Latest commit 1bbd0ad
  // 配列フィールドテンプレート
  export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { idSchema, schema, uiSchema, required, DescriptionField, formData } =
      props;

    const id = `${idSchema.$id}__title`;
    const description =
      (uiSchema['ui:description'] as string) || schema.description;
    const items = schema.items as JSONSchema7;
    const subschemastyle = items[Const.EX_VOCABULARY.UI_SUBSCHEMA_STYLE];

    // jesgo:ui:visibleWhen
    const visibleWhenCondition: VisibleWhenItem[] = [];
    const propertiesItem = getPropItemsAndNames(items);
    propertiesItem.pNames.forEach((name: string) => {
      const item = propertiesItem.pItems[name] as JSONSchema7;
      const visiblewhenItem = item[
        Const.EX_VOCABULARY.UI_VISIBLE_WHWN
      ] as JSONSchema7;
      if (visiblewhenItem) {
        const vPropItem = getPropItemsAndNames(visiblewhenItem);
        vPropItem.pNames.forEach((vName: string) => {
          const vItem = vPropItem.pItems[vName] as JSONSchema7;
          let values;
          let pattern;
          if (vItem.const) {
            values = [vItem.const];
          } else if (vItem.enum) {
            values = [...vItem.enum];
          } else if (vItem.pattern) {
            pattern = new RegExp(vItem.pattern);
          }
          visibleWhenCondition.push({ name: vName, values, pattern });
        });
      }
    });
    return (
      <div>
        {/* eslint-disable-next-line react/destructuring-assignment */}
        <fieldset className={props.className} id={props.idSchema.$id}>
          <legend id={id}>
            {/* eslint-disable-next-line react/destructuring-assignment */}
            {uiSchema['ui:title'] || props.title}
            {required && (
              <span className="required">{Const.REQUIRED_FIELD_SYMBOL}</span>
            )}
            {/* eslint-disable react/destructuring-assignment */}
            <JESGOComp.TypeLabel
              requireType={schema['jesgo:required'] ?? []}
              pId={props.idSchema.$id ?? ''}
            />
            {/* eslint-enable */}
            <JESGOComp.DescriptionToolTip
              descriptionText={description ?? ''}
              documentId={id ?? ''}
            />
          </legend>
          {/* eslint-disable react/destructuring-assignment */}
          <div
            className="array-item-list array-item-padding"
            key={`array-item-list-${props.idSchema.$id}`}
          >
            {/* eslint-enable */}
            {/* eslint-disable-next-line react/destructuring-assignment */}
            {props.items &&
              //  eslint-disable-next-line react/destructuring-assignment
              props.items.map((item, index) => {
                const editItem = item;
                if (subschemastyle === 'inline') {
                  editItem.className += ' array-subschemastyle-inline';
                } else if (subschemastyle === 'column') {
                  editItem.className += ' array-subschemastyle-column';
                }
                // visiblewhen
                visibleWhenCondition.forEach((condition: VisibleWhenItem) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const inputData = formData[index][
                    condition.name
                  ] as JSONSchema7Type;
                  if (
                    !(
                      (condition.values &&
                        condition.values.includes(inputData)) ||
                      (condition.pattern &&
                        typeof inputData === 'string' &&
                        inputData.match(condition.pattern))
                    )
                  ) {
                    // 条件に【当てはまらなければ】非表示にするCSSを追加
                    editItem.className += ' visiblewhen-hidden';
                  }
                });
                return JESGOComp.DefaultArrayItem(editItem);
              })}
          </div>

          {/* eslint-disable react/destructuring-assignment */}
          {props.canAdd && (
            <JESGOComp.AddButton
              className="array-item-add col-lg-1 col-md-1 col-sm-2 col-lg-offset-11 col-md-offset-11 col-sm-offset-10"
              onClick={props.onAddClick}
              disabled={props.disabled || props.readonly}
            />
          )}
          {/* eslint-enable */}
        </fieldset>
      </div>
    );
  };

  // https://github.com/rjsf-team/react-jsonschema-form/blob/4542cd254ffdc6dfaf55e8c9f6f17dc900d0d041/packages/core/src/components/fields/ObjectField.js
  // Latest commit 64b8921
  /* eslint-disable react/destructuring-assignment */
  export const CustomObjectFieldTemplate = (
    props: ObjectFieldTemplateProps
  ) => {
    const {
      required,
      description,
      schema,
      uiSchema,
      formData, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
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
            <JESGOComp.DescriptionToolTip
              descriptionText={description}
              documentId={props.idSchema.$id ?? ''}
            />
          </legend>
        )}
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
// eslint-enable
