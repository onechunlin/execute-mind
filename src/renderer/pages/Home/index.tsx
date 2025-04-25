import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Form, Space, Card, Input, message, Tooltip } from 'antd';
import { SendOutlined, CameraOutlined } from '@ant-design/icons';
import './index.less';

const { Title } = Typography;
const { TextArea } = Input;

const Home: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSubmit = (values: { content: string }) => {
    console.log('提交的内容:', values.content);

    // 跳转到聊天页面，将内容作为查询参数传递
    if (values.content && values.content.trim()) {
      navigate(`/chat?query=${encodeURIComponent(values.content.trim())}`);
    }

    // 可选：提交后清空表单
    form.resetFields();
  };

  const handleCaptureScreen = async () => {
    try {
      message.info('截图中...');
      setIsCapturing(true);

      // 确保electronAPI存在
      if (!window.electron) {
        throw new Error('Electron API不可用');
      }

      const result = await window.electron.captureScreen();

      if (result.success) {
        message.success(`截图已保存到: ${result.filePath}`);

        // 可选：将截图路径添加到表单内容中
        const currentContent = form.getFieldValue('content') || '';
        form.setFieldsValue({
          content: currentContent
            ? `${currentContent}\n\n[截图路径]: ${result.filePath}`
            : `[截图路径]: ${result.filePath}`,
        });
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('截图失败:', error);
      message.error(`截图失败: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
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
                <div className="button-group">
                  <Tooltip title="截取屏幕">
                    <Button
                      type="default"
                      icon={<CameraOutlined />}
                      onClick={handleCaptureScreen}
                      loading={isCapturing}
                      className="capture-button"
                    />
                  </Tooltip>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    className="submit-button"
                  >
                    提交
                  </Button>
                </div>
              </div>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
