import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import EventListPage from './pages/events/EventListPage';
import EventRulePage from './pages/events/EventRulePage';
import SilenceRulePage from './pages/events/SilenceRulePage'; // 引入新的頁面

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider>
          <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', color: 'white', textAlign: 'center', lineHeight: '32px' }}>
            SRE Platform
          </div>
          <Menu theme="dark" defaultSelectedKeys={['/']} mode="inline">
            <Menu.Item key="/">
              <Link to="/">事件列表</Link>
            </Menu.Item>
            <Menu.Item key="/rules">
              <Link to="/rules">事件規則</Link>
            </Menu.Item>
            <Menu.Item key="/silences">
              <Link to="/silences">靜音規則</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: '#fff' }} />
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
              <Routes>
                <Route path="/" element={<EventListPage />} />
                <Route path="/rules" element={<EventRulePage />} />
                <Route path="/silences" element={<SilenceRulePage />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
