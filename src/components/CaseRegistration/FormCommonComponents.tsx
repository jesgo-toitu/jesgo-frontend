/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import { TabSelectMessage } from '../../common/CommonUtility';
import SaveCommand, { responseResult } from '../../common/DBUtility';
import store from '../../store';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import PanelSchema from './PanelSchema';
import TabSchema from './TabSchema';

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
  setSelectedTabKey: React.Dispatch<React.SetStateAction<any>>
) =>
  // subschema表示
  filteredSchemaIds.map(
    (info: dispSchemaIdAndDocumentIdDefine, index: number) => {
      // TODO: サブタイトル追加は暫定対応。今後使用しない可能性あり
      const schemaInfo = GetSchemaInfo(info.schemaId);
      let title = schemaInfo?.title ?? '';
      if (schemaInfo?.subtitle) {
        title += ` ${schemaInfo.subtitle}`;
      }

      return (
        // TODO TabSchemaにTabを置くとうまく動作しなくなる
        <Tab
          key={`tab-${info.schemaId}`}
          className="panel-style"
          eventKey={subSchemaCount + index}
          title={<span>{title} </span>}
        >
          <TabSchema
            key={`tabitem-${info.schemaId}`}
            isChildSchema={isChildSchema}
            schemaId={info.schemaId}
            documentId={info.documentId}
            dispSchemaIds={[...schemaIds]}
            setDispSchemaIds={setSchemaIds}
            loadedData={loadedData}
            setIsLoading={setIsLoading}
            setSaveResponse={setSaveResponse}
            parentTabsId={parentTabsId}
            setSelectedTabKey={setSelectedTabKey}
            subSchemaCount={subSchemaCount}
            isSchemaChange={info.isSchemaChange}
          />
        </Tab>
      );
    }
  );

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
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>
) => {
  // 選択中のタブeventKey
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [selectedTabKey, setSelectedTabKey] = useState<any>();

  const dispatch = useDispatch();

  // タブ選択イベント
  const onTabSelectEvent = (eventKey: any) => {
    if (eventKey === selectedTabKey) return;

    // TODO：タブ移動での保存は一時的にオフ
    setSelectedTabKey(eventKey);
    return;

    // 保存しますかメッセージ
    // if (TabSelectMessage()) {
    if (true) {
      const formDatas = store.getState().formDataReducer.formDatas;
      const saveData = store.getState().formDataReducer.saveData;

      dispatch({
        type: 'SELECTED_CHILD_TAB',
        parentTabsId: `${id}-tabs`,
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

      setSelectedTabKey(eventKey);
    } else {
      // TODO: キャンセルの場合は留まる？
      // setSelectedTabKey(selectedTabKey);
      setSelectedTabKey(eventKey);
    }
  };

  // 子タブでの保存後の選択タブ復元処理
  useEffect(() => {
    // TODO: 親IDが被っているので一意になるような命名にしなければならない
    const tabIds = store.getState().formDataReducer.selectedChildTabIds;
    const tabId = tabIds.get(`${id}-tabs`);
    if (tabId) {
      setSelectedTabKey(tabId);
    }
  }, []);

  return (
    (subschemaIds.length > 0 || dispChildSchemaIds.length > 0) && (
      <Tabs
        id={`${id}-tabs`}
        activeKey={selectedTabKey} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        onSelect={(eventKey) => onTabSelectEvent(eventKey)}
      >
        {/* subschema表示 */}
        {createTab(
          `${id}-tabs`,
          subschemaIds,
          subschemaIdsNotDeleted,
          setSubschemaIds,
          false,
          loadedData,
          setIsLoading,
          setSaveResponse,
          0,
          setSelectedTabKey
        )}

        {/* childSchema表示 */}
        {createTab(
          `${id}-tabs`,
          dispChildSchemaIds,
          dispChildSchemaIdsNotDeleted,
          setDispChildSchemaIds,
          true,
          loadedData,
          setIsLoading,
          setSaveResponse,
          subschemaIdsNotDeleted.length,
          setSelectedTabKey
        )}
      </Tabs>
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
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>
) =>
  // subschema表示
  filteredSchemaIds.map((info: dispSchemaIdAndDocumentIdDefine) => (
    // TODO TabSchemaにTabを置くとうまく動作しなくなる
    <PanelSchema
      key={info.schemaId}
      isChildSchema={isChildSchema} // eslint-disable-line react/jsx-boolean-value
      schemaId={info.schemaId}
      documentId={info.documentId}
      dispSchemaIds={[...schemaIds]}
      setDispSchemaIds={setSchemaIds}
      loadedData={loadedData}
      setIsLoading={setIsLoading}
      setSaveResponse={setSaveResponse}
      isSchemaChange={info.isSchemaChange}
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
  setSaveResponse: React.Dispatch<React.SetStateAction<responseResult>>
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
        setSaveResponse
      )}
      {createPanel(
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        true,
        loadedData,
        setIsLoading,
        setSaveResponse
      )}
    </>
  );
