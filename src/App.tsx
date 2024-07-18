import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/auth/Authentication';
import UserLogin from './pages/Login';
import Home from './pages/Home';
import AdminHome from './pages/admin/index';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path='/home' element={<Home />} />
          <Route path='/admin' element={<AdminHome />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
