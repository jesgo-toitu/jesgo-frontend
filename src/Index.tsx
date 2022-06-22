import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/Login';
import Patients from './views/Patients';
import Registration from './views/Registration';
import store from './store/index';
import Stafflist from './views/Stafflist';
import Settings from './views/Settings';
import './index.css';
import './biz-udpgothic.css';
import SchemaManager from './views/SchemaManager';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectToLogin />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Patients" element={<Patients />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/Stafflist" element={<Stafflist />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/SchemaManager" element={<SchemaManager />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

function RedirectToLogin () {
  return (
    <Navigate to="/Login"/>
  )
}
