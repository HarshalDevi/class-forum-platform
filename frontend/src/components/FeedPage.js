import React, { useState, useEffect } from 'react';
import { collection, query as firestoreQuery, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import ReadOnlyPost from './ReadOnlyPost';
import AdminLayout from './AdminLayout';
import logo from '../assets/logo.png';
import '../styles/FeedPage.css';
import { motion, AnimatePresence } from 'framer-motion';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      setPosts(fetched);
      setFilteredPosts(fetched);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    const q = value.toLowerCase();
    const next = posts.filter((post) => {
      const content = (post.data.content || '').toLowerCase();
      const inReplies = post.data.replies?.some(
        (r) => r.content && r.content.toLowerCase().includes(q)
      );
      return content.includes(q) || inReplies;
    });
    setFilteredPosts(next);
  };

  return (
    <AdminLayout>
      <motion.div
        className="feed-container glass"
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="feed-header-row">
          <img src={logo} alt="Class Forum" className="feed-logo" />
          <div>
            <h2 className="feed-title">Admin Feed</h2>
            <p className="feed-caption">Search posts, replies, and attachments.</p>
          </div>
        </div>

        {/* Search */}
        <div className="searchbar">
          <div className="searchbox">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search posts…"
              aria-label="Search posts"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            onClick={() => handleSearch(searchQuery)}
          >
            Search
          </motion.button>
        </div>

        {/* List */}
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16M4 12h16M4 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No posts match your search.</p>
          </div>
        ) : (
          <div className="post-list">
            <AnimatePresence initial={false}>
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, delay: Math.min(i, 6) * 0.02 }}
                  className="post-card"
                >
                  {/* Keep your existing component for content */}
                  <ReadOnlyPost post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default FeedPage;
