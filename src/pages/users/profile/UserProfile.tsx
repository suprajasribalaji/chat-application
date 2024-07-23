import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../config/firebase.config";
import { useAuth } from "../../../auth/Authentication";
import { Descriptions, Spin, Typography, message } from "antd";
import styled from 'styled-components';
import { ColorWhite } from "../../../components/themes/color";
import { User } from "../../../utils/utils";

interface ChatRoom {
  roomID: string;
  roomName: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.email) {
      fetchCurrentUser();
    }
  }, [user]);

  useEffect(() => {
    if (currentUser?.joined_rooms.length) {
      fetchRoomNames(currentUser.joined_rooms);
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const currentUserRef = collection(firestore, 'user');
      const querySnapshot = await getDocs(
        query(currentUserRef, where('email', '==', user?.email))
      );
      let fetchedUser: User | null = null;
      querySnapshot.forEach(doc => {
        const data = doc.data() as User;
        fetchedUser = { ...data };
      });
      setCurrentUser(fetchedUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      message.error('Failed to fetch current user');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomNames = async (roomIDs: string[]) => {
    try {
      const chatRoomsRef = collection(firestore, 'chat_room');
      const roomQuery = query(chatRoomsRef, where('roomID', 'in', roomIDs));
      const querySnapshot = await getDocs(roomQuery);
      const roomNames: Record<string, string> = {};
      querySnapshot.forEach(doc => {
        const data = doc.data() as ChatRoom;
        roomNames[data.roomID] = data.roomName;
      });
      setRoomNames(roomNames);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      message.error('Failed to fetch chat rooms');
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Container>
      {currentUser ? (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>
            <Descriptions.Item label="User ID">{currentUser.user_id}</Descriptions.Item>
            <Descriptions.Item label="Status">{currentUser.status}</Descriptions.Item>
            <Descriptions.Item label="Joined Rooms">
              {currentUser.joined_rooms.length > 0
                ? currentUser.joined_rooms.map(roomID => roomNames[roomID] || roomID).join(', ')
                : 'No joined rooms'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">{currentUser.createdAt.toDate().toLocaleString()}</Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Typography.Text>No user data available.</Typography.Text>
      )}
    </Container>
  );
};

export default UserProfile;

const Container = styled.div`
  padding: 3%;
  margin: 0 auto;
  max-width: 60%;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: ${ColorWhite.primaryWhite};
`;
