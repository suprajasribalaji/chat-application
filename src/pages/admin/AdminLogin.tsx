import { useState } from 'react';
import { firestore } from '../../config/firebase.config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const collectionRef = collection(firestore, 'admin');

    try {
      const querySnapshot = await getDocs(
        query(collectionRef, where('Email', '==', email), where('Password', '==', password))
      );

      if (!querySnapshot.empty) {
        message.success('User logged in successfully');
        navigate('/usertest');
      } else {
        message.error('Invalid email or password');
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message);
    }
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input Email id!',
            },
          ]}
        >
          <Input onChange={(e) => setEmail(e.target.value)} />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <Input.Password onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" onClick={handleLogin}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminLogin;
