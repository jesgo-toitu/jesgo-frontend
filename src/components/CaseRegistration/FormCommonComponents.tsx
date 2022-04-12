import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { GetSchemaInfo } from '../../common/CaseRegistrationUtility';
import {
  dispSchemaIdAndDocumentIdDefine,
  SaveDataObjDefine,
} from '../../store/formDataReducer';
import { JESGOComp } from './JESGOComponent';
import PanelSchema from './PanelSchema';
import { getRootDescription } from './SchemaUtility';
import TabSchema from './TabSchema';

export const createTab = (
  schemaIds: dispSchemaIdAndDocumentIdDefine[],
  filteredSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  setSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,
  isChildSchema: boolean,
  loadedData: SaveDataObjDefine | undefined
) =>
  // subschema表示
  filteredSchemaIds.map((info: dispSchemaIdAndDocumentIdDefine) => {
    // TODO 仮。本来はAPI
    const title = GetSchemaInfo(info.schemaId)?.title ?? '';
    const description =
      getRootDescription(GetSchemaInfo(info.schemaId)?.documentSchema) ?? '';

    return (
      // TODO TabSchemaにTabを置くとうまく動作しなくなる
      <Tab
        key={`tab-${info.schemaId}`}
        className="panel-style"
        eventKey={info.schemaId}
        title={
          <>
            <span>{title} </span>
            <JESGOComp.DescriptionToolTip descriptionText={description} />
          </>
        }
      >
        <TabSchema
          key={`tabitem-${info.schemaId}`}
          isChildSchema={isChildSchema}
          schemaId={info.schemaId}
          documentId={info.documentId}
          dispSchemaIds={[...schemaIds]}
          setDispSchemaIds={setSchemaIds}
          loadedData={loadedData}
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

  loadedData: SaveDataObjDefine | undefined
) =>
  (subschemaIds.length > 0 || dispChildSchemaIds.length > 0) && (
    <Tabs id={`${id}-tabs`}>
      {/* subschema表示 */}
      {createTab(
        subschemaIds,
        subschemaIdsNotDeleted,
        setSubschemaIds,
        false,
        loadedData
      )}

      {/* childSchema表示 */}
      {createTab(
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        true,
        loadedData
      )}
    </Tabs>
  );

// パネル作成
export const createPanel = (
  schemaIds: dispSchemaIdAndDocumentIdDefine[],
  filteredSchemaIds: dispSchemaIdAndDocumentIdDefine[],
  setSchemaIds: React.Dispatch<
    React.SetStateAction<dispSchemaIdAndDocumentIdDefine[]>
  >,
  isChildSchema: boolean,
  loadedData: SaveDataObjDefine | undefined
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

  loadedData: SaveDataObjDefine | undefined
) =>
  (subschemaIdsNotDeleted.length > 0 ||
    dispChildSchemaIdsNotDeleted.length > 0) && (
    <>
      {createPanel(
        subschemaIds,
        subschemaIdsNotDeleted,
        setSubschemaIds,
        false,
        loadedData
      )}
      {createPanel(
        dispChildSchemaIds,
        dispChildSchemaIdsNotDeleted,
        setDispChildSchemaIds,
        true,
        loadedData
      )}
    </>
  );
