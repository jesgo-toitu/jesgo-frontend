/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CustomTreeItem from './CustomTreeItem';

export type treeSchema = {
  schema_id: number;
  schema_title: string;
  subschema: treeSchema[];
  childschema: treeSchema[];
};

export const SCHEMA_TYPE = {
  SUBSCHEMA: 0,
  CHILDSCHEMA: 1,
};

const collapseIcon = [<ExpandMore />, <ExpandMore />];
const expandIcon = [<ChevronRight />, <ChevronRight />];

export const makeTree = (props: {
  schemas: treeSchema[];
  handleTreeItemClick: (
    event:
      | React.MouseEvent<HTMLLIElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
    v: string
  ) => void;
  schemaType: number;
}) => {
  const { schemas, handleTreeItemClick, schemaType } = props;

  return (
    <>
      {schemas.map((item: treeSchema) => (
        <CustomTreeItem
          nodeId={item.schema_id.toString()}
          label={
            schemaType === SCHEMA_TYPE.SUBSCHEMA
              ? `*${item.schema_title}`
              : item.schema_title
          }
          collapseIcon={
            item.subschema.length + item.childschema.length > 0 &&
            collapseIcon[schemaType]
          }
          expandIcon={
            item.subschema.length + item.childschema.length > 0 &&
            expandIcon[schemaType]
          }
          onClick={(e) => {
            handleTreeItemClick(e, item.schema_id.toString());
          }}
        >
          {makeTree({
            schemas: item.subschema,
            handleTreeItemClick,
            schemaType: SCHEMA_TYPE.SUBSCHEMA,
          })}
          {makeTree({
            schemas: item.childschema,
            handleTreeItemClick,
            schemaType: SCHEMA_TYPE.CHILDSCHEMA,
          })}
        </CustomTreeItem>
      ))}
    </>
  );
};

export default makeTree;
