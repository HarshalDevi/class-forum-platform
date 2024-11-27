import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import '../styles/Auth.css';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({});
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setUserInfo(userDoc.data());
    };

    fetchUserProfile();
  }, [user]);

  const handleUpdate = async () => {
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      ...userInfo
    });
  };

  return (
    <div className="user-profile">
      <h2>Profile</h2>
      <input 
        type="text" 
        value={userInfo.name || ''} 
        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} 
      />
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
};

export default UserProfile;
