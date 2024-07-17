import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/Authentication';

import UserLogin from './pages/Login.js';
import Home from './pages/Home.js';
 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;