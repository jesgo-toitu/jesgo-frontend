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
import store from '../../store/index';

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
  // eslint-disable-next-line react/require-default-props
  setDispSchemaIds?: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  dispatch: Dispatch;
  documentId: string;
  isChildSchema: boolean;
  // eslint-disable-next-line react/require-default-props
  setFormData?: React.Dispatch<React.SetStateAction<any>>;
  // eslint-disable-next-line
  formData?: any;
  setSelectedTabKey?: React.Dispatch<React.SetStateAction<any>>;
  subSchemaCount: number;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    formData,
    setSelectedTabKey,
    subSchemaCount,
  } = props;

  // 基底スキーマを取得
  const baseSchemaId = GetSchemaInfo(schemaId)?.base_schema;
  const baseSchema = baseSchemaId ? GetSchemaInfo(baseSchemaId) : undefined;
  const baseSchemaName = baseSchema
    ? `${baseSchema.title} ${baseSchema.subtitle}`
    : '';
  // 継承スキーマを取得
  const inheritIds = baseSchemaId
    ? GetSchemaInfo(baseSchemaId)?.inherit_schema
    : GetSchemaInfo(schemaId)?.inherit_schema;

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
            // TODO: 今はindexだが、ユニークなキーに変わるならここも変える必要あり
            setDispSchemaIds([...copyIds]);
            if (setSelectedTabKey) {
              setSelectedTabKey(subSchemaCount + newIndex);
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
            // TODO: 今はindexだが、ユニークなキーに変わるならここも変える必要あり
            setDispSchemaIds([...copyIds]);
            if (setSelectedTabKey) {
              setSelectedTabKey(subSchemaCount + newIndex);
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
          // 拡張用
          if (eventKey.startsWith('I') && setDispSchemaIds != null) {
            const inheritId = Number(eventKey.replace('I', ''));
            copyIds[index].schemaId = inheritId;
            copyIds[index].isSchemaChange = true;
            if (formData) {
              dispatch({
                type: 'INPUT',
                isInherit: true,
                schemaId: inheritId,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                formData: {},
                documentId: copyIds[index].documentId,
              });
            }
            setDispSchemaIds([...copyIds]);
          }
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
          {/* 継承スキーマ関連の追加 */}
          {baseSchemaId && (
            <MenuItem key={baseSchemaId} eventKey={`I${baseSchemaId}`}>
              {`${baseSchemaName} への回帰`}
            </MenuItem>
          )}
          {inheritIds &&
            inheritIds.length > 0 &&
            // eslint-disable-next-line
            inheritIds.map((num: number) => {
              // 自分以外のスキーマIDのみ追加
              if (schemaId !== num) {
                const schema = GetSchemaInfo(num);
                if (schema !== undefined) {
                  const schemaName = `${schema.title} ${schema.subtitle}`;
                  return (
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    <MenuItem key={num} eventKey={`I${num}`}>
                      {`${schemaName} への継承`}
                    </MenuItem>
                  );
                }
              }
            })}
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
