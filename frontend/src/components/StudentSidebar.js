import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc, getDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/StudentSidebar.css';
import Notification from './Notification';

const StudentSidebar = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            profilePicture: data.profilePicture || null,
          });
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Latest posts as notifications
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(newPosts);
      setUnreadCount(newPosts.length);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'users', user.uid), { profilePicture: url });
      setProfile((p) => ({ ...p, profilePicture: url }));
    } catch (e) {
      console.error('Error uploading profile picture:', e);
    }
  };

  const handleNotificationClick = () => { setShowNotification(true); setUnreadCount(0); };
  const handleNotificationClose  = () => setShowNotification(false);

  const handleLogout = async () => {
    try { await auth.signOut(); navigate('/login'); }
    catch (e) { console.error('Logout failed:', e); }
  };

  const handleEditToggle = () => setIsEditing((v) => !v);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const getUserInitials = () => {
    const { firstName, lastName } = profile;
    return firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '';
  };

  return (
    <aside className="student-sidebar">
      <div className="profile-section">
        <input id="upload-student-picture" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        <div className="profile-picture-container" onClick={() => document.getElementById('upload-student-picture').click()}>
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-initials">{getUserInitials()}</div>
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text" name="firstName" value={profile.firstName}
                onChange={handleInputChange} placeholder="First Name"
              />
              <input
                type="text" name="lastName" value={profile.lastName}
                onChange={handleInputChange} placeholder="Last Name"
              />
              <button className="savebutton" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <h3 onClick={handleEditToggle}>{profile.firstName} {profile.lastName}</h3>
              <p className="muted">{profile.email}</p>
            </>
          )}
        </div>
      </div>

      <nav className="menu-links">
        <button onClick={() => navigate('/student')} className="nav-btn">Home</button>
        <button onClick={() => navigate('/contact')} className="nav-btn">Contact</button>

        <button onClick={handleNotificationClick} className="nav-btn notification-button">
          Notifications
          {unreadCount > 0 && <span className="notification-indicator">{unreadCount}</span>}
        </button>

        <button onClick={handleLogout} className="nav-btn logout-button">Logout</button>
      </nav>

      {showNotification && notifications.length > 0 && (
        <Notification
          messages={notifications}
          onClose={handleNotificationClose}
          notificationType="New post"
        />
      )}
    </aside>
  );
};

export default StudentSidebar;
