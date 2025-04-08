import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
