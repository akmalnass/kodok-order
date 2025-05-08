import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAH4gE7BwtrltP0nnc0aukhc4ekSD70mg8",
  authDomain: "kodok-order.firebaseapp.com",
  projectId: "kodok-order",
  storageBucket: "kodok-order.appspot.com",
  messagingSenderId: "379151880161",
  appId: "1:379151880161:web:adb41ea1b61605241c4ca0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;