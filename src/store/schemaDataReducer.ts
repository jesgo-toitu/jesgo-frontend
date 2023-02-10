import lodash from 'lodash';
import { Reducer } from 'redux';
import { JSONSchema7 } from 'json-schema';
import { JesgoDocumentSchema } from '../@types/store';

export interface schemaDataState {
  schemaDatas: Map<number, JesgoDocumentSchema[]>;
  rootSchemas: number[];
  blackList: number[];
  inheritSchemaIds: Map<number, number[]>;
}

const initialState: schemaDataState = {
  schemaDatas: new Map(),
  rootSchemas: [],
  blackList: [],
  inheritSchemaIds: new Map(),
};

// スキーマデータ用Action
export interface schemaDataAction {
  type: string;
  schemaDatas: JesgoDocumentSchema[];
  rootSchemas: number[];
  blackList: number[];
}

const schemaDataReducer: Reducer<schemaDataState, schemaDataAction> = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: schemaDataAction
) => {
  const copyState = state;
  switch (action.type) {
    case 'SCHEMA':
      // 一旦配列をクリアする
      copyState.schemaDatas.clear();

      // eslint-disable-next-line array-callback-return
      action.schemaDatas.map((schema: JesgoDocumentSchema) => {
        // nullが入っている場合空配列に置換する。
        if (schema.subschema === null) {
          // eslint-disable-next-line no-param-reassign
          schema.subschema = [];
        }
        if (schema.subschema_default === null) {
          // eslint-disable-next-line no-param-reassign
          schema.subschema_default = [];
        }
        if (schema.child_schema === null) {
          // eslint-disable-next-line no-param-reassign
          schema.child_schema = [];
        }
        if (schema.child_schema_default === null) {
          // eslint-disable-next-line no-param-reassign
          schema.child_schema_default = [];
        }
        const tempSchemas = copyState.schemaDatas.get(schema.schema_id);
        if (tempSchemas) {
          tempSchemas.push(schema);
          copyState.schemaDatas.set(schema.schema_id, tempSchemas);
        } else {
          copyState.schemaDatas.set(schema.schema_id, [schema]);
        }

        // 継承スキーマの設定
        let inheritIds: number[] = [];
        // 親スキーマの継承スキーマを追加
        action.schemaDatas
          .filter(
            (p) =>
              p.inherit_schema &&
              p.inherit_schema.includes(schema.schema_id) &&
              p.schema_id !== schema.schema_id
          )
          .map((p) => inheritIds.push(...p.inherit_schema));
        // 自身の継承スキーマを追加
        inheritIds.push(
          ...schema.inherit_schema.filter((p) => !inheritIds.includes(p))
        );

        // 重複あれば除く
        inheritIds = lodash.uniq(inheritIds);

        copyState.inheritSchemaIds.set(schema.schema_id, inheritIds);
      });
      break;
    case 'ROOT':
      copyState.rootSchemas = action.rootSchemas;

      break;

    case 'BLACKLIST':
      copyState.blackList = action.blackList;

      break;

    default:
  }
  return copyState;
};

export default schemaDataReducer;
