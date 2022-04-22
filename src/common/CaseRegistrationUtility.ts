import store from '../store';

// スキーマIDからスキーマ情報を取得
export function GetSchemaInfo(id: number) {
  const schemaInfos = store.getState().schemaDataReducer.schemaDatas;
  return schemaInfos.get(id);
}

// ルートスキーマのschema_idを取得
export const GetRootSchema = () => {
  const roots = store.getState().schemaDataReducer.rootSchemas;
  return roots;
};
