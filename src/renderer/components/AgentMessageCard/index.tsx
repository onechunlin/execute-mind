import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './index.less';
import { Spin } from 'antd';

// Agent消息卡片属性接口
export interface AgentMessageCardProps {
  content: string;
  loading?: boolean;
}

// Agent消息组件 - 支持Markdown
const AgentMessageCard: React.FC<AgentMessageCardProps> = ({ content, loading }) => {
  // 自定义渲染组件
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const language = className?.split('-')[1];
      if (language === 'tool_call') {
        return <div className="tool-call">{children}</div>;
      }

      const match = /language-(\w+)/.exec(className || '');

      return !inline && match ? (
        <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="agent-message-card">
      <div className="markdown">
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
      </div>
      {loading && !content && (
        <div className="loading-container">
          <Spin size="small" /> <span style={{ marginLeft: 10 }}>思考中...</span>
        </div>
      )}
    </div>
  );
};

export default AgentMessageCard;
