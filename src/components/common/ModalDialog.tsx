import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ModalDialog.css';

export const ModalDialog = (props: any) => {
  const { title, message, type } = props;

  const buttonControl: any = () => {
    if (type === 'Confirm') {
      return (
        <>
          <Button bsStyle={'secondary'} onClick={props.onCancel}>
            いいえ
          </Button>
          <Button bsStyle={'primary'} onClick={props.onOk}>
            はい
          </Button>
        </>
      );
    }
    return (
      <Button bsStyle="primary" onClick={props.onOk}>
        閉じる
      </Button>
    );
  };

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-cr">{props.message}</Modal.Body>
      <Modal.Footer>{buttonControl()}</Modal.Footer>
    </Modal>
  );
};

export default ModalDialog;
