import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Space,
  Tag
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const Statistics = () => {
  const [taskStats, setTaskStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    pending_tasks: 0
  });
  const [todayPomodoroStats, setTodayPomodoroStats] = useState({
    total_sessions: 0,
    completed_sessions: 0,
    total_minutes: 0
  });
  const [weekPomodoroStats, setWeekPomodoroStats] = useState([]);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (window.electronAPI) {
        const [taskData, todayPomodoro, weekPomodoro, todayCompleted] = await Promise.all([
          window.electronAPI.getTaskStats(),
          window.electronAPI.getTodayPomodoroStats(),
          window.electronAPI.getWeekPomodoroStats(),
          window.electronAPI.getTodayCompletedTasks()
        ]);

        setTaskStats(taskData);
        setTodayPomodoroStats(todayPomodoro);
        setWeekPomodoroStats(weekPomodoro);
        setTodayCompletedCount(todayCompleted);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 计算完成率
  const getCompletionRate = () => {
    if (taskStats.total_tasks === 0) return 0;
    return ((taskStats.completed_tasks / taskStats.total_tasks) * 100).toFixed(1);
  };

  // 计算今日番茄钟完成率
  const getTodayPomodoroRate = () => {
    if (todayPomodoroStats.total_sessions === 0) return 0;
    return ((todayPomodoroStats.completed_sessions / todayPomodoroStats.total_sessions) * 100).toFixed(1);
  };

  // 表格列配置
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '总番茄钟',
      dataIndex: 'total_sessions',
      key: 'total_sessions'
    },
    {
      title: '完成数',
      dataIndex: 'completed_sessions',
      key: 'completed_sessions',
      render: (count, record) => (
        <Tag color="green">
          {count} / {record.total_sessions}
        </Tag>
      )
    },
    {
      title: '专注时长',
      dataIndex: 'total_minutes',
      key: 'total_minutes',
      render: (minutes) => `${minutes} 分钟`
    },
    {
      title: '完成率',
      key: 'rate',
      render: (_, record) => {
        const rate = record.total_sessions > 0 
          ? ((record.completed_sessions / record.total_sessions) * 100).toFixed(1)
          : 0;
        return <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{rate}%</span>;
      }
    }
  ];

  return (
    <div>
      <Title level={3}>📊 数据概览</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={taskStats.total_tasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={taskStats.completed_tasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>/ {taskStats.total_tasks}</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={taskStats.in_progress_tasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待办"
              value={taskStats.pending_tasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="任务完成率"
              value={getCompletionRate()}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日完成任务"
              value={todayCompletedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日专注时长"
              value={todayPomodoroStats.total_minutes || 0}
              suffix="分钟"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: 32 }}>🍅 今日番茄钟</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总番茄钟"
              value={todayPomodoroStats.total_sessions}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已完成"
              value={todayPomodoroStats.completed_sessions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="完成率"
              value={getTodayPomodoroRate()}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: 32 }}>📈 近7天番茄钟统计</Title>
      <Card>
        <Table
          columns={columns}
          dataSource={weekPomodoroStats}
          rowKey="date"
          pagination={false}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      {weekPomodoroStats.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4}>💡 小贴士</Title>
            <div>
              <p>• 建议每天完成 4-8 个番茄钟，保持专注力</p>
              <p>• 每个番茄钟之间记得休息，避免过度疲劳</p>
              <p>• 优先处理高优先级任务，提高工作效率</p>
              <p>• 定期回顾总结，不断优化时间管理方法</p>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default Statistics;

