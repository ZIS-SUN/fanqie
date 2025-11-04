import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Select,
  Space,
  Typography,
  message,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const PomodoroTimer = ({ tasks, onRefresh }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timerStatus, setTimerStatus] = useState('idle'); // idle, running, paused
  const [workDuration, setWorkDuration] = useState(25); // 分钟
  const [breakDuration, setBreakDuration] = useState(5); // 分钟
  const [timeLeft, setTimeLeft] = useState(workDuration * 60); // 秒
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [todayStats, setTodayStats] = useState({
    total_sessions: 0,
    completed_sessions: 0,
    total_minutes: 0
  });

  const intervalRef = useRef(null);

  // 加载今日统计
  useEffect(() => {
    loadTodayStats();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (timerStatus === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerStatus]);

  // 加载今日统计
  const loadTodayStats = async () => {
    try {
      if (window.electronAPI) {
        const stats = await window.electronAPI.getTodayPomodoroStats();
        setTodayStats(stats);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  // 开始番茄钟
  const handleStart = async () => {
    if (timerStatus === 'idle') {
      // 创建新的番茄钟记录
      try {
        const result = await window.electronAPI.createPomodoroSession({
          task_id: selectedTaskId,
          duration: workDuration,
          break_duration: breakDuration,
          start_time: new Date().toISOString()
        });
        
        if (result.success) {
          setCurrentSessionId(result.id);
          setTimerStatus('running');
        }
      } catch (error) {
        console.error('创建番茄钟记录失败:', error);
        message.error('启动失败');
      }
    } else {
      setTimerStatus('running');
    }
  };

  // 暂停
  const handlePause = () => {
    setTimerStatus('paused');
  };

  // 重置
  const handleReset = () => {
    setTimerStatus('idle');
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsBreak(false);
  };

  // 完成一个番茄钟
  const handleTimerComplete = async () => {
    setTimerStatus('idle');

    if (!isBreak) {
      // 工作时间结束
      if (currentSessionId) {
        try {
          await window.electronAPI.updatePomodoroSession(currentSessionId, {
            end_time: new Date().toISOString(),
            completed: true
          });
          await loadTodayStats();
        } catch (error) {
          console.error('更新番茄钟记录失败:', error);
        }
      }

      // 显示通知
      if (window.electronAPI) {
        await window.electronAPI.showNotification({
          title: '番茄钟完成！',
          body: `太棒了！完成了 ${workDuration} 分钟的专注时间，休息一下吧 ☕`
        });
      }

      message.success('番茄钟完成！开始休息时间');
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      // 休息时间结束
      if (window.electronAPI) {
        await window.electronAPI.showNotification({
          title: '休息结束！',
          body: '休息结束，准备开始下一个番茄钟吧 💪'
        });
      }

      message.info('休息结束，可以开始新的番茄钟了');
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
      setCurrentSessionId(null);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 计算进度百分比
  const getProgress = () => {
    const totalSeconds = isBreak ? breakDuration * 60 : workDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const pendingTasks = tasks.filter(task => task.status !== 'completed');

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card 
            style={{ 
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ color: '#86868b', fontSize: 13, marginBottom: 8 }}>今日番茄钟</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#1d1d1f' }}>
              {todayStats.completed_sessions}
              <span style={{ fontSize: 18, color: '#86868b', fontWeight: 400 }}> / {todayStats.total_sessions}</span>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            style={{ 
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ color: '#86868b', fontSize: 13, marginBottom: 8 }}>今日专注</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#1d1d1f' }}>
              {todayStats.total_minutes || 0}
              <span style={{ fontSize: 18, color: '#86868b', fontWeight: 400 }}> 分钟</span>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            style={{ 
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ color: '#86868b', fontSize: 13, marginBottom: 8 }}>平均时长</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#1d1d1f' }}>
              {todayStats.total_sessions > 0 
                ? Math.round((todayStats.total_minutes || 0) / todayStats.total_sessions) 
                : 0}
              <span style={{ fontSize: 18, color: '#86868b', fontWeight: 400 }}> 分钟</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ 
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '48px 40px' }}
      >
        <div className="pomodoro-timer">
          {/* 简洁的状态文字 */}
          <div style={{ 
            fontSize: 16,
            color: '#86868b',
            fontWeight: 500,
            marginBottom: 16,
            letterSpacing: '0.5px'
          }}>
            {isBreak ? '☕️ 休息中' : '🍅 专注中'}
          </div>

          {/* 超大计时器 - 简洁设计 */}
          <div style={{
            fontSize: 156,
            fontWeight: 700,
            margin: '32px 0',
            color: isBreak ? '#34C759' : '#007AFF',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif'
          }}>
            {formatTime(timeLeft)}
          </div>

          {/* 简洁进度条 */}
          <div style={{ 
            width: '100%',
            maxWidth: 480,
            height: 8,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 100,
            margin: '40px auto',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${getProgress()}%`,
              background: isBreak ? '#34C759' : '#007AFF',
              borderRadius: 100,
              transition: 'width 1s linear'
            }} />
          </div>
          
          {/* 百分比显示 */}
          <div style={{
            fontSize: 14,
            color: '#86868b',
            fontWeight: 500,
            marginBottom: 48
          }}>
            {Math.round(getProgress())}% 已完成
          </div>

          <Space direction="vertical" size={24} style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
            {/* 任务选择 - 简洁设计 */}
            <div>
              <div style={{ 
                fontSize: 14,
                color: '#86868b',
                marginBottom: 12,
                fontWeight: 500
              }}>
                关联任务（可选）
              </div>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="选择任务"
                value={selectedTaskId}
                onChange={setSelectedTaskId}
                disabled={timerStatus !== 'idle'}
                allowClear
              >
                {pendingTasks.map(task => (
                  <Option key={task.id} value={task.id}>
                    {task.title}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 时长设置 - 极简设计 */}
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <div style={{ 
                    fontSize: 14,
                    color: '#86868b',
                    marginBottom: 12,
                    fontWeight: 500
                  }}>
                    工作时长
                  </div>
                  <Select
                    size="large"
                    value={workDuration}
                    onChange={(value) => {
                      setWorkDuration(value);
                      if (!isBreak && timerStatus === 'idle') {
                        setTimeLeft(value * 60);
                      }
                    }}
                    disabled={timerStatus !== 'idle'}
                    style={{ width: '100%' }}
                  >
                    <Option value={15}>15 分钟</Option>
                    <Option value={25}>25 分钟</Option>
                    <Option value={30}>30 分钟</Option>
                    <Option value={45}>45 分钟</Option>
                    <Option value={60}>60 分钟</Option>
                  </Select>
                </div>
              </Col>

              <Col span={12}>
                <div>
                  <div style={{ 
                    fontSize: 14,
                    color: '#86868b',
                    marginBottom: 12,
                    fontWeight: 500
                  }}>
                    休息时长
                  </div>
                  <Select
                    size="large"
                    value={breakDuration}
                    onChange={setBreakDuration}
                    disabled={timerStatus !== 'idle'}
                    style={{ width: '100%' }}
                  >
                    <Option value={5}>5 分钟</Option>
                    <Option value={10}>10 分钟</Option>
                    <Option value={15}>15 分钟</Option>
                    <Option value={20}>20 分钟</Option>
                  </Select>
                </div>
              </Col>
            </Row>

            {/* 控制按钮 - 简洁设计 */}
            <Space size={12} style={{ marginTop: 40 }}>
              {timerStatus === 'running' ? (
                <Button
                  size="large"
                  onClick={handlePause}
                  style={{
                    height: 52,
                    padding: '0 40px',
                    fontSize: 16,
                    fontWeight: 500,
                    borderRadius: 26,
                    background: '#fff',
                    color: '#1d1d1f',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  暂停
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleStart}
                  style={{
                    height: 52,
                    padding: '0 40px',
                    fontSize: 16,
                    fontWeight: 500,
                    borderRadius: 26,
                    background: isBreak ? '#34C759' : '#007AFF',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {timerStatus === 'idle' ? '开始' : '继续'}
                </Button>
              )}

              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={timerStatus === 'idle' && timeLeft === (isBreak ? breakDuration * 60 : workDuration * 60)}
                style={{
                  height: 52,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: 26,
                  background: '#fff',
                  color: '#86868b',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                重置
              </Button>
            </Space>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default PomodoroTimer;

