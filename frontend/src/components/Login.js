import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import logo from "../assets/logo.png";
import bgVideo from "../assets/background.mp4"; // <— IMPORT THE VIDEO
import { motion } from "framer-motion";

const Spinner = ({ label = "Loading…" }) => (
  <div className="flex flex-col items-center gap-2 pt-3" role="status" aria-live="polite">
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("login-page");
    document.body.classList.add("login-page");
    const root = document.getElementById("root");
    if (root) root.classList.add("login-root");
    return () => {
      document.documentElement.classList.remove("login-page");
      document.body.classList.remove("login-page");
      if (root) root.classList.remove("login-root");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResetMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage("");
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset link has been sent to your email.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send password reset email.");
    }
  };

  const toggleResetPassword = () => {
    setIsResettingPassword((v) => !v);
    setError(null);
    setResetMessage("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover z-0 pointer-events-none"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/10" />

      <div className="relative z-20 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-6"
          >
            <img src={logo} alt="Class Forum Platform" className="mx-auto mb-2 w-20 drop-shadow" />
            <h1 className="text-3xl font-bold text-white drop-shadow-sm">Class Forum Platform</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl bg-white/70 p-6 shadow-2xl backdrop-blur-md"
          >
            {isResettingPassword ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <h2 className="mb-4 text-center text-xl font-semibold text-blue-700">Reset Password</h2>
                {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                {resetMessage && <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{resetMessage}</div>}

                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-800">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  className="mt-1 mb-4 w-full rounded-md border border-gray-300 bg-white/80 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={toggleResetPassword}
                  className="mt-4 w-full text-center text-sm font-medium text-blue-700 hover:underline"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <h2 className="mb-4 text-center text-xl font-semibold text-blue-700">Login</h2>

                {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                {resetMessage && <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{resetMessage}</div>}

                <label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 mb-4 w-full rounded-md border border-gray-300 bg-white/80 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <label htmlFor="password" className="block text-sm font-medium text-gray-800">Password</label>
                <div className="relative mt-1 mb-4">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    className="w-full rounded-md border border-gray-300 bg-white/80 px-3 py-2 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm font-medium text-blue-700/80 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]"
                >
                  {isSubmitting ? "Logging in…" : "Login"}
                </button>

                {isSubmitting && <Spinner label="Logging in…" />}

                <div className="mt-4 text-center">
                  <Link to="/register" className="text-sm font-medium text-blue-700 hover:underline">
                    Create an account
                  </Link>
                </div>

                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={toggleResetPassword}
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
