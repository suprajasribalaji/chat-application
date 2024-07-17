import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAyew8vmTVi7bkVB7KNuDPlDwXMnva4pa8",
  authDomain: "chat-app-fbb34.firebaseapp.com",
  projectId: "chat-app-fbb34",
  storageBucket: "chat-app-fbb34.appspot.com",
  messagingSenderId: "435752270386",
  appId: "1:435752270386:web:4ada754aa4bfaca2855a2b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
export { app, auth, firestore };

