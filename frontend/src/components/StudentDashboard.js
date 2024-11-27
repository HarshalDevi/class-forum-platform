import React, { useState, useEffect } from 'react';
import { collection, query as firestoreQuery, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Post from './Post';
import SearchBar from './SearchBar';
import StudentLayout from './StudentLayout';
import '../styles/StudentDashboard.css';
import logo from '../assets/logo.png';

const StudentDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Use 'timestamp' for ordering the posts by date
    const q = firestoreQuery(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data()
      }));
      const sortedPosts = sortPosts(fetchedPosts); // Sort posts with pinned posts first
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);
    });
    return () => unsubscribe();
  }, []);

  const sortPosts = (posts) => {
    return [...posts].sort((a, b) => (b.data.pinned ? 1 : 0) - (a.data.pinned ? 1 : 0));
  };

  const handleSearch = (searchQuery) => {
    setSearchQuery(searchQuery);
    const filtered = posts.filter((post) => {
      const postContent = post.data.content ? post.data.content.toLowerCase() : '';
      const queryLower = searchQuery.toLowerCase();
      const isContentMatch = postContent.includes(queryLower);
      const isReplyMatch = post.data.replies?.some((reply) =>
        reply.content && reply.content.toLowerCase().includes(queryLower)
      );
      return isContentMatch || isReplyMatch;
    });
    setFilteredPosts(sortPosts(filtered)); // Sort filtered posts
  };

  const togglePinPost = async (postId, isPinned) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { pinned: !isPinned });
  };

  return (
    <StudentLayout>
      <div className="student-dashboard">
        <div className="dashboard-header">
          <img src={logo} alt="Class Forum Logo" className="dashboard-logo" />
          <h2>Posts</h2>
        </div>

        <SearchBar onSearch={handleSearch} />

        {filteredPosts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          filteredPosts.map((post) => (
            <Post key={post.id} post={post} onPinToggle={togglePinPost} />
          ))
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
