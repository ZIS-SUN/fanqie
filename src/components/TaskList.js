import React, { useState } from 'react';
import {
  Button,
  Card,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Empty,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const TaskList = ({ tasks, categories, onRefresh, loading }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  };

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高'
  };

  const statusLabels = {
    pending: '待办',
    in_progress: '进行中',
    completed: '已完成'
  };

  const statusIcons = {
    pending: <ClockCircleOutlined />,
    in_progress: <ExclamationCircleOutlined />,
    completed: <CheckCircleOutlined />
  };

  // 打开新建/编辑任务对话框
  const showModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      form.setFieldsValue({
        ...task,
        due_date: task.due_date ? dayjs(task.due_date) : null,
        remind_time: task.remind_time ? dayjs(task.remind_time) : null
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 提交任务
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('📝 准备提交任务数据:', values);
      
      const taskData = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD HH:mm:ss') : null,
        remind_time: values.remind_time ? values.remind_time.format('YYYY-MM-DD HH:mm:ss') : null
      };
      
      console.log('📤 发送到后端的数据:', taskData);

      if (editingTask) {
        // 更新任务
        const result = await window.electronAPI.updateTask(editingTask.id, taskData);
        console.log('📥 后端返回结果:', result);
        
        if (result.success) {
          message.success('✅ 任务更新成功！');
        } else {
          message.error(`❌ 任务更新失败: ${result.error || '未知错误'}`);
          console.error('更新失败详情:', result);
        }
      } else {
        // 创建任务
        const result = await window.electronAPI.createTask(taskData);
        console.log('📥 后端返回结果:', result);
        
        if (result.success) {
          message.success('✅ 任务创建成功！', 2);
          setIsModalVisible(false);
          form.resetFields();
          onRefresh();
        } else {
          message.error(`❌ 任务创建失败: ${result.error || '未知错误'}`, 5);
          console.error('创建失败详情:', result);
          // 不关闭对话框，让用户可以修改
          return;
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      onRefresh();
      
    } catch (error) {
      console.error('❌ 提交任务出错:', error);
      
      if (error.errorFields) {
        // 表单验证错误
        message.error('❌ 请检查表单填写是否正确');
        console.log('表单验证错误:', error.errorFields);
      } else {
        // 其他错误
        message.error(`❌ 提交失败: ${error.message || '未知错误'}`, 5);
      }
    }
  };

  // 删除任务
  const handleDelete = async (taskId) => {
    try {
      const result = await window.electronAPI.deleteTask(taskId);
      if (result.success) {
        message.success('任务已删除');
        onRefresh();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      message.error('删除失败');
    }
  };

  // 更新任务状态
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const result = await window.electronAPI.updateTask(taskId, { status: newStatus });
      if (result.success) {
        message.success('状态已更新');
        onRefresh();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  // 过滤任务
  const filterTasks = () => {
    if (activeTab === 'all') return tasks;
    return tasks.filter(task => task.status === activeTab);
  };

  const filteredTasks = filterTasks();

  // 任务卡片 - 鸿蒙风格
  const TaskCard = ({ task }) => {
    const statusColors = {
      pending: { bg: 'rgba(102, 126, 234, 0.08)', border: 'rgba(102, 126, 234, 0.3)', text: '#667eea' },
      in_progress: { bg: 'rgba(245, 87, 108, 0.08)', border: 'rgba(245, 87, 108, 0.3)', text: '#f5576c' },
      completed: { bg: 'rgba(17, 153, 142, 0.08)', border: 'rgba(17, 153, 142, 0.3)', text: '#11998e' }
    };
    
    const statusStyle = statusColors[task.status] || statusColors.pending;
    
    return (
      <Card
        className="task-card"
        style={{ 
          marginBottom: 16,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        hoverable
        bodyStyle={{ padding: '20px 24px' }}
      >
        {/* 状态指示条 */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${statusStyle.text} 0%, ${statusStyle.text}80 100%)`
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {/* 标题和标签 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 17, 
                  fontWeight: 600,
                  color: '#1d1d1f',
                  letterSpacing: '-0.3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '400px'
                }}>
                  {task.title}
                </h3>
                
                {task.category_name && (
                  <Tag 
                    style={{
                      background: task.category_color + '15',
                      color: task.category_color,
                      border: `1px solid ${task.category_color}40`,
                      borderRadius: 8,
                      padding: '4px 12px',
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    {task.category_name}
                  </Tag>
                )}
                
                <Tag style={{
                  background: priorityColors[task.priority] === 'red' 
                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                    : priorityColors[task.priority] === 'orange'
                    ? 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)'
                    : 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 500
                }}>
                  {priorityLabels[task.priority]}
                </Tag>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`,
                  color: statusStyle.text,
                  fontSize: 13,
                  fontWeight: 500
                }}>
                  {statusIcons[task.status]}
                  <span>{statusLabels[task.status]}</span>
                </div>
              </div>
              
              {/* 描述 */}
              {task.description && (
                <p style={{ 
                  margin: 0, 
                  color: '#86868b',
                  fontSize: 14,
                  lineHeight: 1.6,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {task.description}
                </p>
              )}
              
              {/* 截止时间 */}
              {task.due_date && (
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 149, 0, 0.08)',
                  border: '1px solid rgba(255, 149, 0, 0.2)',
                  color: '#ff9500',
                  fontSize: 13,
                  fontWeight: 500
                }}>
                  <span>📅</span>
                  <span>{dayjs(task.due_date).format('MM月DD日 HH:mm')}</span>
                </div>
              )}
            </Space>
          </div>
          
          {/* 操作按钮 */}
          <Space size={8} style={{ marginLeft: 16 }}>
            <Select
              value={task.status}
              onChange={(value) => handleStatusChange(task.id, value)}
              style={{ width: 110 }}
              size="middle"
              variant="borderless"
            >
              <Option value="pending">待办</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
            
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: 18 }} />}
              onClick={() => showModal(task)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667eea'
              }}
            />
            
            <Popconfirm
              title="确定要删除这个任务吗？"
              onConfirm={() => handleDelete(task.id)}
              okText="确定"
              cancelText="取消"
              okButtonProps={{
                style: {
                  background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                  border: 'none'
                }
              }}
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Popconfirm>
          </Space>
        </div>
      </Card>
    );
  };

  const tabItems = [
    { key: 'all', label: `全部 (${tasks.length})` },
    { key: 'pending', label: `待办 (${tasks.filter(t => t.status === 'pending').length})` },
    { key: 'in_progress', label: `进行中 (${tasks.filter(t => t.status === 'in_progress').length})` },
    { key: 'completed', label: `已完成 (${tasks.filter(t => t.status === 'completed').length})` }
  ];

  return (
    <div>
      {/* 顶部操作栏 - 鸿蒙风格 */}
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 0'
      }}>
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={setActiveTab}
          size="large"
          style={{
            flex: 1
          }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined style={{ fontSize: 18 }} />}
          onClick={() => showModal()}
          size="large"
          style={{
            height: 48,
            padding: '0 32px',
            borderRadius: 24,
            fontSize: 16,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          新建任务
        </Button>
      </div>

      {/* 任务列表 */}
      {filteredTasks.length === 0 ? (
        <div style={{
          padding: '80px 0',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Empty 
            description={
              <span style={{ 
                fontSize: 16, 
                color: '#86868b',
                fontWeight: 500 
              }}>
                暂无任务，点击上方按钮创建第一个任务吧
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div style={{ 
          display: 'grid',
          gap: 16
        }}>
          {filteredTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* 新建/编辑任务对话框 - 鸿蒙风格 */}
      <Modal
        title={
          <span style={{ 
            fontSize: 22, 
            fontWeight: 600,
            color: '#1d1d1f',
            letterSpacing: '-0.5px'
          }}>
            {editingTask ? '✏️ 编辑任务' : '➕ 新建任务'}
          </span>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={680}
        centered
        okButtonProps={{
          size: 'large',
          style: {
            height: 44,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }
        }}
        cancelButtonProps={{
          size: 'large',
          style: {
            height: 44,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 500
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'pending',
            priority: 'medium'
          }}
          size="large"
        >
          <Form.Item
            name="title"
            label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>任务标题</span>}
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input 
              placeholder="例如：完成项目文档" 
              style={{ 
                height: 48,
                borderRadius: 12,
                fontSize: 15
              }}
            />
          </Form.Item>

          <Form.Item 
            name="description" 
            label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>任务描述</span>}
          >
            <TextArea 
              rows={4} 
              placeholder="输入任务的详细描述（可选）"
              style={{
                borderRadius: 12,
                fontSize: 15
              }}
            />
          </Form.Item>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
            marginBottom: 24
          }}>
            <Form.Item 
              name="category_id" 
              label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>分类</span>}
              style={{ marginBottom: 0 }}
            >
              <Select 
                placeholder="选择分类" 
                allowClear
                style={{ height: 48 }}
              >
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span> {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              name="priority" 
              label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>优先级</span>}
              style={{ marginBottom: 0 }}
            >
              <Select style={{ height: 48 }}>
                <Option value="low">🟢 低优先级</Option>
                <Option value="medium">🟡 中优先级</Option>
                <Option value="high">🔴 高优先级</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              name="status" 
              label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>状态</span>}
              style={{ marginBottom: 0 }}
            >
              <Select style={{ height: 48 }}>
                <Option value="pending">⏳ 待办</Option>
                <Option value="in_progress">🚀 进行中</Option>
                <Option value="completed">✅ 已完成</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: 16
          }}>
            <Form.Item 
              name="due_date" 
              label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>📅 截止时间</span>}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm" 
                placeholder="选择截止时间"
                style={{ 
                  width: '100%',
                  height: 48,
                  borderRadius: 12
                }}
              />
            </Form.Item>

            <Form.Item 
              name="remind_time" 
              label={<span style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>🔔 提醒时间</span>}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm" 
                placeholder="选择提醒时间"
                style={{ 
                  width: '100%',
                  height: 48,
                  borderRadius: 12
                }}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskList;

