import React, { useState, useEffect } from 'react';
import { collection, query as firestoreQuery, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Post from './Post';
import StudentLayout from './StudentLayout';
import '../styles/StudentDashboard.css';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      const sorted = sortPosts(fetchedPosts);
      setPosts(sorted);
      setFilteredPosts(sorted);
    });
    return () => unsubscribe();
  }, []);

  const sortPosts = (items) =>
    [...items].sort((a, b) => (b.data.pinned ? 1 : 0) - (a.data.pinned ? 1 : 0));

  const handleSearch = (value) => {
    setSearchQuery(value);
    const q = value.toLowerCase();
    const filtered = posts.filter((post) => {
      const content = (post.data.content || '').toLowerCase();
      const inReplies = post.data.replies?.some(
        (r) => r.content && r.content.toLowerCase().includes(q)
      );
      return content.includes(q) || inReplies;
    });
    setFilteredPosts(sortPosts(filtered));
  };

  const togglePinPost = async (postId, isPinned) => {
    await updateDoc(doc(db, 'posts', postId), { pinned: !isPinned });
  };

  return (
    <StudentLayout>
      <motion.div
        className="student-dashboard glass"
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="s-header">
          <img src={logo} alt="Class Forum" className="s-logo" />
          <div>
            <h2 className="s-title">Posts</h2>
            <p className="s-caption">Browse updates, reply, and pin important items.</p>
          </div>
        </div>

        {/* Search */}
        <div className="s-search">
          <div className="s-searchbox">
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

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="s-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h16M4 12h16M4 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>No posts yet. Try a different search.</span>
          </div>
        ) : (
          <div className="s-list">
            <AnimatePresence initial={false}>
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  className="s-postcard"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, delay: Math.min(i, 6) * 0.02 }}
                >
                  {/* Keep your existing Post logic */}
                  <Post post={post} onPinToggle={togglePinPost} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </StudentLayout>
  );
};

export default StudentDashboard;
