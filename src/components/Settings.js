import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  Space,
  Divider,
  Typography,
  message,
  Select,
  Alert
} from 'antd';
import {
  ClockCircleOutlined,
  BellOutlined,
  BgColorsOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState({
    // 番茄钟设置
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    autoStartNextSession: false,
    
    // 通知设置
    notificationEnabled: true,
    notificationSound: true,
    
    // 界面设置
    theme: 'light',
    language: 'zh-CN'
  });

  const handleSave = () => {
    const values = form.getFieldsValue();
    setSettings(values);
    
    // 在实际应用中，这里应该保存到本地存储或数据库
    localStorage.setItem('pomodoroSettings', JSON.stringify(values));
    
    message.success('设置已保存');
  };

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreak: false,
      autoStartNextSession: false,
      notificationEnabled: true,
      notificationSound: true,
      theme: 'light',
      language: 'zh-CN'
    };
    
    form.setFieldsValue(defaultSettings);
    setSettings(defaultSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(defaultSettings));
    
    message.info('已恢复默认设置');
  };

  // 组件挂载时加载保存的设置
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        form.setFieldsValues(parsed);
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    }
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Alert
        message="设置说明"
        description="修改设置后记得点击保存按钮。这些设置会保存在本地，重启应用后依然有效。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
      >
        {/* 番茄钟设置 */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <ClockCircleOutlined /> 番茄钟设置
          </Title>
          <Divider />

          <Form.Item
            name="workDuration"
            label="工作时长（分钟）"
            rules={[{ required: true, message: '请输入工作时长' }]}
          >
            <InputNumber min={1} max={120} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="shortBreak"
            label="短休息时长（分钟）"
            rules={[{ required: true, message: '请输入短休息时长' }]}
          >
            <InputNumber min={1} max={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="longBreak"
            label="长休息时长（分钟）"
            rules={[{ required: true, message: '请输入长休息时长' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="sessionsBeforeLongBreak"
            label="长休息前的番茄钟数量"
            extra="完成指定数量的番茄钟后，进入长休息"
          >
            <InputNumber min={2} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="autoStartBreak"
            label="自动开始休息"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="autoStartNextSession"
            label="休息后自动开始下一个番茄钟"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* 通知设置 */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <BellOutlined /> 通知设置
          </Title>
          <Divider />

          <Form.Item
            name="notificationEnabled"
            label="启用桌面通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notificationSound"
            label="通知声音"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* 界面设置 */}
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>
            <BgColorsOutlined /> 界面设置
          </Title>
          <Divider />

          <Form.Item
            name="theme"
            label="主题"
          >
            <Select>
              <Option value="light">浅色模式</Option>
              <Option value="dark">深色模式（开发中）</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="language"
            label="语言"
          >
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English（开发中）</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* 操作按钮 */}
        <Card>
          <Space size="large">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              size="large"
            >
              保存设置
            </Button>
            <Button onClick={handleReset} size="large">
              恢复默认
            </Button>
          </Space>
        </Card>
      </Form>

      {/* 关于信息 */}
      <Card style={{ marginTop: 16, textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Title level={5}>番茄待办提醒 v1.0.0</Title>
          <Text type="secondary">
            基于 Electron + React + MySQL 开发
          </Text>
          <Text type="secondary">
            © 2025 Pomodoro Todo App
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default Settings;

