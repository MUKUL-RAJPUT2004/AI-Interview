import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBqp1OZCQCZV6Du3U70uKiDwIHUCqh5gnU",
  authDomain: "prepwise-840fd.firebaseapp.com",
  projectId: "prepwise-840fd",
  storageBucket: "prepwise-840fd.firebasestorage.app",
  messagingSenderId: "1055098622610",
  appId: "1:1055098622610:web:d7ecd4f6c364ba3b7e4c4b",
  measurementId: "G-60B42YKP3M"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
