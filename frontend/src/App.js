import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import Contact from './components/Contact';
import FeedPage from './components/FeedPage';
import { auth, db } from './firebase/firebaseConfig';
import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      } else {
        setRole(null); // Reset role if user is not logged in
      }
      setRoleLoading(false);
    };

    fetchUserRole();
  }, [user]);

  // Handle redirection after login based on role
  useEffect(() => {
    if (!loading && !roleLoading) {
      if (user && role) {
        if (role === 'admin' && location.pathname === '/login') {
          navigate('/admin', { replace: true });
        } else if (role === 'student' && location.pathname === '/login') {
          navigate('/student', { replace: true });
        }
      } else if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', { replace: true });
      }
    }
  }, [user, role, loading, roleLoading, location.pathname, navigate]);

  if (loading || roleLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const AdminRoutes = () => (
    <>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/createPost" element={<AdminDashboard />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </>
  );

  const StudentRoutes = () => (
    <>
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/" element={<Navigate to="/student" replace />} />
    </>
  );

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/contact" element={<Contact />} />

        {/* Admin Routes */}
        {role === 'admin' && AdminRoutes()}

        {/* Student Routes */}
        {role === 'student' && StudentRoutes()}

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to={user ? location.pathname : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
