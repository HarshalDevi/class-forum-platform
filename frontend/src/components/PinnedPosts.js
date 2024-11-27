import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import '../styles/PinnedPosts.css'; 

const PinnedPosts = () => {
  const [pinnedPosts, setPinnedPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), where("pinned", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPinnedPosts(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pinned-posts">
      <h2>Pinned Posts</h2>
      {pinnedPosts.map((post) => (
        <div key={post.id} className="pinned-post" dangerouslySetInnerHTML={{ __html: post.data.content }}></div>
      ))}
    </div>
  );
};

export default PinnedPosts;
