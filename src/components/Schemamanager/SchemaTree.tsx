/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { TreeItem } from '@mui/lab';
import { Box } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

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
  handleTreeItemClick: any;
  schemaType: number;
}) => {
  const { schemas, handleTreeItemClick, schemaType } = props;
  return (
    <>
      {schemas.map((item: treeSchema) => (
        <TreeItem
          nodeId={item.schema_id.toString()}
          label={
            <Box
              onClick={(e) => handleTreeItemClick(e, item.schema_id.toString())}
            >
              {schemaType === SCHEMA_TYPE.SUBSCHEMA && '*'}
              {item.schema_title}
            </Box>
          }
          collapseIcon={
            item.subschema.length + item.childschema.length > 0 &&
            collapseIcon[schemaType]
          }
          expandIcon={
            item.subschema.length + item.childschema.length > 0 &&
            expandIcon[schemaType]
          }
          onClick={handleTreeItemClick}
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
        </TreeItem>
      ))}
    </>
  );
};

export default makeTree;
