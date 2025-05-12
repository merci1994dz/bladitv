
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Import version initialization to ensure latest version is shown
import './services/initVersion';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
  // التحقق من وجود عنصر الجذر
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('لم يتم العثور على عنصر الجذر للتطبيق!');
    return;
  }
  
  // تهيئة التطبيق
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('تم بدء تشغيل التطبيق بنجاح!');
  } catch (error) {
    console.error('خطأ في تهيئة التطبيق:', error);
  }
});

// إضافة معلمات لمنع مشاكل التخزين المؤقت
localStorage.setItem('app_version', Date.now().toString());
