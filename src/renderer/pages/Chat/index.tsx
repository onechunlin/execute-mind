import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, message } from 'antd';
import { ChatMessage, ChatService } from '../../service/chat';
import UserMessageCard from '../../components/UserMessageCard';
import AgentMessageCard from '../../components/AgentMessageCard';
import ChatInput from '../../components/ChatInput';
import './index.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

// 解析查询参数
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Chat: React.FC = () => {
  const query = useQuery();
  const initialQuery = query.get('query') || '';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const navigate = useNavigate();

  const updateMessages = (newMessages: ChatMessage[]) => {
    messagesRef.current = newMessages;
    setMessages(messagesRef.current.slice(0));
  };

  // 当组件加载时，如果有初始查询，则发送消息
  useEffect(() => {
    window.electron.getEnv('DEEPSEEK_API_KEY').then(apiKey => {
      const chatService = new ChatService({
        apiKey,
      });
      chatServiceRef.current = chatService;

      if (initialQuery) {
        sendMessage(initialQuery);
      }
    });
  }, []);

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);

      // 临时助理消息用于显示流式内容

      // 将临时助理消息添加到列表中
      updateMessages([
        ...messagesRef.current,
        {
          role: 'user',
          content,
        },
        {
          role: 'assistant',
          content: '',
        },
      ]);

      // 准备请求消息列表（不包含最后添加的临时助理消息）
      const requestMessages = messagesRef.current.filter(
        msg => msg.role !== 'assistant' || msg.content !== ''
      );

      // 发送流式消息
      await chatServiceRef.current?.sendStreamMessage(
        { messages: requestMessages },
        chunk => {
          // 更新临时助理消息的内容
          const lastMessage = messagesRef.current[messagesRef.current.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
            updateMessages(messagesRef.current);
          }
        },
        () => {
          setIsLoading(false);
        },
        error => {
          console.error('聊天请求失败:', error);
          message.error('发送消息失败，请重试');
          setIsLoading(false);
          // 移除临时消息
          updateMessages(messagesRef.current.filter(msg => msg.content !== ''));
        }
      );
    } catch (error) {
      console.error('发送消息时出错:', error);
      message.error('发送消息失败，请重试');
      setIsLoading(false);
    }
  };

  // 处理表单提交
  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  // 渲染消息
  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.role === 'system') return null;

    if (msg.role === 'user') {
      return <UserMessageCard key={index} content={msg.content} />;
    } else {
      return (
        <AgentMessageCard
          loading={isLoading && index === messages.length - 1}
          key={index}
          content={msg.content}
        />
      );
    }
  };

  return (
    <div className="chat-container">
      <div className="nav">
        <div className="back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
        </div>
        <div className="title">聊天对话</div>
      </div>
      <Card className="chat-area" ref={chatAreaRef}>
        <div className="messages-container">{messages.map(renderMessage)}</div>
      </Card>
      <Card className="input-area">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};

export default Chat;
