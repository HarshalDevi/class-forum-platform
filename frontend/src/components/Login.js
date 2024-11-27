import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import '../styles/Auth.css';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully!");
    } catch (error) {
      console.error("Login error:", error);
      setError('Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        setResetMessage('Password reset link has been sent to your email.');
        setError(null);
      } catch (error) {
        console.error('Password reset error:', error);
        setError('Failed to send password reset email.');
      }
    } else {
      setError('Please enter your email to reset your password.');
    }
  };

  const toggleResetPassword = () => {
    setIsResettingPassword(!isResettingPassword);
    setError(null);
    setResetMessage('');
  };

  return (
    <div>
      <div className="title-container">
        <img src={logo} alt="Class Forum Logo" className="logo" />
        <h1 className="platform-title">Class Forum Platform</h1>
      </div>
      <div className="login-container">
        {isResettingPassword ? (
          <form>
            <h2>Reset Password</h2>
            {error && <div className="error-message">{error}</div>}
            {resetMessage && <div className="reset-message">{resetMessage}</div>}
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="button" onClick={handleForgotPassword} className="auth-button">
              Send Reset Link
            </button>
            <div className="create-account-link">
              <button type="button" onClick={toggleResetPassword} className="forgot-password-button">
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            {resetMessage && <div className="reset-message">{resetMessage}</div>}
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
            <button type="submit" className="auth-button">Login</button>
            <div className="create-account-link">
              <Link to="/register">Create an account</Link>
            </div>
            <div className="forgot-password-link">
              <button type="button" onClick={toggleResetPassword} className="forgot-password-button">
                Forgot Password?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
