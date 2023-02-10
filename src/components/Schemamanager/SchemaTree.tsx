/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CustomTreeItem from './CustomTreeItem';
import { treeSchema } from '../../@types/SchemaManager';

export const SCHEMA_TYPE = {
  SUBSCHEMA: 0,
  CHILDSCHEMA: 1,
  INHERITSCHEMA: 2,
};

const collapseIcon = [<ExpandMore />, <ExpandMore />, <ExpandMore />];
const expandIcon = [<ChevronRight />, <ChevronRight />, <ChevronRight />];

const titleGenerator = (schemaType: number, title: string) => {
  let prefix = '';
  if (schemaType === SCHEMA_TYPE.SUBSCHEMA) prefix = '*';
  else if (schemaType === SCHEMA_TYPE.INHERITSCHEMA) prefix = '[継承]';
  return `${prefix}${title}`;
};

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
          key={item.schema_id.toString()}
          label={titleGenerator(schemaType, item.schema_title)}
          collapseIcon={
            item.subschema.length +
              item.childschema.length +
              item.inheritschema.length >
              0 && collapseIcon[schemaType]
          }
          expandIcon={
            item.subschema.length +
              item.childschema.length +
              item.inheritschema.length >
              0 && expandIcon[schemaType]
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
          {makeTree({
            schemas: item.inheritschema,
            handleTreeItemClick,
            schemaType: SCHEMA_TYPE.INHERITSCHEMA,
          })}
        </CustomTreeItem>
      ))}
    </>
  );
};

export default makeTree;
