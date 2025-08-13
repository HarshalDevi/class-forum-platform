import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage, auth } from '../firebase/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from './AdminLayout';
import logo from '../assets/logo.png';
import '../styles/AdminDashboard.css';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';

// Reads http://localhost:4000/improve from frontend/.env
const IMPROVE_URL = process.env.REACT_APP_IMPROVE_URL || '';

const AdminDashboard = () => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const user = auth.currentUser;

  const handleFileUpload = async () => {
    if (!file) return null;
    const fileRef = ref(storage, `files/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);
    return fileURL;
  };

  const handlePost = async () => {
    const fileURL = await handleFileUpload();

    // Fetch the professor's name from Firestore
    const userDoc = await getDoc(doc(db, 'users', user?.uid));
    const { firstName, lastName } = userDoc.data();

    await addDoc(collection(db, 'posts'), {
      content,
      fileURL,
      timestamp: new Date(),
      professorName: `${firstName} ${lastName}`,
    });

    setContent('');
    setFile(null);
    setSuggestion('');
    setShowSuggestionPanel(false);
  };

  const handleImproveWriting = async () => {
    if (!content || isSuggesting) return;
    if (!IMPROVE_URL) {
      alert('Improve service URL not set. Add REACT_APP_IMPROVE_URL to frontend/.env and restart.');
      return;
    }

    try {
      setIsSuggesting(true);
      setShowSuggestionPanel(true);

      const res = await fetch(IMPROVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentHtml: content,
          instruction:
            'Rewrite the following HTML with correct grammar and a clear, professional tone. Preserve meaning and structure (paragraphs, lists). Prefer idiomatic quantifiers and rewrite “multiple numbers of X” to “many X”. Return VALID HTML only.',
        }),
      });

      if (!res.ok) throw new Error(`Suggestion failed: ${res.status}`);
      const data = await res.json();

      let improved = (data?.suggestion || '').trim();
      if (improved && !improved.startsWith('<')) {
        improved = `<p>${improved
          .replace(/\n{2,}/g, '</p><p>')
          .replace(/\n/g, '<br/>')}</p>`;
      }

      const clean = DOMPurify.sanitize(improved, { USE_PROFILES: { html: true } });
      setSuggestion(clean || '');
    } catch (err) {
      console.error(err);
      alert('Could not generate suggestions. Please try again.');
      setShowSuggestionPanel(false);
    } finally {
      setIsSuggesting(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setContent(suggestion);
    setShowSuggestionPanel(false);
  };

  const dismissSuggestion = () => setShowSuggestionPanel(false);

  return (
    <AdminLayout>
      <motion.div
        className="admin-dashboard glass-card"
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="header-container">
          <img src={logo} alt="Class Forum Logo" className="dashboard-logo" />
          <div>
            <h2 className="page-title">Create a New Post</h2>
            <p className="page-caption">Share updates, materials, or announcements with your class.</p>
          </div>
        </div>

        <ReactQuill
          value={content}
          onChange={setContent}
          className="rich-editor"
          placeholder="Write your post…"
        />

        <div className="actions-row">
          <label className="file-input">
  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
  📎 <span>{file ? file.name : 'Attach a file'}</span>
</label>

          <div className="action-buttons">
            <motion.button whileTap={{ scale: 0.98 }} onClick={handlePost} className="btn btn-primary">
              Post
            </motion.button>

            <motion.button
              whileTap={{ scale: isSuggesting ? 1 : 0.98 }}
              onClick={handleImproveWriting}
              className="btn btn-secondary"
              disabled={isSuggesting || !content}
              title="Get grammar and clarity improvements"
            >
              {isSuggesting ? 'Improving…' : 'Improve Writing ✨'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Backdrop + Slide-over (nice margins & rounded) */}
      <AnimatePresence>
        {showSuggestionPanel && (
          <>
            {/* Backdrop */}
            <motion.button
              aria-label="Close suggestions"
              className="suggestion-backdrop"
              onClick={dismissSuggestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.aside
              className="suggestion-panel"
              role="dialog"
              aria-label="Suggested Edits"
              initial={{ x: '110%' }}
              animate={{ x: 0 }}
              exit={{ x: '110%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              <div className="suggestion-header">
                <h3>Suggested version</h3>
                <button onClick={dismissSuggestion} className="icon-btn" aria-label="Close panel">✕</button>
              </div>

              <div className="suggestion-body">
                {isSuggesting && <div className="dim-text">Generating suggestions…</div>}
                {!isSuggesting && !suggestion && <div className="dim-text">No suggestion available.</div>}
                {!isSuggesting && suggestion && (
                  <div dangerouslySetInnerHTML={{ __html: suggestion }} />
                )}
              </div>

              <div className="suggestion-actions">
                <button onClick={dismissSuggestion} className="chip-btn">Dismiss</button>
                <button onClick={applySuggestion} disabled={!suggestion} className="btn btn-success">
                  Apply Suggestion
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminDashboard;
