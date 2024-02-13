/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
// eslint-disable-next-line import/no-cycle
import './PluginOverwriteCompleted.css';

export type overWriteSchemaInfo = {
  schema_title: string;
  isOverwrite?: boolean;
  uuid?: string;
  itemList: {
    uuid?: string;
    isOverwrite: boolean;
    item_name: string;
    current_value: string | number | any[] | undefined;
    updated_value: string | number | any[] | undefined;
  }[];
};

export type overwriteInfo = {
  his_id: string;
  patient_name: string;
  schemaList?: overWriteSchemaInfo[];
};

export type OverwriteCompletedDialogPlop = {
  onHide: () => void;
  onClose: (value: {
    result: boolean;
  }) => void;
  show: boolean;
  title: string;
  type: string;
};

export const PluginOverwriteCompleted = (props: OverwriteCompletedDialogPlop) => {
  const { title, onClose, onHide, show } = props;
  // const [schemas, setSchemas] = useState<overWriteSchemaInfo[]>();
  // const [isSkip, setIsSkip] = useState(false);

  const handleOk = () => {
    onClose({ result: true });
  };

  const handleCancel = () => {
    onClose({ result: false });
  };

  const buttonControl = () => (
    <>
      <Button bsStyle="primary" onClick={handleOk}>
        結果を別タブで開く
      </Button>
      <Button bsStyle="default" onClick={handleCancel}>
        閉じる
      </Button>
    </>
  );
  return (
    <Modal show={show} onHide={onHide} dialogClassName="completed-modal-size">
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-cr">
        <iframe
          id='overwrite_iframe'
          title="ドキュメント上書き結果"
          src="/OutputView?iframe=true" />
      </Modal.Body>
      <Modal.Footer>{buttonControl()}</Modal.Footer>
    </Modal>
  );
};

export default PluginOverwriteCompleted;
