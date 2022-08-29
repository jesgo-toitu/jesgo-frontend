import React from 'react';
import { Checkbox } from 'react-bootstrap';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import lodash from 'lodash';
import { schemaWithValid } from '../CaseRegistration/SchemaUtility';

type DndSortableTableProps = {
  schemaList: schemaWithValid[] | undefined;
  checkType: number[];
  setSchemaList: React.Dispatch<React.SetStateAction<schemaWithValid[]>>;
  handleCheckClick: (relation: number, type: number, v?: string) => void;
  // eslint-disable-next-line react/require-default-props
  isDragDisabled?: boolean; // drag無効フラグ
};

/**
 * Drag&Dropで並び替え可能なTable
 * @param props: DndSortableTableProps
 * @returns
 */
const DndSortableTable = (props: DndSortableTableProps) => {
  const {
    schemaList,
    checkType,
    setSchemaList,
    handleCheckClick,
    isDragDisabled,
  } = props;

  const reorder = (
    argSchemaList: schemaWithValid[],
    startIndex: number,
    endIndex: number
  ) => {
    const copySchemaList = lodash.cloneDeep(argSchemaList);
    const result = copySchemaList;
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!schemaList) return;

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const update = reorder(schemaList, source.index, destination.index);
    setSchemaList(update);
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!schemaList || schemaList.length === 0 ? (
        <span>(なし)</span>
      ) : (
        <table className="sortable-table">
          <thead>
            <tr className="sortable-table-head">
              <th className="sortable-table-cell1">スキーマ名称</th>
              <th className="sortable-table-cell2">表示</th>
            </tr>
          </thead>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dndTableBody">
              {(provided) => (
                <tbody
                  className="sortable-table-body"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {schemaList.map((row, index) => (
                    <Draggable
                      isDragDisabled={isDragDisabled}
                      draggableId={row.schema.schema_id.toString()}
                      index={index}
                      key={row.schema.schema_id}
                    >
                      {(provided2, snapshot) => (
                        <tr
                          className={
                            snapshot.isDragging
                              ? 'sortable-table-row-dragging'
                              : 'sortable-table-row'
                          }
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          {...provided2.dragHandleProps}
                        >
                          <td className="sortable-table-cell1">
                            <div>
                              {!isDragDisabled && (
                                <DragIndicatorIcon className="drag-icon-style" />
                              )}
                              <div>
                                {row.schema.title}
                                {row.schema.subtitle &&
                                  ` ${row.schema.subtitle}`}
                              </div>
                            </div>
                          </td>
                          <td className="sortable-table-cell2">
                            <Checkbox
                              className="show-flg-checkbox"
                              checked={row.valid}
                              onChange={(e) =>
                                handleCheckClick(
                                  checkType[0],
                                  checkType[1],
                                  row.schema.schema_id.toString()
                                )
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      )}
    </>
  );
};

export default DndSortableTable;
