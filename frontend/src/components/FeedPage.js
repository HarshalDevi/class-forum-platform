import React, { useState, useEffect } from 'react';
import { collection, query as firestoreQuery, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import ReadOnlyPost from './ReadOnlyPost';
import SearchBar from './SearchBar';
import AdminLayout from './AdminLayout';
import logo from '../assets/logo.png';
import '../styles/FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Query to get posts sorted by timestamp in descending order (newest first)
    const q = firestoreQuery(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      setPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);

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
    setFilteredPosts(filtered);
  };

  return (
    <AdminLayout>
      <div className="feed-container">
        <div className="header-container">
          <img src={logo} alt="Class Forum Logo" className="dashboard-logo" />
          <h2 className="feed-header">Admin Feed</h2>
        </div>

        <SearchBar onSearch={handleSearch} />

        {filteredPosts.length === 0 ? (
          <p className="no-posts-message">No posts available.</p>
        ) : (
          filteredPosts.map((post) => (
            <ReadOnlyPost key={post.id} post={post} />
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedPage;
