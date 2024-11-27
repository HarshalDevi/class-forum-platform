import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error("Logout failed: ", error);
      });
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;
