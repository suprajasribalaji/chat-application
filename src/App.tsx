import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/auth/Authentication';
import UserLogin from './pages/Login';
import UserHome from './pages/users/index';
import AdminHome from './pages/admin/index';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path='/home' element={<UserHome />} />
          <Route path='/admin' element={<AdminHome />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
