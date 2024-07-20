import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase.config';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../auth/Authentication';

interface LoginFormProps {
  form: any;
  collectionName: string;
  successMessage: string;
  redirectPath: string;
  formType: 'login' | 'register';
  onRegister?: (values: any) => void;
}

interface User {
  email: string;
  status: string;
  user_id: string;
}

const LoginForm = ({ form, collectionName, successMessage, redirectPath, formType, onRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const { user, userLogin } = useAuth(); 

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      const { email, password } = values;
      const collectionRef = collection(firestore, collectionName);
      const querySnapshot = await getDocs(
        query(collectionRef, where('email', '==', email), where('password', '==', password))
      );

      if (!querySnapshot.empty) {
        const userData = { id: querySnapshot.docs[0].id, email }; 
        userLogin(userData);  // Set the user context here
        const usersRef = collection(firestore, 'user');
        const userQuerySnapshot = await getDocs(usersRef);
        userQuerySnapshot.forEach(async (snapshot) => {
          const userData = snapshot.data() as User;
          if (userData.email === email) {
            await updateDoc(doc(usersRef, snapshot.id), { status: 'online' });
            console.log('Status changed successfully');
          }
        });
        message.success(successMessage);
        navigate(redirectPath);
      } else {
        message.error('Invalid email or password');
        console.log('Invalid email or password');
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message);
    }
  };

  const handleSubmit = async () => {
    if (formType === 'login') {
      handleLogin();
    } else if (formType === 'register' && onRegister) {
      try {
        const values = await form.validateFields();
        onRegister(values);
      } catch (error) {
        console.error('Error registering:', error);
      }
    }
  };

  const emailRules = [
    { required: true, message: 'Please input your Email!' },
    { type: 'email', message: 'Please enter a valid email address' } as const,
  ];

  const passwordRules = [
    { required: true, message: 'Please input your Password!' },
    { min: 6, message: 'Password must be at least 6 characters long' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, message: 'Password must contain at least a letter, number, special character' } as const,
  ];

  return (
    <StyledForm
      form={form}
      name="login_form"
      initialValues={{ remember: true }}
      onFinish={handleSubmit}
    >
      {formType === 'register' && (
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
          />
        </Form.Item>
      )}
      <Form.Item
        name="email"
        rules={emailRules}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Enter Your Email"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={passwordRules}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
        />
      </Form.Item>
      {formType === 'register' && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      )}
      {formType === 'login' && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      )}
    </StyledForm>
  );
};

export default LoginForm;

const StyledForm = styled(Form)`
  width: 100%;
`;
