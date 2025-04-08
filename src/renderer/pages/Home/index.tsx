import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Form, Space, Card, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './index.less';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="home-container">
      <Card className="card" bodyStyle={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3} className="title">
            Execute Mind
          </Title>

          <Form form={form} onFinish={handleSubmit} autoComplete="off" className="form">
            <Form.Item name="content" rules={[{ required: true, message: '请输入内容' }]}>
              <div className="input-container">
                <TextArea
                  placeholder="请输入内容..."
                  autoFocus
                  allowClear
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className="textarea"
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  className="submit-button"
                >
                  提交
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
