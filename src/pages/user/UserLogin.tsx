import { useState } from 'react';
import { firestore } from '../../config/firebase.config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../components/auth/Authentication';

const { Option } = Select;

const prefixSelector = (
  <Form.Item name="prefix" noStyle>
    <Select>
      <Option value="86">+86</Option>
      <Option value="87">+87</Option>
      <Option value="91">+91</Option>
    </Select>
  </Form.Item>
);

const CollectionCreateForm = ({ open, Adduser, onCancel }: { open: boolean, Adduser: (values: any) => void, onCancel: () => void }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={open}
      title="Create a new account"
      okText="Register"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            console.log(values);
            Adduser(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        name="register"
        initialValues={{
          prefix: '91',
        }}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: 'Please input your username!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: 'Please input your phone number!',
            },
          ]}
        >
          <Input addonBefore={prefixSelector} />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[
            {
              required: true,
              message: 'Please select gender!',
            },
          ]}
        >
          <Select placeholder="Select your gender">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Not Interested to Disclose</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const UserLogin = () => {
  const navigate = useNavigate();
//   const { userLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const Adduser = async (values: any) => {
    const { username, confirm, phone, gender, email } = values;
    if (values) {
      try {
        const collectionRef = collection(firestore, 'PatientsDB');
        const res = await addDoc(collectionRef, {
          Email: email,
          Gender: gender,
          Username: username,
          Phone_number: phone,
          Password: confirm,
        });
        console.log('User added successfully!', res);
      } catch (error: any) {
        console.error('Error adding user: ', error);
      }

      message.success('Account created successfully! Please login to continue');
      setOpen(false);
    } else {
      message.error('Account creation failed! Please try again by filling all fields correctly');
    }
  };

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
  };

  const handleLogin = async () => {
    const collectionRef = collection(firestore, 'PatientsDB');

    try {
      const querySnapshot = await getDocs(
        query(collectionRef, where('Email', '==', email), where('Password', '==', password))
      );

      if (!querySnapshot.empty) {
        message.success('User logged in successfully');

        navigate('/home');

        console.log('User logged in successfully');
      } else {
        message.error('Invalid email or password');
        console.log('Invalid email or password');
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your Email!',
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter Your Mail Id" onChange={(e) => setEmail(e.target.value)} />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleLogin}>
            Log in
          </Button>
        </Form.Item>

        <Form.Item>
          Don't have an account?
          <Button type="link" onClick={() => setOpen(true)}>
            Register Now!
          </Button>
          <CollectionCreateForm
            open={open}
            Adduser={Adduser}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserLogin;
