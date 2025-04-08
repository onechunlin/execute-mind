import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Typography, Form, Space, Card, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

// 创建一个居中的容器
const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 20px;
  background-color: #f5f5f5;
`;

// 样式化 Card 组件
const StyledCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;

  .ant-card-body {
    padding: 24px;
  }
`;

// 自定义标题样式
const CustomTitle = styled(Title)`
  color: #1677ff !important;
`;

// 样式化 Form 组件
const StyledForm = styled(Form)`
  width: 100%;
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

// 样式化 antd 组件，使用 styled-components 和 antd 结合，并绝对定位
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

const Home: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = (values: { content: string }) => {
    console.log('提交的内容:', values.content);

    // 跳转到聊天页面，将内容作为查询参数传递
    if (values.content && values.content.trim()) {
      navigate(`/chat?query=${encodeURIComponent(values.content.trim())}`);
    }

    // 可选：提交后清空表单
    form.resetFields();
  };

  return (
    <CenteredContainer>
      <StyledCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <CustomTitle level={3}>Execute Mind</CustomTitle>

          <StyledForm form={form} onFinish={handleSubmit} autoComplete="off">
            <Form.Item name="content" rules={[{ required: true, message: '请输入内容' }]}>
              <InputContainer>
                <StyledTextArea
                  placeholder="请输入内容..."
                  autoFocus
                  allowClear
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
                <StyledButton type="primary" htmlType="submit" icon={<SendOutlined />}>
                  提交
                </StyledButton>
              </InputContainer>
            </Form.Item>
          </StyledForm>
        </Space>
      </StyledCard>
    </CenteredContainer>
  );
};

export default Home;
