// ★TODO: JSXの属性を修正する
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import apiAccess, { METHOD_TYPE, RESULT } from '../common/ApiAccess';

export interface localStorageObject {
  user_id: number;
  display_name: string;
  token: string;
  reflesh_token: string;
};

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    const loginInfo = { name: username, password };
    // ログインAPIを呼ぶ
    const returnApiObject = await apiAccess(
      METHOD_TYPE.POST,
      `login`,
      loginInfo
    );
    if (returnApiObject.statusNum === RESULT.NORMAL_TERMINATION) {
      const localStorageObj = returnApiObject.body as localStorageObject;
      localStorage.setItem('token', localStorageObj.token);
      localStorage.setItem('reflesh_token', localStorageObj.reflesh_token);
      localStorage.setItem('user_id', localStorageObj.user_id.toString());
      localStorage.setItem('display_name', localStorageObj.display_name);
      navigate('/patients');
    } else {
      // eslint-disable-next-line no-alert
      alert(`ログインに失敗しました。ユーザ名かパスワードが間違っています。`);
    }
  };

  const onSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.currentTarget.value;
    setUsername(value);
  };

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.currentTarget.value;
    setPassword(value);
  };

  return (
    <div className="login-box">
      <div className="login-left" />
      <div className="login-right">
        <div className="login-inputarea">
          <div className="login-inputarea-title">
            <p>ログイン</p>
            <p className="ml40"> </p>
          </div>
          <div className="login-inputarea-inner">
            <form onSubmit={onSubmit}>
              <div className="flex">
                <div>
                  <div className="mb10">
                    <label className="login-label">ユーザ名</label>
                    <div>
                      <input
                        type="text"
                        className="login-input"
                        placeholder="ユーザ名を入力してください"
                        value={username}
                        onChange={onChangeName}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="login-label">パスワード</label>
                    <div>
                      <input
                        type="password"
                        className="login-input"
                        placeholder="パスワードを入力してください"
                        value={password}
                        onChange={onChangePassword}
                      />
                    </div>
                  </div>
                </div>
                <div className="login-button-outer">
                  <button type="submit" className="login-button">
                    ログイン
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
