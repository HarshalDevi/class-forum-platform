import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AdminSidebar from './AdminSidebar';
import Notification from './Notification';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Listen for new replies in Firestore posts collection
    const q = query(collection(db, 'posts'));
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
  }, []);

  const handleNotificationClick = () => {
    setShowNotification(true);
    setUnreadCount(0); // Reset unread count after viewing
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        unreadCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      />
      <div className="content">
        {children}
      </div>

      {/* Notification Component */}
      {showNotification && notifications.length > 0 && (
        <Notification
          message={`New reply: ${notifications[notifications.length - 1].content}`}
          onClose={handleNotificationClose}
        />
      )}
    </div>
  );
};

export default AdminLayout;
