import React, { useState } from 'react';
import { Button, Space, Layout, Menu, theme } from 'antd';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, WechatWorkOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import { auth } from "../../config/firebase.config";
import styled from 'styled-components';
import { Buttons, PageDivisionBackground } from '../../components/themes/color';
import ChatRoom from '../chat_room/ChatRoom';
import Users from '../users/Users';

const { Header, Sider, Content } = Layout;

const AdminHome: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('chatRoom');
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleMenuClick = (item: any) => {
    setSelectedMenuItem(item.key);
  };

  return (
    <StyledLayout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[selectedMenuItem]}
          onClick={handleMenuClick}
          items={[
            {
              key: 'chatRoom',
              icon: <WechatWorkOutlined />,
              label: 'Chat Room',
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'Users',
            },
          ]}
        />
      </Sider>
      <Layout>
        <StyledHeader style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <NavBarItems>
            <Space>
              <StyledButton type='link' onClick={handleLogout} icon={<LogoutOutlined />}>Logout</StyledButton>
            </Space>
          </NavBarItems>
        </StyledHeader>
        <StyledContent
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            maxHeight: 'calc(100vh - 10%)',
            overflow: 'auto',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {selectedMenuItem === 'chatRoom' ? <ChatRoom /> : <Users />}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default AdminHome;

const StyledLayout = styled(Layout)`
  height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledContent = styled(Content)`
  background: ${PageDivisionBackground.contentBg};
`;

const NavBarItems = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
`;

const StyledButton = styled(Button)`

//   background-color: ${Buttons.backgroundColor};
//   color: ${Buttons.text};
//   border: none;
//   &&&:hover {
//     color: ${Buttons.hover};
//   }
`;
