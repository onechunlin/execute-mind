import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Typography, Card, Input, Spin, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { ChatMessage, ChatService } from '../service/chat';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// 解析查询参数
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// 创建一个容器
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

// 聊天区域
const ChatArea = styled(Card)`
  flex: 1;
  margin-bottom: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
`;

// 消息输入区域
const InputArea = styled(Card)`
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  position: sticky;
  bottom: 20px;
`;

// 创建一个相对定位的容器，用于放置TextArea和按钮
const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

// 样式化 TextArea 组件
const StyledTextArea = styled(TextArea)`
  font-size: 16px;
  border-radius: 6px;
  resize: none;
  padding-bottom: 50px; /* 为按钮留出空间 */

  &:hover,
  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
  }
`;

// 样式化按钮
const StyledButton = styled(Button)`
  position: absolute;
  right: 12px;
  bottom: 12px;
  height: 38px;
  font-size: 14px;
  border-radius: 6px;
  padding: 0 16px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: #4096ff;
    border-color: #4096ff;
  }

  &:focus {
    background-color: #0958d9;
    border-color: #0958d9;
  }
`;

// 消息气泡
const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 8px 0;
  align-self: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  background-color: ${props => (props.isUser ? '#1677ff' : '#fff')};
  color: ${props => (props.isUser ? '#fff' : '#333')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 消息容器
const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// 加载指示器容器
const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  max-width: 80%;
  margin: 8px 0;
`;

const Chat: React.FC = () => {
  const query = useQuery();
  const initialQuery = query.get('query') || '';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);

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
        const systemMessage: ChatMessage = {
          role: 'system',
          content: '你是一个有帮助的助手。',
        };

        updateMessages([systemMessage]);
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

  return (
    <Container>
      <Title level={4}>聊天对话</Title>
      <ChatArea ref={chatAreaRef}>
        <MessagesContainer>
          {messages.map((msg, index) => {
            if (msg.role === 'system') return null;

            const isUser = msg.role === 'user';
            return (
              <MessageBubble key={index} isUser={isUser}>
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</Paragraph>
              </MessageBubble>
            );
          })}

          {isLoading && messages[messages.length - 1]?.content === '' && (
            <LoaderContainer>
              <Spin size="small" /> <span style={{ marginLeft: 10 }}>思考中...</span>
            </LoaderContainer>
          )}
        </MessagesContainer>
      </ChatArea>

      <InputArea>
        <InputContainer>
          <StyledTextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="请输入消息..."
            autoSize={{ minRows: 2, maxRows: 6 }}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <StyledButton
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            发送
          </StyledButton>
        </InputContainer>
      </InputArea>
    </Container>
  );
};

export default Chat;
