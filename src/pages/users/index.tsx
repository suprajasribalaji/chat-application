import React, { useState } from 'react';
import { Button, Space, Layout, Menu, theme } from 'antd';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, WechatWorkOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import { auth } from "../../config/firebase.config";
import styled from 'styled-components';
import { PageDivisionBackground } from '../../components/themes/color';
import ListAllChatRoom from './chatRoom/ListAllChatRoom';
import ListJoinedChatRoom from './chatRoom/ListJoinedChatRoom';
import UserProfile from './profile/UserProfile';

const { Header, Sider, Content } = Layout;

const UserHome: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('profile');
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
          style={{ paddingTop: '6%' }}
          items={[
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'Profile',
            },
            {
                key: 'chatRoom',
                icon: <WechatWorkOutlined />,
                label: 'Chat Room',
                children: [
                {
                    key: 'allRooms',
                    label: 'All Rooms',
                },
                {
                    key: 'joinedRooms',
                    label: 'Joined Rooms',
                },
              ],
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
              <Button type='link' onClick={handleLogout} icon={<LogoutOutlined />}>Logout</Button>
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
          {selectedMenuItem === 'profile' && <UserProfile />}
          {selectedMenuItem === 'allRooms' && <ListAllChatRoom />}
          {selectedMenuItem === 'joinedRooms' && <ListJoinedChatRoom/>}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default UserHome;

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