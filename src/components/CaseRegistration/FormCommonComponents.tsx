/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  convertTabKey,
  GetSchemaInfo,
} from '../../common/CaseRegistrationUtility';
import SaveCommand, { responseResult } from '../../common/DBUtility';
import store from '../../store';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { ShowSaveDialogState } from '../../views/Registration';
import PanelSchema from './PanelSchema';
import SaveConfirmDialog from './SaveConfirmDialog';
import TabSchema from './TabSchema';

export interface ChildTabSelectedFuncObj {
  fnAddDocument: ((isTabSelected: boolean, eventKey: any) => void) | undefined;
  fnSchemaChange: ((isTabSelected: boolean, eventKey: any) => void) | undefined;
}

export const createTab = (
  parentTabsId: string,
  schemaIds: dispSchemaIdAndDocumentIdDefine[],
  filteredSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  setSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,
  isChildSchema: boolean,
  loadedData: SaveDataObjDefine | undefined,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  subSchemaCount: number,
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>,
  selectedTabKey: any,
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void
) =>
  // subschema表示
  filteredSchemaIds.map((info: dispSchemaIdAndDocumentIdDefine) => {
    // TODO: サブタイトル追加は暫定対応。今後使用しない可能性あり
    const schemaInfo = GetSchemaInfo(info.schemaId);
    let title = schemaInfo?.title ?? '';
    if (schemaInfo?.subtitle) {
      title += ` ${schemaInfo.subtitle}`;
    }

    return (
      // TODO TabSchemaにTabを置くとうまく動作しなくなる
      <Tab
        key={`tab-${info.compId}`}
        className="panel-style"
        eventKey={`${parentTabsId}-tab-${info.compId}`}
        title={<span>{title}</span>}
      >
        <TabSchema
          key={`tabitem-${info.compId}`}
          tabId={`${parentTabsId}-tab-${info.compId}`}
          parentTabsId={parentTabsId}
          isChildSchema={isChildSchema}
          schemaId={info.schemaId}
          documentId={info.documentId}
          dispSchemaIds={[...schemaIds]}
          setDispSchemaIds={setSchemaIds}
          loadedData={loadedData}
          setIsLoading={setIsLoading}
          setSaveResponse={setSaveResponse}
          setSelectedTabKey={setSelectedTabKey}
          subSchemaCount={subSchemaCount}
          isSchemaChange={info.isSchemaChange}
          selectedTabKey={selectedTabKey}
          schemaAddModFunc={schemaAddModFunc}
        />
      </Tab>
    );
  });

export const createTabs = (
  id: string,
  subschemaIds: dispSchemaIdAndDocumentIdDefine[],
  subschemaIdsNotDeleted: dispSchemaIdAndDocumentIdDefine[],
  setSubschemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,

  dispChildSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  dispChildSchemaIdsNotDeleted: dispSchemaIdAndDocumentIdDefine[],
  setDispChildSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,
  loadedData: SaveDataObjDefine | undefined,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  childTabSelectedFunc: ChildTabSelectedFuncObj,
  setChildTabSelectedFunc:
    | React.Dispatch<React.SetStateAction<ChildTabSelectedFuncObj>>
    | undefined
) => {
  // 選択中のタブeventKey
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [selectedTabKey, setSelectedTabKey] = useState<any>();

  const dispatch = useDispatch();

  const saveFunction = (eventKey: any) => {
    const formDatas = store.getState().formDataReducer.formDatas;
    const saveData = store.getState().formDataReducer.saveData;

    // スクロール位置保存
    dispatch({
      type: 'SCROLL_POSITION',
      scrollTop: document.scrollingElement
        ? document.scrollingElement.scrollTop
        : undefined,
    });

    dispatch({
      type: 'SELECTED_TAB',
      parentTabsId: id,
      selectedChildTabId: eventKey as string,
    });

    // 保存処理
    SaveCommand(
      formDatas,
      saveData,
      dispatch,
      setIsLoading,
      setSaveResponse,
      false
    );

    // インデックスからタブ名に変換
    const convTabKey = convertTabKey(id, eventKey);

    setSelectedTabKey(convTabKey);
  };

  const [showSaveDialog, setShowSaveDialog] = useState<ShowSaveDialogState>({
    showFlg: false,
    eventKey: undefined,
  });

  // 保存確認ダイアログ はい選択
  const saveDialogOk = (eventKey: any) => {
    // const eventKey = showSaveDialog.eventKey;

    setShowSaveDialog({ showFlg: false, eventKey });

    dispatch({ type: 'SAVE_MESSAGE_STATE', isSaveAfterTabbing: true });
    dispatch({ type: 'SHOWN_SAVE_MESSAGE', isShownSaveMessage: false });

    saveFunction(eventKey);
  };

  // 保存確認ダイアログ いいえ選択
  const saveDialogCancel = (eventKey: any) => {
    dispatch({ type: 'SAVE_MESSAGE_STATE', isSaveAfterTabbing: false });
    dispatch({ type: 'SHOWN_SAVE_MESSAGE', isShownSaveMessage: false });

    setShowSaveDialog({ showFlg: false, eventKey });

    // インデックスからタブ名に変換
    const convTabKey = convertTabKey(id, eventKey);

    setSelectedTabKey(convTabKey);
  };

  // タブ選択イベント
  const onTabSelectEvent = (isTabSelected: boolean, eventKey: any) => {
    if (isTabSelected && eventKey === selectedTabKey) return;

    const commonReducer = store.getState().commonReducer;
    const isHiddenSaveMessage = commonReducer.isHiddenSaveMassage;
    if (!isHiddenSaveMessage) {
      // 確認ダイアログの表示
      if (!commonReducer.isShownSaveMessage) {
        dispatch({ type: 'SHOWN_SAVE_MESSAGE', isShownSaveMessage: true });
        setShowSaveDialog({ showFlg: true, eventKey });
      }
    } else if (commonReducer.isSaveAfterTabbing) {
      // 確認ダイアログを表示しない＆保存する場合は保存処理だけする
      saveFunction(eventKey);
    } else {
      // 確認ダイアログを表示しない＆保存しない場合はタブ移動だけする
      // インデックスからタブ名に変換
      const convTabKey = convertTabKey(id, eventKey);
      setSelectedTabKey(convTabKey);
    }
  };

  // 子タブでの保存後の選択タブ復元処理
  useEffect(() => {
    // TODO: 親IDが被っているので一意になるような命名にしなければならない

    const allTabIds: string[] = [];
    subschemaIdsNotDeleted.forEach((info) =>
      allTabIds.push(`${id}-tab-${info.compId}`)
    );
    dispChildSchemaIdsNotDeleted.forEach((info) =>
      allTabIds.push(`${id}-tab-${info.compId}`)
    );

    const tabIds = store.getState().formDataReducer.selectedTabIds;
    const tabId = tabIds.get(id);
    let targetTabId = tabId;
    if (tabId) {
      // 数値の場合はドキュメント追加時なので正しいタブ名に変換する
      if (!isNaN(Number(tabId))) {
        const tabIndex = parseInt(tabId, 10);
        if (allTabIds.length > tabIndex) {
          const convTabKey = allTabIds[tabIndex];
          targetTabId = convTabKey;
        }
      } else if (allTabIds.length > 0 && !allTabIds.find((p) => p === tabId)) {
        // 保存してタブ名変わった場合は最初のドキュメント選択
        targetTabId = allTabIds[0];
      }
    } else if (allTabIds.length > 0) {
      // 初回表示時
      targetTabId = allTabIds[0];
    }

    setSelectedTabKey(targetTabId);

    // 親で子のタブ選択イベントを使いたいため、親に渡す
    if (setChildTabSelectedFunc) {
      setChildTabSelectedFunc({
        fnAddDocument: onTabSelectEvent,
        fnSchemaChange: childTabSelectedFunc.fnSchemaChange,
      });
    }

    dispatch({
      type: 'TAB_LIST',
      parentTabsId: id,
      tabList: allTabIds,
    });
  }, [subschemaIdsNotDeleted, dispChildSchemaIdsNotDeleted]);

  // 選択されているタブをstoreに保存
  useEffect(() => {
    dispatch({
      type: 'SELECTED_TAB',
      parentTabsId: id,
      selectedChildTabId: selectedTabKey as string,
    });
  }, [selectedTabKey]);

  return (
    (subschemaIds.length > 0 || dispChildSchemaIds.length > 0) && (
      <>
        <Tabs
          id={`${id}-tabs`}
          activeKey={selectedTabKey} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          onSelect={(eventKey) => onTabSelectEvent(true, eventKey)}
        >
          {/* subschema表示 */}
          {createTab(
            id,
            subschemaIds,
            subschemaIdsNotDeleted,
            setSubschemaIds,
            false,
            loadedData,
            setIsLoading,
            setSaveResponse,
            0,
            setSelectedTabKey,
            selectedTabKey,
            onTabSelectEvent
          )}

          {/* childSchema表示 */}
          {createTab(
            id,
            dispChildSchemaIds,
            dispChildSchemaIdsNotDeleted,
            setDispChildSchemaIds,
            true,
            loadedData,
            setIsLoading,
            setSaveResponse,
            subschemaIdsNotDeleted.length,
            setSelectedTabKey,
            selectedTabKey,
            onTabSelectEvent
          )}
        </Tabs>
        <SaveConfirmDialog
          show={showSaveDialog}
          onOk={() => saveDialogOk(showSaveDialog.eventKey)}
          onCancel={() => saveDialogCancel(showSaveDialog.eventKey)}
          title="JESGO"
          message="保存します。よろしいですか？"
        />
      </>
    )
  );
};

// パネル作成
export const createPanel = (
  schemaIds: dispSchemaIdAndDocumentIdDefine[],
  filteredSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  setSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,
  isChildSchema: boolean,
  loadedData: SaveDataObjDefine | undefined,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  selectedTabKey: any,
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void,
  parentTabsId: string
) =>
  // subschema表示
  filteredSchemaIds.map((info: dispSchemaIdAndDocumentIdDefine) => (
    // TODO TabSchemaにTabを置くとうまく動作しなくなる
    <PanelSchema
      key={`panel-${info.compId}`}
      parentTabsId={parentTabsId}
      isChildSchema={isChildSchema} // eslint-disable-line react/jsx-boolean-value
      schemaId={info.schemaId}
      documentId={info.documentId}
      dispSchemaIds={[...schemaIds]}
      setDispSchemaIds={setSchemaIds}
      loadedData={loadedData}
      setIsLoading={setIsLoading}
      setSaveResponse={setSaveResponse}
      isSchemaChange={info.isSchemaChange}
      selectedTabKey={selectedTabKey}
      schemaAddModFunc={schemaAddModFunc}
    />
  ));

// パネル作成
export const createPanels = (
  subschemaIds: dispSchemaIdAndDocumentIdDefine[],
  subschemaIdsNotDeleted: dispSchemaIdAndDocumentIdDefine[],
  setSubschemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,

  dispChildSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  dispChildSchemaIdsNotDeleted: dispSchemaIdAndDocumentIdDefine[],
  setDispChildSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,

  loadedData: SaveDataObjDefine | undefined,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>,
  selectedTabKey: any,
  schemaAddModFunc: (isTabSelected: boolean, eventKey: any) => void,
  parentTabsId: string
) =>
  (subschemaIdsNotDeleted.length > 0 ||
    dispChildSchemaIdsNotDeleted.length > 0) && (
    <>
      {createPanel(
        subschemaIds,
        subschemaIdsNotDeleted,
        setSubschemaIds,
        false,
        loadedData,
        setIsLoading,
        setSaveResponse,
        selectedTabKey,
        schemaAddModFunc,
        parentTabsId
      )}
      {createPanel(
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        true,
        loadedData,
        setIsLoading,
        setSaveResponse,
        selectedTabKey,
        schemaAddModFunc,
        parentTabsId
      )}
    </>
  );
