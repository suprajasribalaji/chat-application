import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase.config';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface LoginFormProps {
  form: any; // Form instance type
  collectionName: string;
  successMessage: string;
  redirectPath: string;
  formType: 'login' | 'register';
  onRegister?: (values: any) => void;
}

const LoginForm = ({ form, collectionName, successMessage, redirectPath, formType, onRegister }: LoginFormProps) => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      const { email, password } = values;
      const collectionRef = collection(firestore, collectionName);
      const querySnapshot = await getDocs(
        query(collectionRef, where('email', '==', email), where('password', '==', password))
      );

      if (!querySnapshot.empty) {
        message.success(successMessage);
        navigate(redirectPath);
        console.log(successMessage);
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
        rules={[{ required: true, message: 'Please input your Email!' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Enter Your Email"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
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
