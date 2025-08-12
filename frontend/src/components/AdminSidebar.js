import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/AdminSidebar.css';
import Notification from './Notification';

const AdminSidebar = () => {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', profilePicture: null });
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const d = userDoc.data();
        setProfile({
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          profilePicture: d.profilePicture || null
        });
      }
    };
    fetchUserProfile();

    const q = collection(db, 'posts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifs = [];
      snapshot.forEach((s) => {
        const post = s.data();
        if (post.replies?.length) {
          const r = post.replies[post.replies.length - 1];
          newNotifs.push({ postId: s.id, content: r.content, timestamp: r.timestamp });
        }
      });
      setNotifications(newNotifs);
      setUnreadCount(newNotifs.length);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
    setIsEditing(false);
  };

  const getUserInitials = () => {
    const { firstName, lastName } = profile;
    return firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '';
  };

  const is = (p) => location.pathname === p;

  return (
    <aside className="admin-sidebar">
      <div className="profile-section">
        <input type="file" accept="image/*" onChange={async (e) => {
          const file = e.target.files[0];
          if (!file || !user) return;
          const fileRef = ref(storage, `profilePictures/${user.uid}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          await updateDoc(doc(db, 'users', user.uid), { profilePicture: url });
          setProfile((p) => ({ ...p, profilePicture: url }));
        }} id="upload-picture" style={{ display: 'none' }} />

        <div className="profile-picture-container" onClick={() => document.getElementById('upload-picture').click()}>
          {profile.profilePicture
            ? <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
            : <div className="profile-initials">{getUserInitials()}</div>}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="First Name"
              />
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Last Name"
              />
              <button className="savebutton" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <h3 onClick={() => setIsEditing(true)}>{profile.firstName} {profile.lastName}</h3>
              <p className="muted">{profile.email}</p>
            </>
          )}
        </div>
      </div>

      <nav className="menu-links">
        <button onClick={() => navigate('/feed')}     className={`nav-btn ${is('/feed') ? 'is-active' : ''}`}>Feed</button>
        <button onClick={() => navigate('/admin')}    className={`nav-btn ${is('/admin') ? 'is-active' : ''}`}>Create Post</button>
        <button onClick={() => navigate('/contact')}  className={`nav-btn ${is('/contact') ? 'is-active' : ''}`}>Contact</button>

        {/* label fix: removed stray backtick */}
        <button onClick={() => { setShowNotification(true); setUnreadCount(0); }} className="nav-btn notification-button">
          Notifications
          {unreadCount > 0 && <span className="notification-indicator">{unreadCount}</span>}
        </button>

        <button onClick={async () => { await auth.signOut(); navigate('/login'); }} className="nav-btn logout-button">Logout</button>
      </nav>

      {showNotification && notifications.length > 0 && (
        <Notification
          messages={notifications}
          onClose={() => setShowNotification(false)}
          notificationType="New reply"
        />
      )}
    </aside>
  );
};

export default AdminSidebar;
