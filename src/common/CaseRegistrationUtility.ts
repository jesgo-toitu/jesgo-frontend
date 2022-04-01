import {
  ReadSchema,
  JesgoDocumentSchema,
} from '../temp/ReadSchema';

// スキーマIDからスキーマ情報を取得
// TODO 仮関数。実際はAPIで取得。
export function GetSchemaInfo(id: number) {
  const schemaInfos = ReadSchema();
  const result: JesgoDocumentSchema | undefined = schemaInfos.find(
    (info) => id === info.documentId
  );
  return result;
}

// ルートスキーマのschema_idを取得
// TODO 仮関数。実際はAPIで取得。
export const GetRootSchema = () => {
  const result: number[] = [];
  const schemaInfos = ReadSchema();
  schemaInfos.forEach((info: JesgoDocumentSchema) => {
    const schema = info.documentSchema;
    // schemaの"jesgo:parentschema"に"/"があればルートスキーマ
    const parent = schema['jesgo:parentschema'];
    if (parent !== undefined && parent.includes('/')) {
      result.push(info.documentId);
    }
  });

  return result;
};
