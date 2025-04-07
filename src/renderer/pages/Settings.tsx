import React from 'react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  return (
    <div>
      <h1>设置页面</h1>
      <Link to="/">返回主页</Link>
    </div>
  );
};

export default Settings;
