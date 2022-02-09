import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { getLoginUser, login, useAuthDispatch } from '@ts/store';
import axios from "axios";

export interface Jwt {
    token: string,
}

export const Logout = () => {


    console.log('logout:');
    const token = localStorage.removeItem("token");

    return (
        <div className='w-full flex justify-center items-center flex-col'>
            <div className="text-2xl">
                ログアウトしました。
            </div>
            <div className='mt-2 ml-4 w-64'>

            </div>
        </div>
    );
}