import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./Login.css"

export interface Jwt {
    token: string,
}

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const submit = async () => {
        console.log('submit:');

        let result: Jwt | null = null;
        const loginInfo = { name: username, password: password };
        axios.post("http://localhost:3000/login/", loginInfo)
            .then((response) => {
                // エラーが返ってきた時
                if (response.data.token == "error") {
                    alert(`ログインに失敗しました。ユーザ名かパスワードが間違っています。`);
                    return;
                }

                localStorage.setItem("token", response.data.token);
                navigate("/patients");
                return;

            }).catch((err) => {
                alert(`ログインに失敗しました。ユーザ名かパスワードが間違っています。`);
                return;
            });

    }

    // formを使うとブラウザによるパスワード保存の確認あり。
    const onSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        submit();
    }

    const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.currentTarget.value;
        setUsername(value);
    }

    const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const value = event.currentTarget.value;
        setPassword(value);
    }

    return (
        <div className='login-box'>
            <div className='login-left'></div>
            <div className='login-right'>
                <div className='login-inputarea'>
                    <div className='login-inputarea-title'>
                        <p>ログイン</p>
                        <p className='ml40'>○○病院</p>
                    </div>
                    <div className='login-inputarea-inner'>
                        <form onSubmit={onSubmit}>
                            <div className='flex'>
                                <div>
                                    <div className='mb10'>
                                        <label className='login-label'>
                                            ユーザ名
                                        </label>
                                        <div>
                                            <input type='text' className='login-input' placeholder='ユーザ名を入力してください' value={username} onChange={onChangeName} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className='login-label'>
                                            パスワード
                                        </label>
                                        <div>
                                            <input type='password' className='login-input' placeholder='パスワードを入力してください' value={password} onChange={onChangePassword} />
                                        </div>
                                    </div>
                                </div>
                                <div className='login-button-outer'>
                                    <button type='submit' className='login-button'>ログイン</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
}