import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // <-- Importação do Storage

const firebaseConfig = {
  apiKey: "AIzaSyD7V977CAIxvV-rH0kQ8o1B1bShmQrO07s",
  authDomain: "navalha-dor.firebaseapp.com",
  projectId: "navalha-dor",
  storageBucket: "navalha-dor.firebasestorage.app", // Já está correto
  messagingSenderId: "868674127995",
  appId: "1:868674127995:web:3024ed009a9a17ca783ade"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // <-- Exportação do Storage