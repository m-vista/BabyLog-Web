import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6PyPp6ire7TBPYA6fOLXcMznv4vt5ux8",
  authDomain: "babylog-cs361.firebaseapp.com",
  projectId: "babylog-cs361",
  storageBucket: "babylog-cs361.firebasestorage.app",
  messagingSenderId: "522455039917",
  appId: "1:522455039917:web:b05242b578ad5a8904eb24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);