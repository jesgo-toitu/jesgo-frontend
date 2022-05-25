import React from 'react';
import { Dispatch } from 'redux';
import { Dropdown, Glyphicon, MenuItem, SelectCallback } from 'react-bootstrap';
import {
  GetAllSubSchemaIds,
  GetRootSchema,
  GetSchemaInfo,
} from '../../common/CaseRegistrationUtility';
import { JesgoDocumentSchema } from '../../store/schemaDataReducer';
import './ControlButton.css';
import { dispSchemaIdAndDocumentIdDefine } from '../../store/formDataReducer';
import store from '../../store/index';
import { ChildTabSelectedFuncObj } from './FormCommonComponents';

export const COMP_TYPE = {
  ROOT: 'root',
  ROOT_TAB: 'rootTab',
  TAB: 'tab',
  PANEL: 'panel',
} as const;
type CompType = typeof COMP_TYPE[keyof typeof COMP_TYPE];

// TODO defaultpropsが設定できない
type ControlButtonProps = {
  tabId: string;
  parentTabsId: string;
  Type: CompType;
  schemaId: number;
  dispChildSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  dispSubSchemaIds: dispSchemaIdAndDocumentIdDefine[];
  setDispChildSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >;
  childSchemaIds?: number[]; // eslint-disable-line react/require-default-props
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
  tabSelectEvents?: ChildTabSelectedFuncObj;
};

// ルートドキュメント操作用コントロールボタン
export const ControlButton = React.memo((props: ControlButtonProps) => {
  const {
    tabId,
    parentTabsId,
    Type,
    schemaId,
    childSchemaIds = [],
    dispChildSchemaIds,
    dispSubSchemaIds,
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
    tabSelectEvents,
  } = props;

  // 追加可能判定
  const canAddSchema = (
    tInfo: JesgoDocumentSchema | undefined,
    tSchemaId: number
  ) => {
    if (tInfo == null) return false;
    const isUnique = tInfo.document_schema['jesgo:unique'] ?? false;
    // uniqueではない、またはsubschemaとchildschemaに同じスキーマがない
    // TODO：schemaIdじゃなく$idで見ないといけない。継承スキーマの考慮も必要
    return (
      !isUnique ||
      (dispChildSchemaIds.find(
        (p) => p.schemaId === tSchemaId && p.deleted === false
      ) == null &&
        dispSubSchemaIds.find(
          (p) => p.schemaId === tSchemaId && p.deleted === false
        ) == null)
    );
  };
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
      const info: unknown = GetSchemaInfo(id);
      if (info != null) {
        if (canAddSchema(info as JesgoDocumentSchema, id)) {
          canAddSchemas.push(info as JesgoDocumentSchema);
        }
      }
    });
  }

  /// コントロールボタン メニュー選択イベントハンドラ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectMenuHandler: SelectCallback | undefined = (eventKey: any) => {
    if (typeof eventKey === 'string') {
      // 削除データは後ろになるよう並び替え
      const copyIds = dispSchemaIds.sort((first, second) => {
        if (!first.deleted && second.deleted) {
          return -1;
        }
        return 0;
      });

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
          }
          break;
        case 'delete': {
          // アラート表示用のタイトル
          let title = '';
          if (findItem) {
            const schemainfo = GetSchemaInfo(findItem.schemaId);
            if (schemainfo) {
              title = `${schemainfo.title}`;
              if (schemainfo.subtitle) {
                title += ` ${schemainfo.subtitle}`;
              }
            }
          }

          if (confirm(`[${title}]を削除します。よろしいですか？`)) {
            // 自身を削除
            if (setDispSchemaIds != null) {
              // TODO: 削除は削除フラグ立てる
              // copyIds.splice(index, 1);
              copyIds[index].deleted = true;
              setDispSchemaIds([...copyIds]);
              dispatch({ type: 'DEL', documentId });

              // 削除したタブの1つ前か後のタブを選択する
              const tabList = store
                .getState()
                .formDataReducer.allTabList.get(parentTabsId);
              if (tabList && tabList.length > 0 && setSelectedTabKey) {
                // 最後の1件だったタブを削除した場合は未選択とする
                if (tabList.length === 1) {
                  setSelectedTabKey(undefined);
                } else {
                  // 削除されたタブ名を取得
                  const deletedItemIdx = tabList.findIndex((p) =>
                    p.endsWith(copyIds[index].compId)
                  );

                  // 右端タブの場合は1つ前のタブ(削除後に右端になるタブ)を選択
                  if (deletedItemIdx === tabList.length - 1) {
                    setSelectedTabKey(tabList[deletedItemIdx - 1]);
                  } else {
                    // 右端のタブでなければ1つ後(右隣)のタブを選択
                    setSelectedTabKey(tabList[deletedItemIdx + 1]);
                  }
                }
              }
            }
          }
          break;
        }
        case 'clear':
          // 自身のformData削除
          if (setFormData) {
            // 空オブジェクトで更新
            setFormData({});
          }
          break;
        default:
          // 継承スキーマへの切り替え
          if (eventKey.startsWith('I') && setDispSchemaIds != null) {
            const inheritId = Number(eventKey.replace('I', ''));
            copyIds[index].schemaId = inheritId;
            copyIds[index].isSchemaChange = true;
            const allSubSchemaIds = GetAllSubSchemaIds(inheritId);
            // 作成予定のドキュメント数更新
            // 継承時は自身のドキュメントは既にあるため、サブスキーマの個数だけで良い
            dispatch({
              type: 'ADD_DOCUMENT_STATUS',
              maxDocumentCount: allSubSchemaIds.length,
              tabSelectEvent: tabSelectEvents?.fnSchemaChange,
              selectedTabKeyName: tabId,
            });

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
        canAddSchema(
          canAddSchemas.find(
            (p: JesgoDocumentSchema) => p.schema_id === eventKey
          ),
          eventKey
        )
      ) {
        const allSubSchemaIds = GetAllSubSchemaIds(eventKey);

        const tabIndex =
          dispSubSchemaIds.filter((p) => p.deleted === false).length +
          copyIds.filter((p) => p.deleted === false).length;

        dispatch({
          type: 'ADD_DOCUMENT_STATUS',
          maxDocumentCount: allSubSchemaIds.length + 1, // 自身のドキュメント分で+1
          tabSelectEvent: tabSelectEvents?.fnAddDocument,
          selectedTabKeyName: tabIndex.toString(), // 追加時はインデックスを渡す
        });

        const addItem: dispSchemaIdAndDocumentIdDefine = {
          documentId: '',
          schemaId: eventKey,
          deleted: false,
          compId: '',
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
          {canAddSchemas.map((info: JesgoDocumentSchema) => (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <MenuItem key={info.schema_id} eventKey={info.schema_id}>
              {`${info.title} ${info.subtitle} の追加`}
            </MenuItem>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
});
