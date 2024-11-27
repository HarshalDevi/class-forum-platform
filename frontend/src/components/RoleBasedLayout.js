import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import StudentSidebar from './StudentSidebar';
import AdminSidebar from './AdminSidebar';
import '../styles/RoleBasedLayout.css';

const RoleBasedLayout = ({ children }) => {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  return (
    <div className="role-based-layout">
      {role === 'admin' && <AdminSidebar />}
      {role === 'student' && <StudentSidebar />}
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default RoleBasedLayout;
