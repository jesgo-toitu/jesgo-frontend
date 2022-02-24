import React from "react";
import { Dropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import { GetRootSchema, GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { Schema } from "../../common/DevSchema"
import "./ControlButton.css"

export const COMP_TYPE = {
    ROOT: "root",
    ROOT_TAB: "rootTab",
    TAB: "tab",
    PANEL: "panel",
} as const;
type CompType = typeof COMP_TYPE[keyof typeof COMP_TYPE];

type ControlButtonProps<childSchemaIds = [], parentDispSchemaIds = []> = {
    schemaId: number,
    dispChildSchemaIds: number[],
    setDispChildSchemaIds: React.Dispatch<React.SetStateAction<number[]>>,
    childSchemaIds?: number[],
    Type: CompType,
    dispSchemaIds?: number[],   // 自身の階層のchild_Schema
    setDispSchemaIds?: React.Dispatch<React.SetStateAction<number[]>>,
}

// ルートドキュメント操作用コントロールボタン
export const ControlButton = React.memo((props:ControlButtonProps) => {
    const { Type, schemaId, childSchemaIds, dispChildSchemaIds, setDispChildSchemaIds, dispSchemaIds, setDispSchemaIds } = props;

    // ルートの場合ルートドキュメント それ以外はchild_schema
    const canAddSchemaIds = Type === COMP_TYPE.ROOT ? GetRootSchema() : childSchemaIds as number[];
    const canAddSchemas = [] as Schema[];
    const mySchemaInfo = GetSchemaInfo(schemaId) as Schema;
    canAddSchemaIds.map((id: number) => {
        // 追加済みのものは候補に出さない
        if (!dispChildSchemaIds.includes(id)) {
            const info = GetSchemaInfo(id) as Schema;
            canAddSchemas.push(info);
        }
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
                case "delete":
                    // 自身を削除
                    copyIds.splice(index, 1);
                    setDispSchemaIds!([...copyIds]);
                    break;
                case "clear":
                    // 自身のformData削除
                    // TODO 未実装
                    break;
            }
        } else if (typeof eventKey === "number") {
            // 子ドキュメントの追加
            const copyIds = [...dispChildSchemaIds];
            if (!copyIds.includes(eventKey)) {
                setDispChildSchemaIds([...copyIds, eventKey]);
            }
        }
    }

    const canMove = Type !== COMP_TYPE.ROOT && dispSchemaIds?.length !== undefined && dispSchemaIds?.length > 1;
    const canDelete = dispSchemaIds !== undefined && dispSchemaIds.includes(schemaId);
    const canAdd = canAddSchemas.length > 0;
    const canClear = (!canDelete && Type !== COMP_TYPE.ROOT);
    const horizontalMoveType: CompType[] = [COMP_TYPE.TAB, COMP_TYPE.ROOT_TAB];

    return (
        <div className="control-button-area">
            <Dropdown id={`dropdown- ${Type === COMP_TYPE.ROOT ? "root" : "child-" + schemaId}`} onSelect={selectMenuHandler} pullRight >
                <Dropdown.Toggle noCaret>
                    <Glyphicon glyph="th-list" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {/* 自身の移動 */}
                    {canMove && <MenuItem eventKey="up">{horizontalMoveType.includes(Type) ? "左" : "上"}に移動</MenuItem>}
                    {canMove && <MenuItem eventKey="down">{horizontalMoveType.includes(Type) ? "右" : "下"}に移動</MenuItem>}
                    {/* 自身の削除 */}
                    {canDelete && <MenuItem key="menu-delete" eventKey="delete">ドキュメントの削除</MenuItem> }
                    {canClear && <MenuItem key="menu-clear" eventKey="clear">編集内容の初期化</MenuItem>}
                    {((canMove || canDelete || canClear) && canAdd) && <MenuItem divider />}
                    {/* 子スキーマの追加 */}
                    {
                        canAddSchemas.map((info: Schema) => {
                            const { document_id, title } = info;
                            return <MenuItem key={document_id} eventKey={document_id}>{`${title} の追加`}</MenuItem>
                        })
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
})
