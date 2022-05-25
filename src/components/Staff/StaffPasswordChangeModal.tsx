import { update } from 'lodash';
import React, {
  MouseEventHandler,
  ReactEventHandler,
  SFC,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Modal,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalProps,
} from 'react-bootstrap';
import apiAccess, { METHOD_TYPE, RESULT } from '../../common/ApiAccess';
import {
  DISPLAYNAME_MAX_LENGTH,
  loginIdCheck,
  passwordCheck,
  rollList,
  StaffErrorMessage,
} from '../../common/StaffMaster';
import { staffData } from '../../views/Stafflist';
import ModalDialog from '../common/ModalDialog';
import './StaffEditModal.css';

export const StaffPasswordChangeModalDialog = (props: {
  onHide: Function;
  onOk: Function;
  onCancel: MouseEventHandler<Button>;
  show: boolean;
  title: string;
}) => {
  const { title } = props;
  const [password, setPassword] = useState<string>('');
  const [passwordConfilm, setPasswordConfilm] = useState<string>('');

  const [errShow, setErrShow] = useState(false);
  const [message, setMessage] = useState<string>('');

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    setPassword('');
    setPasswordConfilm('');
  }, [props.show]);

  const onChangeItem = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const eventTarget: EventTarget & HTMLInputElement =
      event.target as EventTarget & HTMLInputElement;

    let value: number | string;
    switch (eventTarget.id) {
      case 'password':
        value = eventTarget.value;
        setPassword(value);
        break;
      case 'passwordConfilm':
        value = eventTarget.value;
        setPasswordConfilm(value);
        break;
      default:
        break;
    }
  };

  const updatePassword = async () => {
    console.log('addUser');

    // password policy
    const errorMessage: string[] = [];

    const checkPassword = password.trim();
    const checkPasswordConfilm = passwordConfilm.trim();
    if (!checkPassword) {
      // パスワード未入力
      errorMessage.push(StaffErrorMessage.PASSWORD_NOT_ENTERED);
    } else {
      // パスワードポリシーチェック
      if (!passwordCheck(checkPassword)) {
        errorMessage.push(StaffErrorMessage.PASSWORD_POLICY_ERROR);
      }

      // パスワード確認用との比較
      if (checkPassword !== checkPasswordConfilm) {
        errorMessage.push(StaffErrorMessage.PASSWORD_COMPARE_ERROR);
      }
    }

    if (errorMessage.length > 0) {
      console.log(errorMessage);
      setMessage(errorMessage.join('\n'));
      setErrShow(true);
      return;
    }

    // jesgo_user
    const returnApiObject = await apiAccess(
      METHOD_TYPE.POST,
      `changeUserPassword/`,
      { user_id: userId, password }
    );
    console.log(returnApiObject);
    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      alert('変更しました');
      props.onOk();
    } else {
      alert('パスワード変更に失敗しました');
    }
  };

  const onSave = () => {
    updatePassword();
  };

  const errModalHide = useCallback(() => {}, []);

  const errModalOk = useCallback(() => {
    setErrShow(false);
  }, [errShow]);

  const errModalCancel = useCallback(() => {
    setErrShow(false);
  }, [errShow]);

  return (
    <>
      <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="password">
            <ControlLabel>パスワード</ControlLabel>
            <FormControl
              required
              autoComplete="new-password"
              autoCorrect="off"
              type="password"
              placeholder="パスワードを入力"
              onChange={onChangeItem}
              value={password}
            />
          </FormGroup>
          <FormGroup controlId="passwordConfilm">
            <ControlLabel>パスワード(確認用)</ControlLabel>
            <FormControl
              required
              autoComplete="new-password"
              autoCorrect="off"
              type="password"
              placeholder="上記と同じパスワードを入力"
              onChange={onChangeItem}
              value={passwordConfilm}
            />
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="secondary" onClick={props.onCancel}>
            キャンセル
          </Button>
          <Button bsStyle="primary" onClick={onSave}>
            登録
          </Button>
        </Modal.Footer>
      </Modal>
      <ModalDialog
        show={errShow}
        onHide={() => errModalHide()}
        onOk={() => errModalOk()}
        onCancel={() => errModalCancel()}
        title="JESGO"
        type="Alert"
        message={message}
      />
    </>
  );
};

export default StaffPasswordChangeModalDialog;
