import React from "react";
import { IdSchema } from "@rjsf/core";



// https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/IconButton.js
// Latest commit ef8b7fc 
// TODO 仮でany
export function IconButton(props: any) {
    const { type = "default", icon, className, ...otherProps } = props;
    return (
        <button
            type="button"
            className={`btn btn-${type} ${className}`}
            {...otherProps}>
            <i className={`glyphicon glyphicon-${icon}`} />
        </button>
    );
}


type ArrayFieldTitleProp = {
    TitleField: React.StatelessComponent<{
        id: string;
        title: string;
        required: boolean;
    }>,
    idSchema: IdSchema<any>,
    title: string,
    required: boolean,
}

// https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
// Latest commit 1bbd0ad 
export function ArrayFieldTitle({ TitleField, idSchema, title, required }: ArrayFieldTitleProp) {
    if (!title) {
        return null;
    }
    const id = `${idSchema.$id}__title`;
    return <TitleField id={id} title={title} required={required} />;
}
