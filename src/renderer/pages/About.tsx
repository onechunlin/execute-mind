import React from 'react';

const About: React.FC = () => {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是一个独立窗口的页面</p>
      <button onClick={() => window.close()}>关闭窗口</button>
    </div>
  );
};

export default About;
