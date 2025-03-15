
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// إعدادات تكوين Firebase
// يجب تعويض هذه البيانات ببيانات مشروعك في Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);

// استخراج خدمات Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
