import React from "react";
import { Label } from 'react-bootstrap';
import "./JESGOComponent.css"
import "./JESGOFieldTemplete.css"
import { IconButton } from './RjsfDefaultComponents';
export namespace JESGOComp {
    // "jesgo:required"用ラベル
    export const TypeLabel = (props: { requireType?: string[], pId: string }) => {
        const require = ["JSOG", "JSGOE"];
        const { requireType, pId } = props;
        if(requireType === undefined) return <></>;

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

    // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/fields/ArrayField.js
    // Latest commit 1bbd0ad 
    // TODO propsは仮でany
    // 配列Widget用カスタムアイテム
    export function DefaultArrayItem(props: any) {
        const btnStyle = {
            flex: 1,
            paddingLeft: 6,
            paddingRight: 6,
            fontWeight: "bold",
        };
        return (
            <div key={props.key} className={`array-item-border row ${props.className}`}>
                {/* <div className={props.hasToolbar ? "col-xs-9" : "col-xs-12"}></div> */}
                <div className={props.hasToolbar ?
                    "col-lg-11 col-md-11 col-sm-10 col-xs-9" : "col-xs-12"}>
                    {props.children}
                </div>

                {props.hasToolbar && (
                    //   <div className="col-xs-3 array-item-toolbox">
                    <div className="col-lg-1 col-md-1 col-sm-2 col-xs-3 array-item-toolbox">
                        <div
                            className="btn-group"
                            style={{
                                display: "flex",
                                justifyContent: "space-around",
                            }}>
                            {(props.hasMoveUp || props.hasMoveDown) && (
                                <IconButton
                                    icon="arrow-up"
                                    aria-label="Move up"
                                    className="array-item-move-up"
                                    tabIndex="-1"
                                    style={btnStyle}
                                    disabled={props.disabled || props.readonly || !props.hasMoveUp}
                                    onClick={props.onReorderClick(props.index, props.index - 1)}
                                />
                            )}

                            {(props.hasMoveUp || props.hasMoveDown) && (
                                <IconButton
                                    icon="arrow-down"
                                    className="array-item-move-down"
                                    aria-label="Move down"
                                    tabIndex="-1"
                                    style={btnStyle}
                                    disabled={
                                        props.disabled || props.readonly || !props.hasMoveDown
                                    }
                                    onClick={props.onReorderClick(props.index, props.index + 1)}
                                />
                            )}

                            {props.hasRemove && (
                                <IconButton
                                    type="danger"
                                    icon="remove"
                                    aria-label="Remove"
                                    className="array-item-remove"
                                    tabIndex="-1"
                                    style={btnStyle}
                                    disabled={props.disabled || props.readonly}
                                        onClick={props.onDropIndexClick(props.index)}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
        );
    }

    // 配列object用追加ボタン
    // https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/core/src/components/AddButton.js
    // Latest commit d6f0964
    type addButtonProp = {
        className :string,
        onClick: (event?: any) => void,
        disabled : boolean,
    }
    export function AddButton({ className, onClick, disabled }: addButtonProp) {
        return (
            // <div className="row">
            <div className="row array-item-padding">
                <p className={`col-xs-3 col-xs-offset-9 text-right ${className}`}>
                    <IconButton
                        type="info"
                        icon="plus"
                        className="btn-add col-xs-12"
                        aria-label="Add"
                        tabIndex="0"
                        onClick={onClick}
                        disabled={disabled}
                    />
                </p>
            </div>
        );
    }
}
