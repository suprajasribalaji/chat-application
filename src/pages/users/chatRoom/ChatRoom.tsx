import { Button, Input } from 'antd';
import { CloseCircleOutlined, DownCircleOutlined, SendOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import ShowActiveUsersOfRoomModal from '../../../components/modal/ShowActiveUsersOfRoomModal';

interface ChatRoomProps {
  roomID: string;
  onClose: () => void;
}

interface User {
  email: string;
  status: string;
  user_id: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomID, onClose }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    console.log('onlineUsers state updated:', onlineUsers);
  }, [onlineUsers]);

  const showAllActiveUsers = async () => {
    console.log('Fetching active users for room:', roomID);
    try {
      const usersRef = collection(firestore, 'user');
      const q = query(
        usersRef, 
        where('status', '==', 'online'),
        where('joined_rooms', 'array-contains', roomID)
      );
      console.log('query: ', q);
      
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot size:', querySnapshot.size);
      const users = querySnapshot.docs.map((doc) => {
        const userData = doc.data() as User;
        console.log('User data:', userData);
        return {
          email: userData.email,
          user_id: userData.user_id,
          status: userData.status
        };
      });
      setOnlineUsers(users);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const handleOk = () => {
    console.log('Modal OK clicked');
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    console.log('Modal Cancel clicked');
    setIsModalVisible(false);
  };

  console.log('Current onlineUsers:', onlineUsers);
  
  return (
    <ChatRoomContainer>
      <Header>
        <RoomID>Chat Room ID: {roomID}</RoomID>
        <ButtonGroup>
          <Button type='primary' onClick={showAllActiveUsers} icon={<DownCircleOutlined />}>Active Users</Button>
          <Button type='primary' onClick={onClose} icon={<CloseCircleOutlined />}>Close</Button>
        </ButtonGroup>
      </Header>
      <Content>
        chat content
      </Content>
      <Footer>
        <StyledFooter>
          <Input placeholder="Type your message..." />
          <Button type='link' icon={<SendOutlined />} />
        </StyledFooter>
      </Footer>

      <ShowActiveUsersOfRoomModal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        users={onlineUsers}
      />
    </ChatRoomContainer>
  );
};

export default ChatRoom;

const ChatRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 96%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2%;
  background-color: #f0f2f5;
`;

const RoomID = styled.p`
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Content = styled.div`
  flex: 1;
  padding: 2%;
  overflow-y: auto; 
  background-color: #ffffff;
`;

const Footer = styled.div`
  padding: 16px;
  background-color: #f0f2f5;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;