import { Form, Input, message, Modal } from "antd";
import { collection, doc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { firestore } from "../../config/firebase.config";

interface ChatRoom {
    roomID: number;
    roomName: string;
    createdBy: string;
    updatedBy?: string;
}

interface EditChatRoomProps {
    form: any,
    isEditRoomModalOpen: boolean,
    selectedRoom: ChatRoom | null,
    setIsEditRoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    fetchChatRooms: () => Promise<void>,
};

const EditChatRoomModal = ({ form, isEditRoomModalOpen, selectedRoom, setIsEditRoomModalOpen, fetchChatRooms }: EditChatRoomProps) => { 
    const handleModalOk = async () => {
        try {
            if (selectedRoom) {
                const newAdminID = form.getFieldValue('updatedBy');
                const adminRef = collection(firestore, 'admin');
                const adminQuery = query(adminRef, where('id', '==', newAdminID));
                const adminSnapshot = await getDocs(adminQuery);

                if (adminSnapshot.empty) {
                    message.error('Admin ID not found');
                    return;
                }

                const updatedRoom = {
                    ...selectedRoom,
                    roomName: form.getFieldValue('roomName'),
                    createdBy: form.getFieldValue('createdBy'),
                    updatedBy: newAdminID
                };

                const chatRoomsRef = collection(firestore, 'chat_room');
                const querySnapshot = await getDocs(chatRoomsRef);
                querySnapshot.forEach(async (snapshot) => {
                    const roomData = snapshot.data() as ChatRoom;
                    if (roomData.roomID === selectedRoom.roomID && roomData.createdBy === selectedRoom.createdBy) {
                        await updateDoc(doc(chatRoomsRef, snapshot.id), updatedRoom);
                        message.success('Chat room updated successfully');
                        fetchChatRooms();
                        setIsEditRoomModalOpen(false);
                    }
                });
            }
        } catch (error) {
            console.error('Error updating chat room:', error);
            message.error('Failed to update chat room');
        }
    };

    const handleModalCancel = () => {
        setIsEditRoomModalOpen(false);
    };

    return (
        <Modal
            title="Edit Chat Room"
            visible={isEditRoomModalOpen}
            okText="Edit Room"
            onOk={handleModalOk}
            onCancel={handleModalCancel}
        >
            <Form form={form} layout="vertical" name="edit_chat_room">
                <Form.Item
                    name="roomName"
                    label="Chat Room Name"
                    rules={[{ required: true, message: 'Please input the chat room name!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="createdBy"
                    label="Created By"
                    rules={[{ required: true }]}
                >
                    <Input disabled/>
                </Form.Item>
                <Form.Item
                    name="updatedBy"
                    label="Updated By"
                    rules={[{ required: true, message: 'Please input your adminID!' }]}
                >
                    <Input placeholder="Please provide your adminID"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditChatRoomModal;
