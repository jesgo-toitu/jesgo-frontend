import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

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
                navigate("/registration");
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
        <div className='' style={{ display: 'flex', background: 'url(./image/login.png) no-repeat center top', backgroundSize: 'auto 100%', width: '100%', height: '100vh' }}>
            <div style={{ width: '50%', height: '100%' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', width: '50%', height: '100%' }}>
                <div style={{ width: '544px', height: '240px', backgroundColor: '#F3F3F3', padding: '20px' }}>
                    <div style={{ height: '30px', display: 'flex', alignItems: 'center', fontSize: '1.4em' }} >
                        <p>ログイン</p>
                        <p style={{ marginLeft: '40px' }}>○○病院</p>
                    </div>
                    <div className='' style={{ display: 'flex', padding: '10px', marginTop: '10px' }}>
                        <form onSubmit={onSubmit}>
                            <div style={{ display: 'flex' }}>
                                <div>
                                    <div className='mt-4' style={{ marginBottom: '10px' }}>
                                        <label className='' style={{ fontWeight: 'normal', fontSize: '0.8em' }}>
                                            ユーザ名
                                        </label>
                                        <div>
                                            <input type='text'
                                                style={{ width: '280px', height: '40px', borderLeft: '0', borderRight: '0', borderTop: '0', backgroundColor: '#F3F3F3' }}
                                                placeholder='ユーザ名を入力してください' value={username} onChange={onChangeName} />
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <label className='' style={{ fontWeight: 'normal', fontSize: '0.8em' }}>
                                            パスワード
                                        </label>
                                        <div>
                                            <input type='password'
                                                style={{ width: '280px', height: '40px', borderLeft: '0', borderRight: '0', borderTop: '0', backgroundColor: '#F3F3F3' }}
                                                placeholder='パスワードを入力してください' value={password} onChange={onChangePassword} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '40px' }}>
                                    <button type='submit'
                                        style={{ width: '160px', height: '50px', display: 'flex', padding: '1em 1em', color: 'white', backgroundColor: '#383838' }}
                                    >ログイン</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div >
    );
}