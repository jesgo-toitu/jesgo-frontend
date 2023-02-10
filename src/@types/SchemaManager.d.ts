export type treeSchema = {
  schema_id: number;
  schema_title: string;
  subschema: treeSchema[];
  childschema: treeSchema[];
  inheritschema: treeSchema[];
};

export type treeApiObject = {
  treeSchema: treeSchema[];
  errorMessages: string[];
};
