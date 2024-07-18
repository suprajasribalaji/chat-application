// CreateChatRoomModal.tsx
import { Form, Input, message, Modal } from "antd";
import { collection, addDoc, where, query, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase.config";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

interface CreateChatRoomModalProps {
    form: any,
    isNewRoomModalOpen: boolean,
    setIsNewRoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    fetchChatRooms: () => Promise<void>,
};

const CreateChatRoomModal = ({ form, isNewRoomModalOpen, setIsNewRoomModalOpen, fetchChatRooms }: CreateChatRoomModalProps) => {
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (!await isValidAdminId(values.createdBy)) {
                message.error('Invalid admin ID! Please provide your admin id!');
                return;
            }

            const newRoom = {
                roomName: values.roomName,
                createdBy: values.createdBy,
                createdAt: moment().format('MMM DD, YYYY, hh:mm:ss.SSS A'),
                updatedBy: "",
                roomID: uuidv4()
            };

            const chatRoomsRef = collection(firestore, 'chat_room');
            await addDoc(chatRoomsRef, newRoom);
            message.success('Chat room created successfully');
            fetchChatRooms();
            setIsNewRoomModalOpen(false);
        } catch (error) {
            console.error('Error creating chat room:', error);
            message.error('Failed to create chat room');
        }
    };

    const handleModalCancel = () => {
        setIsNewRoomModalOpen(false);
    };

    const isValidAdminId = async (adminId: string) => {
        try {
            const adminRef = collection(firestore, 'admin');
            const q = query(adminRef, where('id', '==', adminId));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking admin ID:', error);
            return false;
        }
    };

    return (
        <Modal
            title="Create New Room"
            visible={isNewRoomModalOpen}
            okText="Create Room"
            onOk={handleModalOk}
            onCancel={handleModalCancel}
        >
            <Form form={form} layout="vertical" name="create_chat_room">
                <Form.Item
                    name="roomName"
                    label="Room Name"
                    rules={[{ required: true, message: 'Please input the chat room name!' }]}
                >
                    <Input placeholder="Enter room name"/>
                </Form.Item>
                <Form.Item
                    name="createdBy"
                    label="Created By"
                    rules={[{ required: true, message: 'Please input your admin id!' }]}
                >
                    <Input placeholder="Enter your admin id"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateChatRoomModal;
