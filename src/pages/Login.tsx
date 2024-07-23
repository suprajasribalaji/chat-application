import { useState } from 'react';
import { firestore } from '../config/firebase.config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { Button, Form, Modal, Tabs, message } from 'antd';
import styled from 'styled-components';
import Title from 'antd/es/typography/Title';
import LoginForm from '../components/form/LoginForm';
import { ColorBlack, ColorBlue } from '../components/themes/color';
import BackgroundImage from '../assets/images/bg-img.jpg';

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
        <StyledTitle level={2} style={{ textAlign: 'center' }}>
          LOGIN
        </StyledTitle>
        <StyledTabs defaultActiveKey="1">
          <StyledTabPane tab="User" key="1">
            <LoginForm
              form={form}
              collectionName="user"
              successMessage="User logged in successfully"
              redirectPath="/home"
              formType="login"
            />
            <Form.Item>
              Already a user?
              <StyledButton type="link" onClick={() => setOpen(true)}>
                Create One!
              </StyledButton>
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
          </StyledTabPane>
          <StyledTabPane tab="Admin" key="2">
            <LoginForm
              form={form}
              collectionName="admin"
              successMessage="Admin logged in successfully"
              redirectPath="/admin"
              formType="login"
            />
          </StyledTabPane>
        </StyledTabs>
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
  color: ${ColorBlue.deepSeaBlue};
  background-image: url(${BackgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const StyledFormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: ${ColorBlue.lightGrayBlue};
  box-shadow: 0 0 10px ${ColorBlack.transparent1Black};
  border-radius: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${ColorBlue.deepSeaBlue};
`;

const StyledButton = styled(Button)`
color: ${ColorBlue.deepSeaBlue} !important;
&:hover {
  color: ${ColorBlue.transparent25DeepSeaBlue} !important;
}
&:focus, &:active {
  color: ${ColorBlue.transparent25DeepSeaBlue} !important;
  outline: none !important;
  box-shadow: none !important;
}
`;

const StyledTitle = styled(Title)`
  color: ${ColorBlue.deepSeaBlue} !important;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    .ant-tabs-tab {
      color: ${ColorBlue.deepSeaBlue} !important;
      &:hover {
        color: ${ColorBlue.transparent25DeepSeaBlue} !important;
      }
      &.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: ${ColorBlue.deepSeaBlue} !important;
      }
      &:focus, &:active {
        color: ${ColorBlue.transparent25DeepSeaBlue} !important;
        outline: none !important;
        box-shadow: none !important;
      }
    }
    .ant-tabs-ink-bar {
      background-color: ${ColorBlue.deepSeaBlue} !important;
    }
  }
`;

const StyledTabPane = styled(TabPane)`
  color: ${ColorBlue.deepSeaBlue} !important;
  .ant-form-item {
    color: ${ColorBlue.deepSeaBlue} !important;
  }
`;
