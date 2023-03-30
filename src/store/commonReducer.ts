/**
 * その他共通で扱うデータ
 */

import lodash from 'lodash';
import { Reducer } from 'redux';
import { jesgoPluginColumns } from '../common/Plugin';

export interface commonState {
  scrollTop?: number; // スクロール位置(Y軸)
  isHiddenSaveMassage?: boolean; // 保存確認ダイアログの表示有無
  isSaveAfterTabbing?: boolean; // タブ移動時の保存有無
  isShownSaveMessage?: boolean; // 保存確認ダイアログ表示中フラグ
  subSchemaCount?: number; // 自動生成されるサブスキーマの個数

  pluginList?: jesgoPluginColumns[];
}

export interface commonAction {
  type: string;
  scrollTop?: number;
  isHiddenSaveMassage?: boolean;
  isSaveAfterTabbing?: boolean;
  isShownSaveMessage?: boolean;

  pluginList?: jesgoPluginColumns[];
}

const createInitialState = (): commonState => ({
  scrollTop: 0,
  isHiddenSaveMassage: false,
  isSaveAfterTabbing: false,
  isShownSaveMessage: false,
  pluginList: undefined,
});

const initialState: commonState = createInitialState();

const commonReducer: Reducer<commonState, commonAction> = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: commonAction // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  const copyState = state;

  switch (action.type) {
    // スクロール位置保存
    case 'SCROLL_POSITION': {
      copyState.scrollTop = action.scrollTop;
      break;
    }

    case 'SAVE_MESSAGE_STATE': {
      // 保存確認ダイアログ表示有無
      if (action.isHiddenSaveMassage !== undefined) {
        copyState.isHiddenSaveMassage = action.isHiddenSaveMassage;
      }
      // タブ移動での保存許可
      if (action.isSaveAfterTabbing !== undefined) {
        copyState.isSaveAfterTabbing = action.isSaveAfterTabbing;
      }
      break;
    }

    // 保存ダイアログ表示中フラグの更新
    case 'SHOWN_SAVE_MESSAGE': {
      copyState.isShownSaveMessage = action.isShownSaveMessage;
      break;
    }

    // プラグイン一覧キャッシュ
    case 'PLUGIN_LIST': {
      copyState.pluginList = action.pluginList;
      break;
    }

    // 初期化
    case 'INIT_STORE': {
      // プラグイン一覧はここでは初期化しない
      return { ...createInitialState(), pluginList: copyState.pluginList };
    }
    default:
      break;
  }

  return copyState;
};

export default commonReducer;
