// src/pages/Register.jsx (or wherever yours lives)
import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import bgVideo from "../assets/background.mp4"; // same video as login
import { motion } from "framer-motion";

const Spinner = ({ label = "Creating account…" }) => (
  <div className="flex flex-col items-center gap-2 pt-3" role="status" aria-live="polite">
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Apply same page classes as Login so global gradients don’t clash
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;

    if (!specialCharacterRegex.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }
    if (!uppercaseRegex.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    try {
      setSubmitting(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email,
        role,
      });

      // Navigate first so UX feels instant, then sign out in background
      navigate("/login", { replace: true });
      signOut(auth).catch(() => { /* non-blocking */ });
    } catch (err) {
      console.error("Error during registration:", err);
      const map = {
        "auth/email-already-in-use": "This email is already in use. Please use a different email.",
        "auth/invalid-email": "Invalid email address. Please check your email and try again.",
        "auth/weak-password": "Password is too weak. Please use a stronger password.",
      };
      setError(map[err?.code] || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      {/* Background video */}
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

      {/* Soft overlay for readability */}
      <div className="absolute inset-0 z-10 bg-black/10" />

      {/* Foreground content */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-6"
          >
            <img src={logo} alt="Class Forum Platform" className="mx-auto mb-2 w-20 drop-shadow" />
            <h1 className="text-3xl font-bold text-white drop-shadow-sm">Class Forum Platform</h1>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl bg-white/70 p-6 shadow-2xl backdrop-blur-md"
          >
            {/* Back to login */}
            <div className="mb-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                aria-label="Back to Login"
              >
                <span aria-hidden>←</span> Back to Login
              </Link>
            </div>

            <h2 className="mb-4 text-center text-xl font-semibold text-blue-700">Register</h2>

            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} noValidate>
              <label className="block text-sm font-medium text-gray-800" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className="mt-1 mb-3 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />

              <label className="block text-sm font-medium text-gray-800" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="mt-1 mb-3 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />

              <label className="block text-sm font-medium text-gray-800" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="mt-1 mb-3 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <label className="block text-sm font-medium text-gray-800" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="mt-1 mb-3 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <label className="block text-sm font-medium text-gray-800" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="mt-1 mb-3 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <label className="block text-sm font-medium text-gray-800" htmlFor="role">Role</label>
              <select
                id="role"
                className="mt-1 mb-4 w-full rounded-md border border-gray-300 bg-white/90 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]"
              >
                {submitting ? "Creating account…" : "Register"}
              </button>

              {submitting && <Spinner />}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
