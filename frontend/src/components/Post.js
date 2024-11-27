import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import ReactQuill from 'react-quill';
import { FaThumbsUp, FaThumbtack } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
import '../styles/Post.css';

const Post = ({ post }) => {
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (post.data.likedBy && post.data.likedBy.includes(user.uid)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [post.data.likedBy, user.uid]);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);

    if (liked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(user.uid),
        likes: increment(-1),
      });
      setLiked(false);
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(user.uid),
        likes: increment(1),
      });
      setLiked(true);
    }
  };

  const handleReply = async () => {
    if (reply.trim() !== '') {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const { firstName, lastName } = userDoc.data();

      const postRef = doc(db, 'posts', post.id);
      const replyObject = {
        content: reply,
        timestamp: Timestamp.now(),
        responderName: `${firstName} ${lastName}`, // Store full name of responder
      };

      await updateDoc(postRef, {
        replies: arrayUnion(replyObject),
      });
      
      setReply('');
    }
  };

  const handlePinPost = async () => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, {
      pinned: !post.data.pinned,
    });
  };

  return (
    <div className="post">
      <div className="post-header">
        <span className="professor-name">{post.data.professorName || 'Professor'}</span>
        <button
          onClick={handlePinPost}
          className={`pin-button ${post.data.pinned ? 'pinned' : 'unpinned'}`}
          title={post.data.pinned ? 'Unpin Post' : 'Pin Post'}
        >
          <FaThumbtack />
        </button>
      </div>
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.data.content }}></div>
      {post.data.fileURL && (
        <a
          href={post.data.fileURL}
          target="_blank"
          rel="noopener noreferrer"
          className="attached-file-link"
        >
          View Attachment
        </a>
      )}
      <div className="post-likes">
        <button
          onClick={handleLike}
          className={`like-button ${liked ? 'liked' : 'unliked'}`}
          title={liked ? 'Unlike' : 'Like'}
        >
          <FaThumbsUp />
        </button>
        <span>Likes: {post.data.likes || 0}</span>
      </div>

      <div className="reply-editor">
        <ReactQuill value={reply} onChange={setReply} />
        <button onClick={handleReply} className="reply-button">Reply</button>
      </div>

      <div className="replies-section">
        <h4>Replies:</h4>
        {post.data.replies && post.data.replies.length > 0 ? (
          post.data.replies.map((reply, index) => (
            <div key={index} className="reply">
              <div dangerouslySetInnerHTML={{ __html: reply.content }} />
              <span className="reply-responder-name">{reply.responderName || 'Anonymous'}</span>
              <span className="reply-timestamp">
                {reply.timestamp ? reply.timestamp.toDate().toLocaleString() : 'Timestamp not available'}
              </span>
            </div>
          ))
        ) : (
          <p>No replies yet.</p>
        )}
      </div>
    </div>
  );
};

export default Post;
