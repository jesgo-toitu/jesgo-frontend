import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './views/Login';
import Patients from './views/Patients';
import Registration from './views/Registration';
import store from './store/index';
import { Stafflist } from './views/Stafflist';
import Settings from './views/Settings';
import './index.css';
import './biz-udpgothic.css';
import SchemaManager from './views/SchemaManager';
import OutputView from './components/common/OutputView';
import PluginManager from './views/PluginManager';

const RedirectToLogin = () => <Navigate to="/Login" />;

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
        <Route path="/OutputView" element={<OutputView />} />
        <Route path="/PluginManager" element={<PluginManager />} />
      </Routes>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
