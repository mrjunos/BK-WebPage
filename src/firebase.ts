import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "beethoven-kaffee-2026",
  appId: "1:427312137391:web:46d45a4961d392f99d405a",
  storageBucket: "beethoven-kaffee-2026.firebasestorage.app",
  apiKey: "AIzaSyCSHbWkudjwDwZPC2KfMZihTniZRj8VirI",
  authDomain: "beethoven-kaffee-2026.firebaseapp.com",
  messagingSenderId: "427312137391",
  projectNumber: "427312137391"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
