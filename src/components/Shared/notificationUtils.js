import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const addNotification = async (message, role) => {
  await addDoc(collection(db, 'notifications'), {
    message,
    time: new Date(),
    role,
    isRead: false,
  });
};