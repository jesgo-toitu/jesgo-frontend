export type schemaValueSet = {
  schema_id: number;
  primary_id: number;
  valid_from: string;
  valid_until: string | null;
  eventPropName: string;
  eventDate: string | undefined;
  majorVersion: number;
  minorVersion: number;
};

export type jesgoPluginColumns = {
  plugin_id: number;
  plugin_name: string;
  plugin_version?: string;
  script_text: string;
  target_schema_id?: number[];
  target_schema_id_string?: string;
  all_patient: boolean;
  update_db: boolean;
  attach_patient_info: boolean;
  show_upload_dialog: boolean;
  filter_schema_query?: string;
  explain?: string;
};
