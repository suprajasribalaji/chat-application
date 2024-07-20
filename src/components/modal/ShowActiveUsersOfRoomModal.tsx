import React from 'react';
import { Modal, List } from 'antd';
import styled from 'styled-components';

interface User {
  email: string;
  user_id: string;
}

interface ActiveUsersModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  users: User[];
}

const UserList: React.FC<{ dataSource: User[] }> = ({ dataSource }) => (
  <List
    itemLayout="horizontal"
    dataSource={dataSource}
    renderItem={(item: User) => (
      <List.Item>
        <List.Item.Meta
          title={item.user_id}
          description={item.email}
        />
      </List.Item>
    )}
  />
);

const StyledUserList = styled(UserList)`
  .ant-list-item {
    border-bottom: 1px solid #f0f0f0;
  }
  .ant-list-item-meta-title {
    font-size: 16px;
  }
  .ant-list-item-meta-description {
    color: #1890ff;
  }
`;

const ShowActiveUsersOfRoomModal: React.FC<ActiveUsersModalProps> = ({ visible, onOk, onCancel, users }) => {
  return (
    <Modal
      title="Active Users"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <StyledUserList dataSource={users} />
    </Modal>
  );
};

export default ShowActiveUsersOfRoomModal;