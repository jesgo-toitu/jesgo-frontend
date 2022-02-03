import React from "react";
import { FieldTemplateProps, ObjectFieldTemplateProps } from "@rjsf/core";
import { JESGOComp } from "./JESGOComponent";
import "./JESGOFieldTemplete.css"

export namespace JESGOFiledTemplete {
    // タイプラベル付きテンプレート
    export function WithTypeLableTemplete(props: FieldTemplateProps) {
        const { id, classNames, label, help, required, description, errors, children, schema } = props;
        const requireType = schema["jesgo:required"];
        return (
            <div className={classNames}>
                <div>
                    <label className="label-type" htmlFor={id}>{label}{required ? "*" : null}</label>
                    <JESGOComp.TypeLabel requireType={requireType} pId={props.id} />
                </div>
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
            <div>
                <div><p>{description}</p></div>
                    {properties.map(prop => (
                        <div
                            key={prop.content.key}>
                            {prop.content}
                        </div>
                    ))}
                {/* </div> */}
            </div>
        );
      }
}