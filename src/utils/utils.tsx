import { Timestamp } from "firebase/firestore";

export  interface User {
    email: string;
    status: string;
    user_id: string;
    createdAt: Timestamp;
    joined_rooms: Array<string>;   
    joined_rooms_names?: Array<string>;
};

export interface ChatRooms {
    roomID: string;
    roomName: string;
    createdBy: string;
    updatedBy?: string;
};

export interface CurrentChatRoom {
    roomID: string;
    roomName: string;
    createdAt: { seconds: number; nanoseconds: number };
    createdBy: string;
    updatedBy: string;
    messages: { [key: string]: { userID: string; content: string; sender: string; timestamp: number } };
};