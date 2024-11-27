import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvySyO0kE1cRidxriwjibShuWzHXVT9Rg",
  authDomain: "class-forum-platform.firebaseapp.com",
  projectId: "class-forum-platform",
  storageBucket: "class-forum-platform.appspot.com",
  messagingSenderId: "915843028819",
  appId: "1:915843028819:web:87493f09cc6a6320a373a6",
  measurementId: "G-PJZB7T4EPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 



export { db, auth, storage }; 