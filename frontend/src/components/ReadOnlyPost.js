import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import ReactQuill from 'react-quill';
import '../styles/Post.css';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Import icons for better UI

const ReadOnlyPost = ({ post }) => {
  const [isEditing, setIsEditing] = useState(false); // Track edit state
  const [editedContent, setEditedContent] = useState(post.data.content); // Track edited content

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        content: editedContent, // Update Firestore content
      });
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      console.error('Failed to save the edit:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header clearfix">
        <strong>{post.data.professorName || 'Professor'}</strong>
        {!isEditing && (
          <button onClick={handleEditToggle} className="edit-button" title="Edit Post">
            <FaEdit /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          <div className="edit-post">
            {/* Use ReactQuill for editing the post */}
            <ReactQuill value={editedContent} onChange={setEditedContent} />
          </div>
          <div className="edit-controls">
            <button onClick={handleSaveEdit} className="save-edit-button">
              <FaSave /> Save
            </button>
            <button onClick={handleEditToggle} className="cancel-edit-button">
              <FaTimes /> Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.data.content }}></div>
      )}

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

      {/* Display Like Count */}
      <div className="like-count">
        <strong>Likes: </strong> {post.data.likes || 0}
      </div>

      {/* Display Replies */}
      <div className="replies-section">
        <h4>Replies:</h4>
        {post.data.replies && post.data.replies.length > 0 ? (
          post.data.replies.map((reply, index) => (
            <div key={index} className="reply">
              <strong>{reply.responderName || 'Anonymous'}</strong>
              <div dangerouslySetInnerHTML={{ __html: reply.content }} />
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

export default ReadOnlyPost;
