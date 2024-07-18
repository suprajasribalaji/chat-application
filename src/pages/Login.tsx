import { useState } from 'react';
import { firestore } from '../config/firebase.config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Button, Form, Modal, Tabs, message } from 'antd';
import styled from 'styled-components';
import Title from 'antd/es/typography/Title';
import LoginForm from '../components/form/LoginForm';

const { TabPane } = Tabs;

const UserLogin = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const AddNewuser = async (values: any) => {
    const { username, password, email } = values;
    if (values) {
      const collectionRef = collection(firestore, 'user');
      const querySnapshot = await getDocs(query(collectionRef, where('email', '==', email)));

      if (!querySnapshot.empty) {
        message.error('Already an user! Use different email-id!!');
        return;
      }

      try {
        const res = await addDoc(collectionRef, {
          user_id: username,
          email: email,
          password: password,
        });
        console.log('User added successfully!', res);
        message.success('Account created successfully! Please login to continue');
        form.resetFields();
      } catch (error: any) {
        console.error('Error adding user: ', error);
        message.error('Account creation failed! Please try again by filling all fields correctly');
      }
      setOpen(false);
    }
  };

  return (
    <StyledContainer>
      <StyledFormContainer>
        <Title level={2} style={{ textAlign: 'center' }}>
          LOGIN
        </Title>
        <Tabs defaultActiveKey="1">
          <TabPane tab="User" key="1">
            <LoginForm
              form={form} 
              collectionName="user"
              successMessage="User logged in successfully"
              redirectPath="/home"
              formType="login"
            />
            <Form.Item>
              Already a user?
              <Button type="link" onClick={() => setOpen(true)}>
                Create One!
              </Button>
              <Modal
                visible={open}
                title="Create New Account!"
                onCancel={() => setOpen(false)}
                footer={null}
              >
                <LoginForm
                  form={form} 
                  collectionName="user"
                  successMessage="User registered successfully"
                  redirectPath="/home"
                  formType="register"
                  onRegister={AddNewuser}
                />
              </Modal>
            </Form.Item>
          </TabPane>
          <TabPane tab="Admin" key="2">
            <LoginForm
              form={form} 
              collectionName="admin"
              successMessage="Admin logged in successfully"
              redirectPath="/admin"
              formType="login"
            />
          </TabPane>
        </Tabs>
      </StyledFormContainer>
    </StyledContainer>
  );
};

export default UserLogin;

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const StyledFormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
