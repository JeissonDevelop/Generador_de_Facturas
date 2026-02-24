import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOBTJPE5DAokRKHi9AmiJY3SrC3Zvem_4",
  authDomain: "generator-factu.firebaseapp.com",
  projectId: "generator-factu",
  storageBucket: "generator-factu.firebasestorage.app",
  messagingSenderId: "979138029891",
  appId: "1:979138029891:web:170cd2560f6fd4d8d7e7f6",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
