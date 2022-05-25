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

export const StaffEditModalDialog = (props: {
  onHide: Function;
  onOk: Function;
  onCancel: MouseEventHandler<Button>;
  show: boolean;
  title: string;
  insert: boolean;
  data: staffData | undefined;
}) => {
  const { title, data } = props;
  const [userId, setUserId] = useState<number>(-1);
  const [loginId, setLoginId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfilm, setPasswordConfilm] = useState<string>('');
  const [roll, setRoll] = useState<number>(-1);

  const [errShow, setErrShow] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    console.log(props.insert);

    if (data !== undefined) {
      setUserId(data.user_id);
      setLoginId(data.name);
      setDisplayName(data.display_name);
      setRoll(data.roll_id);
    } else {
      setUserId(-1);
      setLoginId('');
      setDisplayName('');
      setRoll(-1);
    }
    setPassword('');
    setPasswordConfilm('');
  }, [props.show]);

  const onChangeItem = (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const eventTarget: EventTarget & HTMLInputElement =
      event.target as EventTarget & HTMLInputElement;

    console.log('onChangeItem');

    let value: number | string;
    switch (eventTarget.id) {
      case 'name':
        value = eventTarget.value;
        setLoginId(value);
        break;
      case 'displayName':
        value = eventTarget.value;
        setDisplayName(value);
        break;
      case 'password':
        value = eventTarget.value;
        setPassword(value);
        break;
      case 'passwordConfilm':
        value = eventTarget.value;
        setPasswordConfilm(value);
        break;
      case 'roll':
        value = eventTarget.value;
        setRoll(Number(value));
        break;
      default:
        break;
    }
  };

  // 入力チェック
  const hasInputError = (isAddUser: boolean) => {
    const errorMessage: string[] = [];

    if (isAddUser) {
      const checkName = loginId.trim();
      if (!checkName) errorMessage.push(StaffErrorMessage.LOGINID_NOT_ENTERED);
      else if (!loginIdCheck(checkName)) {
        errorMessage.push(StaffErrorMessage.LOGINID_POLICY_ERROR);
      }

      const checkDisplayName = displayName.trim();
      if (!checkDisplayName) {
        errorMessage.push(StaffErrorMessage.DISPLAYNAME_NOT_ENTERED);
      } else if (checkDisplayName.length > DISPLAYNAME_MAX_LENGTH) {
        errorMessage.push(StaffErrorMessage.DISPLAYNAME_LENGTH_ERROR);
      }
    }

    // パスワードの確認
    const checkPassword = password.trim();
    const checkPasswordConfilm = passwordConfilm.trim();

    if (isAddUser || checkPassword || checkPasswordConfilm) {
      if (!checkPassword) {
        // パスワード未入力
        errorMessage.push(StaffErrorMessage.PASSWORD_NOT_ENTERED);
      } else {
        // パスワードポリシー確認
        if (!passwordCheck(checkPassword)) {
          errorMessage.push(StaffErrorMessage.PASSWORD_POLICY_ERROR);
        }

        // パスワード確認用との比較
        if (checkPassword !== checkPasswordConfilm) {
          errorMessage.push(StaffErrorMessage.PASSWORD_COMPARE_ERROR);
        }
      }
      if (rollList.indexOf(roll) === -1) {
        errorMessage.push(StaffErrorMessage.ROLL_ERROR);
      }
    }

    if (errorMessage.length > 0) {
      console.log(errorMessage);
      setMessage(errorMessage.join('\n'));
      setErrShow(true);
      return true;
    }

    return false;
  };

  const addUser = async () => {
    console.log('addUser');

    // password policy
    // const errorMessage: string[] = [];

    if (hasInputError(true)) return;

    // jesgo_user list
    const returnApiObject = await apiAccess(METHOD_TYPE.POST, `signup/`, {
      name: loginId,
      display_name: displayName,
      password,
      roll_id: roll,
    });
    console.log(returnApiObject);
    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      alert('登録しました');
      props.onOk();
    } else if (
      returnApiObject.statusNum === RESULT.FAILED_USER_ALREADY_REGISTERED
    ) {
      alert('このIDは既に登録されています');
    } else {
      alert('登録エラー');
    }
  };

  const updateUser = async () => {
    console.log('updateUser');

    if (hasInputError(false)) return;

    // jesgo_user list
    const returnApiObject = await apiAccess(METHOD_TYPE.POST, `editUser/`, {
      user_id: userId,
      name: loginId,
      display_name: displayName,
      password,
      roll_id: roll,
    });
    console.log(returnApiObject);
    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      alert('更新しました');
      props.onOk();
    } else {
      alert('登録エラー');
    }
  };

  const onSave = () => {
    if (props.insert) {
      addUser();
    } else {
      updateUser();
    }
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
          <FormGroup controlId="name">
            <ControlLabel>ログインID</ControlLabel>
            <FormControl
              required
              className="input-ime-disable"
              autoComplete="new-password"
              autoCorrect="off"
              type="tel"
              placeholder="ログインIDを入力"
              onChange={onChangeItem}
              value={loginId}
              readOnly={!props.insert}
            />
          </FormGroup>
          <FormGroup controlId="displayName">
            <ControlLabel>表示名</ControlLabel>
            <FormControl
              required
              className="input-ime-active"
              autoComplete="new-password"
              autoCorrect="off"
              type="text"
              placeholder="表示名を入力"
              onChange={onChangeItem}
              value={displayName}
            />
          </FormGroup>
          <FormGroup controlId="roll">
            <ControlLabel>権限</ControlLabel>
            <FormControl
              required
              name="roll"
              defaultValue={-1}
              value={roll}
              onChange={onChangeItem}
              componentClass="select"
            >
              <option value={-1}></option>
              {/* <option value={0}>システム管理者</option> */}
              <option value={1}>システムオペレーター</option>
              <option value={100}>上級ユーザー</option>
              <option value={101}>一般ユーザー</option>
              <option value={1000}>退職者</option>
            </FormControl>
          </FormGroup>
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

export default StaffEditModalDialog;
