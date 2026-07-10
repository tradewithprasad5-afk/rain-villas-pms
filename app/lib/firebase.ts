import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjuAHPK5Q0L2X3poGLzUjbWnjcgyqD478",
  authDomain: "the-5ive-ventures-pms.firebaseapp.com",
  projectId: "the-5ive-ventures-pms",
  storageBucket: "the-5ive-ventures-pms.firebasestorage.app",
  messagingSenderId: "769887410350",
  appId: "1:769887410350:web:a04c149fd27db2ada3f53f",
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

export const db = getFirestore(app);