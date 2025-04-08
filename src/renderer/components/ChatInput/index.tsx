import React from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './index.less';

const { TextArea } = Input;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  return (
    <div className="chat-input-container">
      <TextArea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="请输入消息..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        className="textarea"
        onPressEnter={e => {
          if (!e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={isLoading}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        className="submit-button"
      >
        发送
      </Button>
    </div>
  );
};

export default ChatInput;
