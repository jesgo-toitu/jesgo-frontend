import { JSONSchema7 } from 'json-schema';

// 症例情報の定義
export type jesgoCaseDefine = {
  case_id: string;
  name: string;
  date_of_birth: string;
  date_of_death: string;
  sex: string;
  his_id: string;
  decline: boolean;
  registrant: number;
  last_updated: string;
  is_new_case: boolean;
};

// valueの定義
export type jesgoDocumentValueItem = {
  case_id: string;
  event_date: string;
  document: any;
  child_documents: string[];
  schema_id: number;
  schema_primary_id: number;
  schema_major_version: number;
  registrant: number;
  last_updated: string;
  readonly: boolean;
  deleted: boolean;
};

export type jesgoDocumentObjDefine = {
  key: string;
  value: jesgoDocumentValueItem;
  root_order: number;
  event_date_prop_name: string;
  death_data_prop_name: string;
  delete_document_keys: string[];
  compId: string;
};

// 症例情報の定義
// バックエンドのSchemas.tsと同じものを使用するため
// どちらかに更新が入ったらもう片方も更新すること
export type JesgoDocumentSchema = {
  schema_id: number;
  schema_id_string: string;
  title: string;
  subtitle: string;
  document_schema: JSONSchema7;
  subschema: number[];
  child_schema: number[];
  inherit_schema: number[];
  base_schema: number | null;
  version_major: number;
  version_minor: number;
  schema_primary_id: number;
  subschema_default: number[];
  child_schema_default: number[];
  inherit_schema_default: number[];
  valid_from: string;
  valid_until: string | null;
  hidden: boolean;
};
