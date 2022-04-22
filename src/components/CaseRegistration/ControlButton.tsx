import React from 'react';
import { Dispatch } from 'redux';
import { Dropdown, Glyphicon, MenuItem, SelectCallback } from 'react-bootstrap';
import {
  GetRootSchema,
  GetSchemaInfo,
} from '../../common/CaseRegistrationUtility';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import './ControlButton.css';
import { dispSchemaIdAndDocumentIdDefine } from '../../store/formDataReducer';

export const COMP_TYPE = {
  ROOT: 'root',
  ROOT_TAB: 'rootTab',
  TAB: 'tab',
  PANEL: 'panel',
} as const;
type CompType = typeof COMP_TYPE[keyof typeof COMP_TYPE];

// TODO defaultpropsが設定できない
type ControlButtonProps = {
  schemaId: number;
  dispChildSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispChildSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  childSchemaIds?: number[]; // eslint-disable-line react/require-default-props
  Type: CompType;
  dispSchemaIds?: dispSchemaIdAndDocumentIdDefine[]; // eslint-disable-line react/require-default-props
  setDispSchemaIds?: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >; // eslint-disable-line react/require-default-props
  dispatch: Dispatch;
  documentId: string;
  isChildSchema: boolean;
  setFormData?: React.Dispatch<React.SetStateAction<any>>;
  setSelectedTabKey?: React.Dispatch<React.SetStateAction<any>>;
};

// ルートドキュメント操作用コントロールボタン
export const ControlButton = React.memo((props: ControlButtonProps) => {
  const {
    Type,
    schemaId,
    childSchemaIds = [],
    dispChildSchemaIds,
    setDispChildSchemaIds,
    dispSchemaIds = [],
    setDispSchemaIds = null,
    dispatch,
    documentId,
    isChildSchema,
    setFormData,
    setSelectedTabKey,
  } = props;

  // ルートの場合ルートドキュメント それ以外はchild_schema
  const canAddSchemaIds =
    Type === COMP_TYPE.ROOT ? GetRootSchema() : childSchemaIds;
  const canAddSchemas = [] as JesgoDocumentSchema[];
  if (canAddSchemaIds != null && canAddSchemaIds.length > 0) {
    canAddSchemaIds.forEach((id: number) => {
      // TODO: 追加済みのものは出さないとしているが、同一スキーマの作成は今後ある
      // 追加済みのものは候補に出さない
      if (
        !dispChildSchemaIds.find(
          (p) => p.schemaId === id && p.deleted === false
        )
      ) {
        const info: unknown = GetSchemaInfo(id);
        if (info != null) {
          canAddSchemas.push(info as JesgoDocumentSchema);
        }
      }
    });
  }

  /// コントロールボタン メニュー選択イベントハンドラ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectMenuHandler: SelectCallback | undefined = (eventKey: any) => {
    if (typeof eventKey === 'string') {
      const copyIds = dispSchemaIds;
      const index = copyIds.findIndex((p) => p.documentId === documentId);
      const findItem = copyIds.find((p) => p.documentId === documentId);
      switch (eventKey) {
        case 'up':
          // 上（左）へ移動
          // 自分が先頭の場合は何もしない
          if (index > 0 && setDispSchemaIds != null) {
            const newIndex = index - 1;
            copyIds.splice(index, 1);
            copyIds.splice(
              newIndex,
              0,
              findItem as dispSchemaIdAndDocumentIdDefine
            );
            setDispSchemaIds([...copyIds]);
            if (setSelectedTabKey) {
              setSelectedTabKey(newIndex);
            }
          }
          break;

        case 'down':
          // 下（右）へ移動
          // 自分が末尾の場合は何もしない
          if (index < copyIds.length - 1 && setDispSchemaIds != null) {
            const newIndex = index + 1;
            copyIds.splice(index, 1);
            copyIds.splice(
              newIndex,
              0,
              findItem as dispSchemaIdAndDocumentIdDefine
            );
            setDispSchemaIds([...copyIds]);
            if (setSelectedTabKey) {
              setSelectedTabKey(newIndex);
            }
          }
          break;
        case 'delete':
          // 自身を削除
          if (setDispSchemaIds != null) {
            // TODO: 削除は削除フラグ立てる
            // copyIds.splice(index, 1);
            copyIds[index].deleted = true;
            setDispSchemaIds([...copyIds]);
            dispatch({ type: 'DEL', documentId });
          }
          break;
        case 'clear':
          // 自身のformData削除
          if (setFormData) {
            // 空オブジェクトで更新
            setFormData({});
          }
          break;
        default:
          break;
      }
    } else if (typeof eventKey === 'number') {
      // 子ドキュメントの追加
      const copyIds = [...dispChildSchemaIds];
      if (
        !copyIds.find((p) => p.schemaId === eventKey && p.deleted === false)
      ) {
        const addItem: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: eventKey,
          deleted: false,
        };
        setDispChildSchemaIds([...copyIds, addItem]);
      }
    }
  };

  // 移動可否
  const canMove =
    Type !== COMP_TYPE.ROOT &&
    isChildSchema &&
    dispSchemaIds?.length !== undefined &&
    dispSchemaIds?.length > 1;
  // 削除可否
  // サブスキーマ以外なら削除可能
  const canDelete =
    isChildSchema &&
    dispSchemaIds !== undefined &&
    dispSchemaIds.find((p) => p.schemaId === schemaId);
  const canAdd = canAddSchemas.length > 0;
  const canClear = !canDelete && Type !== COMP_TYPE.ROOT;
  const horizontalMoveType: CompType[] = [COMP_TYPE.TAB, COMP_TYPE.ROOT_TAB];

  return (
    <div className="control-button-area">
      <Dropdown
        id={`dropdown- ${
          Type === COMP_TYPE.ROOT ? 'root' : `child-${schemaId}`
        }`}
        onSelect={selectMenuHandler}
        pullRight
      >
        <Dropdown.Toggle noCaret>
          <Glyphicon glyph="th-list" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {/* 自身の移動 */}
          {canMove && (
            <MenuItem eventKey="up">
              {horizontalMoveType.includes(Type) ? '左' : '上'}に移動
            </MenuItem>
          )}
          {canMove && (
            <MenuItem eventKey="down">
              {horizontalMoveType.includes(Type) ? '右' : '下'}に移動
            </MenuItem>
          )}
          {/* 自身の削除 */}
          {canDelete && (
            <MenuItem key="menu-delete" eventKey="delete">
              ドキュメントの削除
            </MenuItem>
          )}
          {canClear && (
            <MenuItem key="menu-clear" eventKey="clear">
              編集内容の初期化
            </MenuItem>
          )}
          {(canMove || canDelete || canClear) && canAdd && <MenuItem divider />}
          {/* 子スキーマの追加 */}
          {canAddSchemas.map((info: JesgoDocumentSchema) => {
            return (
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              <MenuItem key={info.schema_id} eventKey={info.schema_id}>
                {`${info.title} ${info.subtitle} の追加`}
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
});
