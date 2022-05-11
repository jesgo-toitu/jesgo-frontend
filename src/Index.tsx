import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './views/Login';
import Patients from './views/Patients';
import Registration from './views/Registration';
import store from './store/index';
import './index.css';
import './biz-udpgothic.css';
import Stafflist from './views/Stafflist';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Patients" element={<Patients />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Stafflist" element={<Stafflist />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
