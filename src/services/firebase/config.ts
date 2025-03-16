
// تكوين Firebase للتطبيق
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// تكوين Firebase من مشروع BladiTV
const firebaseConfig = {
  apiKey: "AlzaSyDj...SZUnahE1l0",
  authDomain: "oussamatv-adba3.firebaseapp.com",
  databaseURL: "https://oussamatv-adba3-default-rtdb.firebaseio.com",
  projectId: "oussamatv-adba3",
  storageBucket: "oussamatv-adba3.appspot.com",
  messagingSenderId: "773751411670",
  appId: "1:773751411670:android:f9605619ec52f71bca8a77"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// الحصول على خدمات Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
