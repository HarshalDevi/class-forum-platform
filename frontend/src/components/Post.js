import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import ReactQuill from 'react-quill';
import { FaThumbsUp, FaThumbtack } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import '../styles/Post.css';

// Reads http://localhost:4000/improve from frontend/.env
// REACT_APP_IMPROVE_URL=http://localhost:4000/improve
const IMPROVE_URL = process.env.REACT_APP_IMPROVE_URL || '';

const Post = ({ post }) => {
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const likedBy = post?.data?.likedBy || [];
    setLiked(likedBy.includes(user.uid));
  }, [post?.data?.likedBy, user]);

  const handleLike = async () => {
    if (!user) return;
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
    if (!user) return;
    const clean = (reply || '').trim();
    if (!clean) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const { firstName, lastName } = userDoc.data() || { firstName: 'Anonymous', lastName: '' };

    const postRef = doc(db, 'posts', post.id);
    const replyObject = {
      content: clean,
      timestamp: Timestamp.now(),
      responderName: `${firstName} ${lastName}`.trim(),
    };

    await updateDoc(postRef, {
      replies: arrayUnion(replyObject),
    });

    setReply('');
  };

  const handlePinPost = async () => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, { pinned: !post.data.pinned });
  };

  const handleImprove = async () => {
    if (isImproving) return;
    const raw = (reply || '').trim();
    if (!raw) return;

    if (!IMPROVE_URL) {
      alert('Improve service URL not set. Add REACT_APP_IMPROVE_URL to frontend/.env and restart.');
      return;
    }

    try {
      setIsImproving(true);

      const res = await fetch(IMPROVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentHtml: raw,
          instruction:
            'Rewrite the following HTML with correct grammar and a clear, professional tone. Preserve meaning and structure (paragraphs, lists). Prefer idiomatic quantifiers (e.g., “many/several/few”) and rewrite phrases like “multiple numbers of X” to “many X”. Return VALID HTML only — no explanations, no markdown fences, no extra text.',
        }),
      });

      if (!res.ok) throw new Error(`Suggestion failed: ${res.status}`);
      const data = await res.json();

      let improved = (data?.suggestion || '').trim();

      // If backend returned plain text, wrap for Quill display
      if (improved && !improved.startsWith('<')) {
        improved = `<p>${improved
          .replace(/\n{2,}/g, '</p><p>')
          .replace(/\n/g, '<br/>')}</p>`;
      }

      const clean = DOMPurify.sanitize(improved, { USE_PROFILES: { html: true } });
      if (clean) setReply(clean);
    } catch (e) {
      console.error(e);
      alert('Could not improve writing. Please try again.');
    } finally {
      setIsImproving(false);
    }
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

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.data.content }}
      />

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

        <div className="reply-actions">
          <button
            type="button"
            onClick={handleImprove}
            className="improve-button"
            disabled={isImproving || !reply.trim()}
            title="Refine grammar, tone, and clarity (local LLM)"
          >
            {isImproving ? 'Improving…' : 'Improve Writing ✨'}
          </button>

          <button
            type="button"
            onClick={handleReply}
            className="reply-button"
            disabled={!reply.trim() || isImproving}
          >
            Reply
          </button>
        </div>
      </div>

      <div className="replies-section">
        <h4>Replies:</h4>
        {post.data.replies && post.data.replies.length > 0 ? (
          post.data.replies.map((r, idx) => (
            <div key={idx} className="reply">
              <div dangerouslySetInnerHTML={{ __html: r.content }} />
              <span className="reply-responder-name">{r.responderName || 'Anonymous'}</span>
              <span className="reply-timestamp">
                {r.timestamp ? r.timestamp.toDate().toLocaleString() : 'Timestamp not available'}
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
