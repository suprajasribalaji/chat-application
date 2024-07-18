import React, { useEffect, useState } from 'react';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, message, Popconfirm, Form } from 'antd';
import styled from 'styled-components';
import { Buttons } from '../../../components/themes/color';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import EditChatRoomModal from '../../../components/modal/EditChatRoomModal';
import CreateChatRoomModal from '../../../components/modal/CreateChatRoomModal';

const { Meta } = Card;

interface ChatRoom {
    roomID: number;
    roomName: string;
    createdBy: string;
    updatedBy?: string;
}

const url = 'https://api.dicebear.com/9.x/bottts/svg?seed=';

const avatars = [
    'Milo','Muffin','Willow','Bella','Callie','Snuggles','George','Jack','Sugar','Midnight','Dusty','Zoey',
    'Toby','Cuddles','Buster','Smokey','Snickers','Chester','Kitty','Gizmo',
];

const ChatRoom: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState<boolean>(false);
    const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState<boolean>(false);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchChatRooms();
    }, []);
    
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

    const handleDeleteButton = async(roomID: number, createdBy: string) => {
        try {
            const chatRoomsRef = collection(firestore, 'chat_room');
            const querySnapshot = await getDocs(chatRoomsRef);
            querySnapshot.forEach(async (snapshot) => {
                const roomData = snapshot.data() as ChatRoom;
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

    const handleEditButton = (room: ChatRoom) => {
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
                <CreateButton type='primary' icon={<PlusCircleOutlined />} onClick={handleCreateNewRoomButton}>New Room</CreateButton>
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

const CreateButton = styled(Button)`
    // Uncomment and customize if needed
    // background-color: ${Buttons.backgroundColor};
    // color: ${Buttons.text};
    // border: none;
    // &&&:hover {
    //     color: ${Buttons.hover};
    // }
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
