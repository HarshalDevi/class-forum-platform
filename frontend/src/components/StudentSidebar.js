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
      if (user) {
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
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Fetch posts sorted by timestamp for notifications about new posts
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(newPosts);
      setUnreadCount(newPosts.length);
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      try {
        const fileRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { profilePicture: fileURL });

        setProfile((prevProfile) => ({
          ...prevProfile,
          profilePicture: fileURL,
        }));
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const handleNotificationClick = () => {
    setShowNotification(true);
    setUnreadCount(0);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const getUserInitials = () => {
    const { firstName, lastName } = profile;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return '';
  };

  return (
    <div className="student-sidebar">
      <div className="profile-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="upload-picture"
        />
        <div 
          htmlFor="upload-picture" 
          className="profile-picture-container"
          onClick={() => document.getElementById('upload-picture').click()}
        >
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-initials">
              {getUserInitials()}
            </div>
          )}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
              />
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
              <button className="savebutton" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <h3 onClick={handleEditToggle}>
                {profile.firstName} {profile.lastName}
              </h3>
              <p>{profile.email}</p>
            </>
          )}
        </div>
      </div>

      <div className="menu-links">
        <button onClick={() => navigate('/student')}>Home</button>
        <button onClick={() => navigate('/contact')}>Contact</button>

        <button onClick={handleNotificationClick} className="notification-button">
          Notifications
          {unreadCount > 0 && <span className="notification-indicator">{unreadCount}</span>}
        </button>

        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {/* Notification Component */}
      {showNotification && notifications.length > 0 && (
        <Notification
          messages={notifications}
          onClose={handleNotificationClose}
          notificationType="New post" // Pass notification type for student
        />
      )}
    </div>
  );
};

export default StudentSidebar;
