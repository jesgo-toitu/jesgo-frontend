import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'
import ReactDOM from 'react-dom'
import { Login } from "./views/Login";
import { Registration } from './views/Registration';


ReactDOM.render(
  <>
    <BrowserRouter >
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  </>
  ,
  document.getElementById('root')
);

