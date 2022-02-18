import React from "react";
import { Dropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import { GetRootSchema, GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { Schema } from "../../common/DevSchema"
import "./ControlButton.css"

export const COMP_TYPE = {
    ROOT: "root",
    ROOT_PANEL: "rootPanel",
    TAB: "tab",
    PANEL: "panel",
} as const;
type CompType = typeof COMP_TYPE[keyof typeof COMP_TYPE];

type ControlButtonProps<childSchemaIds = [], parentDispSchemaIds = []> = {
    schemaId: number,
    dispSubSchemaIds: number[],
    setDispSubSchemaIds: React.Dispatch<React.SetStateAction<number[]>>,
    childSchemaIds?: number[],
    Type: CompType,
    dispSchemaIds?: number[],
    setDispSchemaIds?: React.Dispatch<React.SetStateAction<number[]>>,
}

// ルートドキュメント操作用コントロールボタン
export const ControlButton = React.memo((props:ControlButtonProps) => {
    const { Type, schemaId, childSchemaIds, dispSubSchemaIds, setDispSubSchemaIds, dispSchemaIds, setDispSchemaIds } = props;

    // ルートの場合ルートドキュメント それ以外はchild_schema
    const canAddSchemaIds = Type === COMP_TYPE.ROOT ? GetRootSchema() : childSchemaIds as number[];
    const canAddSchemas = [] as Schema[];
    canAddSchemaIds.map((id: number) => {
        const info = GetSchemaInfo(id) as Schema;
        canAddSchemas.push(info);
    })

    /// コントロールボタン メニュー選択イベントハンドラ
    const selectMenuHandler = (eventKey: any) => {
        console.log(eventKey);
        if (typeof eventKey === "string") {
            const copyIds = [...dispSchemaIds as number[]];
            const index = copyIds.indexOf(props.schemaId as number);
            switch (eventKey as string) {
                case "up":
                // 上（左）へ移動
                // 自分が先頭の場合は何もしない
                    if (0 < index) {
                        copyIds.splice(index, 1);
                        copyIds.splice(index - 1, 0, props.schemaId as number);
                        setDispSchemaIds!([...copyIds]);
                    }
                    break;

                case "down":
                // 下（右）へ移動
                // 自分が末尾の場合は何もしない
                    if (index < copyIds.length - 1) {
                        copyIds.splice(index, 1);
                        copyIds.splice(index + 1, 0, props.schemaId as number);
                        setDispSchemaIds!([...copyIds]);
                    }
                    break;
            }
        } else if (typeof eventKey === "number") {
            // 子ドキュメントの追加・削除
            const copyIds = [...dispSubSchemaIds];
            if (copyIds.includes(eventKey)) {
                copyIds.splice(copyIds.indexOf(eventKey), 1);
                setDispSubSchemaIds([...copyIds]);
            } else {
                setDispSubSchemaIds([...copyIds, eventKey]);
            }
        }
    }
    // TODO 条件が不完全。表示スキーマではなく、child_schema（移動が可能なスキーマ）が複数件あった場合のみ移動可とする。
    const canMove = Type !== COMP_TYPE.ROOT && dispSchemaIds?.length !== undefined && dispSchemaIds?.length > 1;
    const canAdd = canAddSchemas.length > 0;

    return (
        <div className="control-button-area">
            <Dropdown id={`dropdown- ${Type === COMP_TYPE.ROOT ? "root" : "child-" + schemaId}`} onSelect={selectMenuHandler} pullRight >
                <Dropdown.Toggle noCaret>
                    <Glyphicon glyph="th-list" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {/* 自身の移動 */}
                    {canMove && <MenuItem eventKey="up">{Type === COMP_TYPE.TAB ? "左" : "上"}に移動</MenuItem>}
                    {canMove && <MenuItem eventKey="down">{Type === COMP_TYPE.TAB ? "右" : "下"}に移動</MenuItem>}
                    {(canMove && canAdd) && <MenuItem divider />}
                    {/* 子スキーマの追加・削除 */}
                    {
                        canAddSchemas.map((info: Schema) => {
                            const { document_id, title } = info;
                            const label = `${title} の${dispSubSchemaIds.includes(document_id) ? "削除" : "追加"}`
                            return <MenuItem key={document_id} eventKey={document_id}>{label}</MenuItem>
                        })
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
})
