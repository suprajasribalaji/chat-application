import { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../src/config/firebase.config";
import { Spin } from 'antd';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import Home from './pages/Home';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        setUser(true);
        setLoading(false);
      } else {
        setUser(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthRoute element={<Login />} />} />
        <Route path="/signup" element={<AuthRoute element={<SignUp />} />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      </Routes>
    </Router>
  );

  function AuthRoute({ element }: { element: ReactElement }) {
    return user ? <Navigate to="/dashboard" /> : element;
  }

  function ProtectedRoute({ element }: { element: ReactElement }) {
    return user ? element : <Navigate to="/" />;
  }
}

export default App;