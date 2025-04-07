import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
};

export default App;
