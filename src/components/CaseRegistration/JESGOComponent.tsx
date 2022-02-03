import React from "react";
import { Label } from 'react-bootstrap';
import "./JESGOComponent.css"

export namespace JESGOComp {
    // "jesgo:required"用ラベル
    export const TypeLabel = (props: { requireType?: string[], pId: string }) => {
        const require = ["JSOG", "JSGOE"];
        const { requireType, pId } = props;
        let style: string = "default";
        return (
            <>
                {
                    require.map((type: string) => {
                        if (type === "JSGOE") {
                            style = "info";
                        }

                        return requireType?.includes(type) &&
                            <Label className="label-type" bsStyle={style} key={pId + "_label" + type}>{type}</Label>
                    })
                }
            </>
        )
    }
}