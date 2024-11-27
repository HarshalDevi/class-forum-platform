import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import '../styles/Auth.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password validation: at least one uppercase letter and one special character
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;

    if (!specialCharacterRegex.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    if (!uppercaseRegex.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    try {
      // Create a new user with Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the user information in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
        role,
      });

      console.log("Registration successful. Redirecting to login page.");

      // Redirect to login page right away
      navigate('/login', { replace: true });

      // Sign out the user immediately after registration to prevent direct dashboard access
      // This is done in the background
      signOut(auth).catch((error) => {
        console.error("Error during sign out:", error);
      });

    } catch (error) {
      console.error("Error during registration:", error);

      // Improved error handling with specific error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
        <div className="title-container">
          <img src={Logo} alt="Class Forum Platform Logo" className="logo" />
          <h1 className="platform-title">Class Forum Platform</h1>
        </div>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        
        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        
        <button type="submit" className="auth-button">Register</button>
        
      </form>
    </div>
  );
};

export default Register;
