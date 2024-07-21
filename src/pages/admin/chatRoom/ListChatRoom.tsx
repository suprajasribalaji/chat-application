import React, { useEffect, useState } from 'react';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, message, Popconfirm, Form } from 'antd';
import styled from 'styled-components';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import EditChatRoomModal from '../../../components/modal/EditChatRoomModal';
import CreateChatRoomModal from '../../../components/modal/CreateChatRoomModal';
import { ChatRooms } from '../../../utils/utils';

const { Meta } = Card;

const url = 'https://api.dicebear.com/9.x/bottts/svg?seed=';

const avatars = [
    'Milo','Muffin','Willow','Bella','Callie','Snuggles','George','Jack','Sugar','Midnight','Dusty','Zoey',
    'Toby','Cuddles','Buster','Smokey','Snickers','Chester','Kitty','Gizmo',
];

const ChatRoom: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRooms[]>([]);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState<boolean>(false);
    const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
    const [selectedRoom, setSelectedRoom] = useState<ChatRooms | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchChatRooms();
    }, []);
    
    const fetchChatRooms = async () => {
        try {
            const chatRoomsRef = collection(firestore, 'chat_room');
            const snapshot = await getDocs(chatRoomsRef);
            const chatRooms: ChatRooms[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as ChatRooms;
                chatRooms.push({ ...data });
            });
            setChatRooms(chatRooms);
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
            message.error('Failed to fetch chat rooms');
        }
    };

    const handleDeleteButton = async(roomID: string, createdBy: string) => {
        try {
            const chatRoomsRef = collection(firestore, 'chat_room');
            const querySnapshot = await getDocs(chatRoomsRef);
            querySnapshot.forEach(async (snapshot) => {
                const roomData = snapshot.data() as ChatRooms;
                if (roomData.roomID === roomID && roomData.createdBy === createdBy) {
                    await deleteDoc(doc(chatRoomsRef, snapshot.id));
                    message.success('Chat room deleted successfully');
                    fetchChatRooms();
                }
            });
        } catch (error) {
            console.error('Error deleting chat room:', error);
            message.error('Failed to delete chat room');
        }
    };

    const handleEditButton = (room: ChatRooms) => {
        setSelectedRoom(room);
        form.setFieldsValue({ roomName: room.roomName, createdBy: room.createdBy, updatedBy: room?.updatedBy });
        setIsEditRoomModalOpen(true);
    };

    const handleCreateNewRoomButton = () => {
        setIsNewRoomModalOpen(true);
    };

    return (
        <Container>
            <Header>
                <Button type='primary' icon={<PlusCircleOutlined />} onClick={handleCreateNewRoomButton}>New Room</Button>
            </Header>
            <StyledCardContainer>
                <CardContainer>
                    {chatRooms.map((room, index) => (
                        <StyledCard
                            key={room.roomID}
                            style={{ marginBottom: '16px' }}
                            actions={[
                                <Popconfirm
                                    title="Are you sure to delete this chat room?"
                                    onConfirm={() => handleDeleteButton(room.roomID, room.createdBy)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="link" danger icon={<DeleteOutlined />} />
                                </Popconfirm>,
                                <Button type='link' onClick={() => handleEditButton(room)} icon={<EditOutlined />} />
                            ]}
                        >
                            <Meta
                                avatar={<Avatar src={url + avatars[index % avatars.length]} />}
                                title={room.roomName}
                                description={
                                    <>
                                    {`Created by ${room.createdBy}`} <br/>
                                    {`${room.updatedBy ? `Updated by ${room.updatedBy}` : ''}`}
                                    </>
                                }
                            />
                        </StyledCard>
                    ))}
                </CardContainer>
            </StyledCardContainer>
            <CreateChatRoomModal
                form={form}
                isNewRoomModalOpen={isNewRoomModalOpen}
                setIsNewRoomModalOpen={setIsNewRoomModalOpen}
                fetchChatRooms={fetchChatRooms}
            />
            <EditChatRoomModal
                form={form}
                isEditRoomModalOpen={isEditRoomModalOpen}
                selectedRoom={selectedRoom}
                setIsEditRoomModalOpen={setIsEditRoomModalOpen}
                fetchChatRooms={fetchChatRooms}
            />
        </Container>
    );
};

export default ChatRoom;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Header = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 2%;
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
