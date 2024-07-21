import { Button, Input, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import { Buttons } from '../../../components/themes/color';
import ShowActiveUsersOfRoomModal from '../../../components/modal/ShowActiveUsersOfRoomModal';

interface ChatRoomProps {
  roomID: string;
  userID: string | undefined;
  onClose: () => void;
}

interface User {
  email: string;
  status: string;
  user_id: string;
}

interface Message {
  id: string;
  userID: string;
  content: string;
  sender: string;
}

interface CurrentChatRoom {
  roomID: string;
  roomName: string;
  createdAt: { seconds: number; nanoseconds: number };
  createdBy: string;
  updatedBy: string;
  messages: { [key: string]: { userID: string; content: string; sender: string } };
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
  
   const currentChatRoom = async () => {
    try {
      const chatRoomRef = collection(firestore, 'chat_room');
      const querySnapshot = await getDocs(
        query(chatRoomRef, where('roomID', '==', roomID))
      );
      querySnapshot.forEach((doc) => {
        const data = doc.data() as CurrentChatRoom;
        setCurrentRoom(data);
        const messagesArray = Object.entries(data.messages || {}).map(([key, value]) => ({
          id: key,
          ...value,
          sender: value.userID
        }));
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

      const newMessage = { userID: actualUserID, content: input, sender: actualUserID };
      
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
            [Date.now()]: {
              userID: newMessage.userID,
              content: newMessage.content,
              sender: newMessage.sender
            }
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
  
  return (
    <ChatRoomContainer>
      <Header>
        <RoomID>{currentRoom && (
          <p>Room : {currentRoom.roomName}</p>
        )}
        </RoomID>
        <ButtonGroup>
          <Button type='primary' onClick={showAllActiveUsers}>Active users</Button>
          <Button type='primary' onClick={onClose}>Close</Button>
        </ButtonGroup>
      </Header>
      
      <Content>
        {messages.map((msg, index) => (
          <Message key={msg.id || index}>
            <strong>{msg.sender}</strong>: {msg.content}
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
  height: 100vh;
  width: 96%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2%;
  background-color: ${Buttons.headerFooter};
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
  background-color: ${Buttons.text};
`;

const Message = styled.div`
  margin-bottom: 10px;
`;

const Footer = styled.div`
  padding: 16px;
  background-color: ${Buttons.headerFooter};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;