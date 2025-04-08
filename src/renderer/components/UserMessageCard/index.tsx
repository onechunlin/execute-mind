import React from 'react';
import { Typography } from 'antd';
import './index.less';

const { Paragraph } = Typography;

// 用户消息卡片属性接口
export interface UserMessageCardProps {
  content: string;
}

// 用户消息组件
const UserMessageCard: React.FC<UserMessageCardProps> = ({ content }) => {
  return (
    <div className="user-message-card">
      <Paragraph className="message-content">{content}</Paragraph>
    </div>
  );
};

export default UserMessageCard;
