import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react'
import ReactDOM from 'react-dom'
import { Login } from "./views/Login";
import { Patients } from "./views/Patients";
import { Registration } from './views/Registration';
import { Provider } from "react-redux";
import store from "./store/index"


ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter >
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Patients" element={<Patients />} />
        <Route path="/Registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

