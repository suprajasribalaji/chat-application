import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

interface ChatRoomProps {
  roomID: string;
  onClose: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomID, onClose }) => {
  return (
    <ChatRoomContainer>
      <Header>
        <RoomID>Chat Room ID: {roomID}</RoomID>
        <Button type='primary' onClick={onClose}>Close</Button>
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