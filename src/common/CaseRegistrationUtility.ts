import { JSONSchema7 } from "json-schema";
import { ReadSchema,Jesgo_document_schema } from '../temp/ReadSchema';

// スキーマIDからスキーマ情報を取得
// TODO 仮関数。実際はAPIで取得。
export function GetSchemaInfo(id: number) {
    const schemaInfos =  ReadSchema();
    const result: Jesgo_document_schema | undefined = schemaInfos.find(info => { return id === info.document_id });
    return result;
}

// ルートスキーマのschema_idを取得
// TODO 仮関数。実際はAPIで取得。
export const GetRootSchema = () => {
    let result: number[] = [];
    const schemaInfos =  ReadSchema();
    schemaInfos.map((info: Jesgo_document_schema) =>{
        const schema = info.document_schema as JSONSchema7;
        // schemaの"jesgo:parentschema"に"/"があればルートスキーマ
        const parent = schema['jesgo:parentschema']
        if(parent !== undefined && parent.includes("/")){
            result.push(info.document_id);
        }
    })
    
    return result;
}
