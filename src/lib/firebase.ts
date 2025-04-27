import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyB9bI0EJhXv5bL6WV45fqCtBuGOytNtxqE",
  authDomain: "borrow-box-6d5ea.firebaseapp.com",
  projectId: "borrow-box-6d5ea",
  storageBucket: "borrow-box-6d5ea.firebasestorage.app",
  messagingSenderId: "679869070020",
  appId: "1:679869070020:web:0edd10ee30ba571c7ae791"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app); // Add this line