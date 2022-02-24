import React from "react";
import { JSONSchema7 } from "json-schema";
import { FieldTemplateProps, ObjectFieldTemplateProps, ArrayFieldTemplateProps } from "@rjsf/core";
import { JESGOComp } from "./JESGOComponent";
import "./JESGOFieldTemplete.css"
import { AddButton, ArrayFieldTitle } from './RjsfDefaultComponents';

export namespace JESGOFiledTemplete {

    // タイプラベル付きのみのテンプレート
    export function WithTypeLableTemplete(props: FieldTemplateProps) {
        const { id, classNames, label, help, required, description, errors, children, schema } = props;
        return (
            <div className={classNames}>
                {label && (
                    <div>
                        <label className="label-type" htmlFor={id}>{label}{required ? "*" : null}</label>
                        <JESGOComp.TypeLabel requireType={schema["jesgo:required"]} pId={props.id} />
                    </div>
                )}                
                {/* TODO markdownで来ている場合の対応 */}
                {description}
                {children}
                {errors}
                {help}
            </div>
        );
    }

    // タブの中身のテンプレート
    export function TabItemFieldTemplate(props: ObjectFieldTemplateProps) {
        const { properties, description } = props;
        return (
            <fieldset>
                {description && <p>{description}</p>}
                {properties.map(prop => (
                    <div
                        // タブのルートコンテンツはインデントしない
                        style={{marginLeft:"0px"}}
                        key={prop.content.key}>
                        {prop.content}
                    </div>
                ))}
            </fieldset>
        );
    }

    // oneOfのテンプレート
    // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ObjectField.js
    // Latest commit 89d8e43
    export function OneOfFieldTemplate(props: ObjectFieldTemplateProps) {
        const { idSchema,uiSchema, DescriptionField, properties, description, title, required } = props;
        return (
            <fieldset id={props.idSchema.$id}>
                {(props.uiSchema["ui:title"] || props.title) && (
                    // <TitleField
                    //     id={`${props.idSchema.$id}__title`}
                    //     title={props.title || props.uiSchema["ui:title"]}
                    //     required={props.required}
                    //     // formContext={props.formContext}
                    // />
                    <div>
                        <label className="label-type" htmlFor={`${idSchema.$id}__title`}>
                            {title || uiSchema["ui:title"]}
                            {required ? "*" : null}
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
                {props.properties.map(prop => prop.content)}
                {/* {canExpand(props.schema, props.uiSchema, props.formData) && (
                    <AddButton
                        className="object-property-expand"
                        onClick={props.onAddClick(props.schema)}
                        disabled={props.disabled || props.readonly}
                    />
                )} */}
            </fieldset>
        );
      }
      

    // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
    // Latest commit 1bbd0ad 
    // 配列フィールドテンプレート
    export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
        return (
            <div>
                {/* {props.items.map(element => element.children)}
                {props.canAdd && <button type="button" onClick={props.onAddClick}>追加</button>} */}
                <fieldset className={props.className} id={props.idSchema.$id}>
                    <ArrayFieldTitle
                        key={`array-field-title-${props.idSchema.$id}`}
                        TitleField={props.TitleField}
                        idSchema={props.idSchema}
                        title={props.uiSchema["ui:title"] || props.title}
                        required={props.required}
                    />

                    {(props.uiSchema["ui:description"] || props.schema.description) && (
                        <div
                            className="field-description"
                            key={`field-description-${props.idSchema.$id}`}>
                            {props.uiSchema["ui:description"] || props.schema.description}
                        </div>
                    )}

                    <div
                        className="row array-item-list"
                        key={`array-item-list-${props.idSchema.$id}`}>
                        {props.items && props.items.map(JESGOComp.DefaultArrayItem)}
                    </div>

                    {props.canAdd && (
                        <AddButton
                            className="array-item-add col-lg-1 col-md-1 col-sm-2 col-lg-offset-11 col-md-offset-11 col-sm-offset-10"
                            onClick={props.onAddClick}
                            disabled={props.disabled || props.readonly}
                        />
                    )}
                </fieldset>
            </div>
        );      
    }


}

