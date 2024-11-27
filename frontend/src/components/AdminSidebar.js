import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/AdminSidebar.css';
import Notification from './Notification'; // Assuming you have a Notification component

const AdminSidebar = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile({
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            email: userDoc.data().email,
            profilePicture: userDoc.data().profilePicture || null
          });
        }
      }
    };
    fetchUserProfile();

    // Listen for new replies on posts for notifications
    const q = collection(db, 'posts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((doc) => {
        const post = doc.data();
        if (post.replies && post.replies.length > 0) {
          const latestReply = post.replies[post.replies.length - 1];
          newNotifications.push({
            postId: doc.id,
            content: latestReply.content,
            timestamp: latestReply.timestamp,
          });
        }
      });
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      // Update profile picture URL in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { profilePicture: fileURL });

      // Update profile state to display new image
      setProfile({ ...profile, profilePicture: fileURL });
    }
  };

  const handleNotificationClick = () => {
    setShowNotification(true);
    setUnreadCount(0);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const getUserInitials = () => {
    const { firstName, lastName } = profile;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return '';
  };

  return (
    <div className="admin-sidebar">
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
        <button onClick={() => navigate('/feed')}>Feed</button>
        <button onClick={() => navigate('/admin')}>Create Post</button>
        <button onClick={() => navigate('/contact')}>Contact</button>

        {/* Notification Button with Indicator */}
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
          notificationType="New reply"  // Pass notification type for admin
        />
      )}
    </div>
  );
};

export default AdminSidebar;
