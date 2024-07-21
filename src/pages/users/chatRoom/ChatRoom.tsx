import { Button, Input, message } from 'antd';
import { SendOutlined, CloseOutlined, DownCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import { Buttons } from '../../../components/themes/color';
import ShowActiveUsersOfRoomModal from '../../../components/modal/ShowActiveUsersOfRoomModal';
import { CurrentChatRoom, User } from '../../../utils/utils';

interface ChatRoomProps {
  roomID: string;
  userID: string | undefined;
  onClose: () => void;
}

interface Message {
  id: string;
  userID: string;
  content: string;
  sender: string;
  timestamp: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomID, userID, onClose }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<CurrentChatRoom | null>(null);
  const socket = useRef<WebSocket | null>(null);

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
        return {
          email: userData.email,
          user_id: userData.user_id,
          status: userData.status,
          joined_rooms: userData.joined_rooms,
          createdAt: userData.createdAt
        };
      });
      setOnlineUsers(users as User[]);
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
  
   const currentChatRoom = async () => {
    try {
      const chatRoomRef = collection(firestore, 'chat_room');
      const querySnapshot = await getDocs(
        query(chatRoomRef, where('roomID', '==', roomID))
      );
      querySnapshot.forEach((doc) => {
        const data = doc.data() as CurrentChatRoom;
        setCurrentRoom(data);
        const messagesArray = Object.entries(data.messages || {})
          .map(([key, value]) => ({
            id: key,
            ...value,
            sender: value.userID
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesArray);
        console.log(data);
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  const getUserIDByDocId = async (docId: string): Promise<string | null> => {
    try {
      const userRef = doc(firestore, 'user', docId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('ud: ', userData);
        return userData?.user_id || null;
      } else {
        console.log('No such user!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };
  
  useEffect(() => {
    currentChatRoom();

    socket.current = new WebSocket('ws://localhost:8080');

    socket.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      try {
        const message: Message = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;
        console.log('Parsed message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [roomID]);
  
  useEffect(() => {
    const storedMessages = localStorage.getItem(`messages_${roomID}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [roomID]);
  
   useEffect(() => {
    localStorage.setItem(`messages_${roomID}`, JSON.stringify(messages));
  }, [messages, roomID]);
  
  const sendMessage = async () => {
    if (input && userID) {
      const actualUserID = await getUserIDByDocId(userID);

      if (!actualUserID) {
        message.error('Failed to retrieve user ID.');
        return;
      }

      const timestamp = Date.now();
      const newMessage: Message = {
        id: `${timestamp}`,
        userID: actualUserID,
        content: input,
        sender: actualUserID,
        timestamp,
      };

      if (socket.current) {
        socket.current.send(JSON.stringify(newMessage));
      } else {
        console.error('WebSocket is not connected');
        message.error('Failed to send message. Please try again.');
        return;
      }

      try {
        const chatRoomRef = collection(firestore, 'chat_room');
        const q = query(chatRoomRef, where('roomID', '==', roomID));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Chat room not found');
        }

        const docRef = querySnapshot.docs[0].ref;

        await setDoc(docRef, {
          messages: {
            [timestamp]: newMessage
          }
        }, { merge: true });

        console.log('Message successfully added to Firestore');
      } catch (error) {
        console.error('Error updating Firestore:', error);
        if (error instanceof Error) {
          message.error(`Failed to update message in database: ${error.message}`);
        } else {
          message.error('Failed to update message in database. Please try again.');
        }
      }

      setInput('');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ChatRoomContainer>
      <Header>
        <RoomInfo>
          <RoomID>{currentRoom && <p>{currentRoom.roomName}</p>}</RoomID>
        </RoomInfo>
        <ButtonGroup>
          <Button type='primary' onClick={showAllActiveUsers} icon={<DownCircleOutlined />}>Active users</Button>
          <Button type='primary' onClick={onClose} icon={<CloseOutlined />}>Close</Button>

        </ButtonGroup>
      </Header>

      <Content>
        {messages.map((msg, index) => (
          <Message key={msg.id || index}>
            <MessageContent>
              <strong>{msg.sender}</strong>: {msg.content}
            </MessageContent>
            <MessageTimestamp>{formatDate(msg.timestamp)}</MessageTimestamp>
          </Message>
        ))}
      </Content>
      
      <Footer>
        <StyledFooter>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <Button type='link' icon={<SendOutlined />} onClick={sendMessage} />
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
  width: 100%;
  height: 78.1vh;
  background-color: #f0f0f0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 2%;
  background-color: ${Buttons.backgroundColor};
  color: white;
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomID = styled.div`
  font-size: 150%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-right: 2%;
`;

const Content = styled.div`
  flex: 1;
  padding: 1.5%;
  overflow-y: auto;
`;

const Message = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.3%;
  padding: 1.3%;
  background-color: white;
  border-radius: 4px;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageTimestamp = styled.div`
  font-size: 0.8em;
  color: gray;
`;

const Footer = styled.div`
  padding-top: 2%;
  background-color: white;
`;

const StyledFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 2%;
  padding-left: 1%;
`;
