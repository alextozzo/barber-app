import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7V977CAIxvV-rH0kQ8o1B1bShmQrO07s",
  authDomain: "navalha-dor.firebaseapp.com",
  projectId: "navalha-dor",
  storageBucket: "navalha-dor.firebasestorage.app",
  messagingSenderId: "868674127995",
  appId: "1:868674127995:web:3024ed009a9a17ca783ade"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);