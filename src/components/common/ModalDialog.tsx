import React from "react";
import {Modal, Button} from 'react-bootstrap';

export const ModalDialog = (props:any) => {
  const { title, message } = props;

  return (
    <>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button bsStyle={"secondary"} onClick={props.onCancel}>
            いいえ
          </Button>
          <Button bsStyle={"primary"} onClick={props.onOk}>
            はい
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDialog