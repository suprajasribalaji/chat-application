import React, { useEffect, useState } from 'react';
import { Table, Space, message, Button, Popconfirm } from 'antd';
import styled from 'styled-components';
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { firestore } from '../../../config/firebase.config';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

interface User {
    user_id: number;
    email: string;
    createdAt: Timestamp;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
        user_id: 100,
        email: 250,
        createdAt: 150,
        actions: 100,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(firestore, 'user');
            const snapshot = await getDocs(usersRef);
            const fetchedUsers: User[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as User;
                fetchedUsers.push({ ...data });
            });
            setUsers(fetchedUsers);
            updateColumnWidths(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to fetch users');
        }
    };

    const handleDelete = async (email: string) => {
        try {
            const usersRef = collection(firestore, 'user');
            const querySnapshot = await getDocs(usersRef);
            querySnapshot.forEach(async (snapshot) => {
                const userData = snapshot.data() as User;
                if (userData.email === email) {
                    await deleteDoc(doc(usersRef, snapshot.id));
                    message.success('User deleted successfully');
                    fetchUsers();
                }
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to delete user');
        }
    };

    const updateColumnWidths = (users: User[]) => {
        let maxUserIdWidth = 100;
        let maxEmailWidth = 250;

        users.forEach(user => {
            maxEmailWidth = Math.max(maxEmailWidth, user.email.length * 8); // Assume 8px per character for email width
        });

        setColumnWidths({
            user_id: maxUserIdWidth,
            email: maxEmailWidth + 50,
            createdAt: 150,
            actions: 100,
        });
    };

    const columns: ColumnsType<User> = [
        {
            title: 'User ID',
            dataIndex: 'user_id',
            key: 'user_id',
            align: 'center',
            width: columnWidths.user_id,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
            width: columnWidths.email,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: columnWidths.createdAt,
            render: (createdAt: Timestamp) => moment(createdAt.toDate()).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: columnWidths.actions,
            render: (record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Are you sure to delete this user?"
                        onConfirm={() => handleDelete(record.email)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Container>
            <TableContainer>
                <Table
                    columns={columns}
                    dataSource={users.map((user) => ({
                        key: user.user_id,
                        user_id: user.user_id,
                        email: user.email,
                        createdAt: user.createdAt,
                    }))}
                />
            </TableContainer>
        </Container>
    );
};

export default Users;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const TableContainer = styled.div`
    width: 100%;
    min-width: 50%;
    max-width: 90%;
    padding-top: 2.5%;
    padding-bottom: 2%;
`