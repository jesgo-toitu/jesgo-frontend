import store from '../store';

// スキーマIDからスキーマ情報を取得
export const GetSchemaInfo = (id: number) => {
  const schemaInfos = store.getState().schemaDataReducer.schemaDatas;
  return schemaInfos.get(id);
};

// ルートスキーマのschema_idを取得
export const GetRootSchema = () => {
  const roots = store.getState().schemaDataReducer.rootSchemas;
  return roots;
};

// 指定スキーマのサブスキーマIDを孫スキーマ含めすべて取得
export const GetAllSubSchemaIds = (id: number) => {
  const schemaIds: number[] = [];

  const schemaInfos = store.getState().schemaDataReducer.schemaDatas;
  const schemaInfo = schemaInfos.get(id);
  if (schemaInfo && schemaInfo.subschema.length > 0) {
    schemaIds.push(...schemaInfo.subschema);

    schemaInfo.subschema.forEach((schemaId) => {
      schemaIds.push(...GetAllSubSchemaIds(schemaId)); // 再帰
    });
  }

  return schemaIds;
};

// タブ並び順のインデックスをタブ名に変換
export const convertTabKey = (parentTabKey: string, tabKey: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let convTabKey = tabKey;
  // インデックスからタブ名に変換
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(Number(tabKey))) {
    const allTabList = store.getState().formDataReducer.allTabList;
    const tabList = allTabList.get(parentTabKey);

    const tabIndex = parseInt(tabKey as string, 10);
    if (tabList && tabList.length > tabIndex) {
      convTabKey = tabList[tabIndex];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return convTabKey;
};
