import React, { useEffect, useState } from 'react';
import { Avatar, Button, Card, message } from 'antd';
import styled from 'styled-components';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import { useAuth } from '../../../auth/Authentication';

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

const ListAllChatRoom: React.FC = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
        currentUser = { ...data, user_id: doc.id }; // Use the document ID for user_id
      });
      setCurrentUser(currentUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      message.error('Failed to fetch current user');
    }
  };

  const handleJoinButton = async (roomID: string) => {
    if (currentUser) {
      try {
        const updatedRooms = [...currentUser.joined_rooms, roomID];
        const userDocRef = doc(firestore, 'user', currentUser.user_id); // Use user_id as the document ID
        await updateDoc(userDocRef, { joined_rooms: updatedRooms });
        setCurrentUser({ ...currentUser, joined_rooms: updatedRooms });
        message.success('Successfully joined the chat room');
      } catch (error) {
        console.error('Error joining chat room:', error);
        message.error('Failed to join chat room');
      }
    }
  };

  const filteredChatRooms = currentUser ? chatRooms.filter(room => !currentUser?.joined_rooms.includes(room.roomID)) : chatRooms;

  return (
    <Container>
      <StyledCardContainer>
        <CardContainer>
          {filteredChatRooms.map((room, index) => (
            <StyledCard
              key={room.roomID}
              style={{ marginBottom: '16px' }}
            >
              <Meta
                avatar={<Avatar src={url + avatars[index % avatars.length]} />}
                title={
                  <TitleContainer>
                    {room.roomName}
                    <Button type='link' onClick={() => handleJoinButton(room.roomID)}>Join</Button>
                  </TitleContainer>
                }
              />
            </StyledCard>
          ))}
        </CardContainer>
      </StyledCardContainer>
    </Container>
  );
};

export default ListAllChatRoom;

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

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
