import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, message, Popconfirm } from 'antd';
import { ExportOutlined, DeleteRowOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import { useAuth } from '../../../auth/Authentication';
import ChatRoom from './ChatRoom';

const { Meta } = Card;

interface ChatRoom {
  roomID: string;
  roomName: string;
  createdBy: string;
  updatedBy?: string;
}

interface User {
  email: string;
  user_id: string;
  joined_rooms: Array<string>;
}

const url = 'https://api.dicebear.com/9.x/bottts/svg?seed=';

const avatars = [
  'Milo', 'Muffin', 'Willow', 'Bella', 'Callie', 'Snuggles', 'George', 'Jack', 'Sugar', 'Midnight', 'Dusty', 'Zoey',
  'Toby', 'Cuddles', 'Buster', 'Smokey', 'Snickers', 'Chester', 'Kitty', 'Gizmo',
];

const ListJoinedChatRoom: React.FC = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRoomID, setSelectedRoomID] = useState<string | null>(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchCurrentUser();
    }
  }, [user]);

  const fetchChatRooms = async () => {
    try {
      const chatRoomsRef = collection(firestore, 'chat_room');
      const snapshot = await getDocs(chatRoomsRef);
      const chatRooms: ChatRoom[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as ChatRoom;
        chatRooms.push({ ...data });
      });
      setChatRooms(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      message.error('Failed to fetch chat rooms');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const currentUserRef = collection(firestore, 'user');
      const querySnapshot = await getDocs(
        query(currentUserRef, where('email', '==', user?.email))
      );
      let currentUser: User | null = null;
      querySnapshot.forEach(doc => {
        const data = doc.data() as User;
        currentUser = { ...data, user_id: doc.id };
      });
      setCurrentUser(currentUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      message.error('Failed to fetch current user');
    }
  };

  const filteredChatRooms = currentUser ? chatRooms.filter(room => currentUser.joined_rooms.includes(room.roomID)) : chatRooms;

  const handleLeaveButton = async (roomID: string) => {
    if (currentUser) {
      try {
        const updatedRooms = currentUser.joined_rooms.filter(id => id !== roomID);
        const userDocRef = doc(firestore, 'user', currentUser.user_id);
        await updateDoc(userDocRef, { joined_rooms: updatedRooms });
        setCurrentUser({ ...currentUser, joined_rooms: updatedRooms });
        message.success('Successfully left the chat room');
      } catch (error) {
        console.error('Error leaving chat room:', error);
        message.error('Failed to leave chat room');
      }
    }
  };

  const handleEnterButton = (roomID: string) => {
    setSelectedRoomID(roomID);
  };

  const handleCloseChatRoom = () => {
    setSelectedRoomID(null);
  };

  return (
    <Container>
      {selectedRoomID ? (
        <ChatRoom roomID={selectedRoomID} onClose={handleCloseChatRoom} />
      ) : (
        <StyledCardContainer>
          {filteredChatRooms.length > 0 ? (
            <CardContainer>
              {filteredChatRooms.map((room, index) => (
                <StyledCard
                  key={room.roomID}
                  style={{ marginBottom: '16px' }}
                  actions={[
                    <Popconfirm
                      title="Are you sure you want to leave this chat room?"
                      onConfirm={() => handleLeaveButton(room.roomID)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger icon={<DeleteRowOutlined />}>Leave</Button>
                    </Popconfirm>,
                    <Button type='link' icon={<ExportOutlined />} onClick={() => handleEnterButton(room.roomID)}>Enter</Button>
                  ]}
                >
                  <Meta
                    avatar={<Avatar src={url + avatars[index % avatars.length]} />}
                    title={room.roomName}
                  />
                </StyledCard>
              ))}
            </CardContainer>
          ) : (
            <p>Still you're not joined in any rooms!</p>
          )}
        </StyledCardContainer>
      )}
    </Container>
  );
};

export default ListJoinedChatRoom;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledCardContainer = styled.div`
  width: 100%;
  max-width: 98%;
  padding: 3%;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 2%;
`;

const StyledCard = styled(Card)`
  width: calc(30% - 7%);
`;