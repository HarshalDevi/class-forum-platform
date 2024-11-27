import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage, auth } from '../firebase/firebaseConfig'; // Import auth for professor's name
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from './AdminLayout';
import logo from '../assets/logo.png';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
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
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const { firstName, lastName } = userDoc.data();

    await addDoc(collection(db, 'posts'), {
      content,
      fileURL,
      timestamp: new Date(),
      professorName: `${firstName} ${lastName}`, // Store full name
    });
    setContent(''); // Clear content
    setFile(null); // Clear file
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="header-container">
          <img src={logo} alt="Class Forum Logo" className="dashboard-logo" />
          <h2>Create a New Post</h2>
        </div>

        <ReactQuill value={content} onChange={setContent} />
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button onClick={handlePost} className="post-button">Post</button>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
