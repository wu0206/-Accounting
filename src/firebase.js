// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ★★★ 請確認這裡的 Config 是您自己的 (您上傳的檔案看起來已經填好了) ★★★
const firebaseConfig = {
  apiKey: "AIzaSyAuAZSgs-oUS7hmfsDKZyQNqpbSCiOUfik",
  authDomain: "accounting-c6599.firebaseapp.com",
  projectId: "accounting-c6599",
  storageBucket: "accounting-c6599.firebasestorage.app",
  messagingSenderId: "53340382920",
  appId: "1:53340382920:web:ada671f7d3464ace5867fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;