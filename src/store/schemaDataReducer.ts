import lodash from 'lodash';
import { Reducer } from 'redux';
import { JSONSchema7 } from 'json-schema';

// 症例情報の定義
export type JesgoDocumentSchema = {
  schema_id: number;
  schema_id_string: string;
  title: string;
  subtitle: string;
  document_schema: JSONSchema7;
  subschema: number[];
  child_schema: number[];
  version_major: number;
};

export interface schemaDataState {
  schemaDatas: Map<number, JesgoDocumentSchema>;
  rootSchemas: number[];
}

const initialState: schemaDataState = {
  schemaDatas: new Map(),
  rootSchemas: [],
};

// スキーマデータ用Action
export interface schemaDataAction {
  type: string;
  schemaDatas: JesgoDocumentSchema[];
  rootSchemas: number[];
}

const schemaDataReducer: Reducer<schemaDataState, schemaDataAction> = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: schemaDataAction
) => {
  const copyState = lodash.cloneDeep(state); // 現在の状態をコピー
  switch (action.type) {
    case 'SCHEMA':
      // eslint-disable-next-line array-callback-return
      action.schemaDatas.map((schema: JesgoDocumentSchema) => {
        // nullが入っている場合空配列に置換する。
        if (schema.subschema === null) {
          // eslint-disable-next-line no-param-reassign
          schema.subschema = [];
        }
        if (schema.child_schema === null) {
          // eslint-disable-next-line no-param-reassign
          schema.child_schema = [];
        }
        copyState.schemaDatas.set(schema.schema_id, schema);
      });

      break;
    case 'ROOT':
      copyState.rootSchemas = action.rootSchemas;

      break;

    default:
  }
  return copyState;
};

export default schemaDataReducer;
