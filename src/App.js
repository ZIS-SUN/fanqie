import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, Menu, theme, App as AntApp } from 'antd';
import {
  CheckSquareOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [currentView, setCurrentView] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载任务和分类
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const [tasksData, categoriesData] = await Promise.all([
          window.electronAPI.getAllTasks(),
          window.electronAPI.getAllCategories()
        ]);
        setTasks(tasksData);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'tasks',
      icon: <CheckSquareOutlined />,
      label: '任务列表'
    },
    {
      key: 'pomodoro',
      icon: <ClockCircleOutlined />,
      label: '番茄钟'
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '统计报告'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            categories={categories}
            onRefresh={loadData}
            loading={loading}
          />
        );
      case 'pomodoro':
        return (
          <PomodoroTimer
            tasks={tasks}
            onRefresh={loadData}
          />
        );
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#007aff',
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        },
      }}
    >
      <AntApp>
        <Layout style={{ height: '100vh', background: '#f5f5f7' }}>
        <Sider
          theme="light"
          width={220}
        >
          <div className="app-logo app-drag-region">
            🍅 番茄待办
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentView]}
            items={menuItems}
            onClick={({ key }) => setCurrentView(key)}
            className="app-no-drag"
          />
        </Sider>
        <Layout>
          <Header
            className="app-drag-region"
            style={{
              padding: '0 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <h2 style={{ 
              margin: 0, 
              fontSize: '22px', 
              fontWeight: '600',
              color: '#1d1d1f',
              letterSpacing: '-0.5px'
            }}>
              {menuItems.find(item => item.key === currentView)?.label}
            </h2>
            <div style={{ 
              color: '#86868b', 
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </Header>
          <Content
            className="app-no-drag"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              overflow: 'auto'
            }}
          >
            <div className="fade-in-up">
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;

