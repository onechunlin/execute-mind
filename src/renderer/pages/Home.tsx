import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>主页面</h1>
      <nav>
        <ul>
          <li>
            <Link to="/settings">设置页面</Link>
          </li>
          <li>
            <button onClick={() => window.electron.openWindow('/about')}>关于我们（新窗口）</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
