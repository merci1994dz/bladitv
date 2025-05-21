# تصدير تطبيق Bladi TV كملف APK

هذا الدليل يشرح كيفية تصدير تطبيق Bladi TV كملف APK ليتم تثبيته على أجهزة Android.

## المتطلبات المسبقة

1. تثبيت Android Studio
2. تثبيت JDK 17 أو أحدث
3. تثبيت Android SDK و NDK
4. ضبط متغيرات البيئة المناسبة لـ Android (ANDROID_SDK_ROOT)

## خطوات التصدير

### 1. تحضير التطبيق

تأكد من أن التطبيق يعمل بشكل جيد محلياً قبل تصديره. قم بتشغيل:

```bash
npm run dev
```

### 2. بناء ملفات الويب

قم ببناء ملفات التطبيق النهائية:

```bash
npm run build
```

### 3. نسخ الملفات إلى مجلد Capacitor

قم بتحديث ملفات Capacitor بالبناء الجديد:

```bash
npx cap sync android
```

### 4. فتح المشروع في Android Studio

افتح مشروع Android Studio:

```bash
npx cap open android
```

### 5. تهيئة اسم التطبيق والأيقونة

1. في Android Studio، افتح ملف `android/app/src/main/AndroidManifest.xml` وتأكد من إعدادات التطبيق صحيحة.
2. استبدل أيقونات التطبيق في مجلد `android/app/src/main/res/`.

### 6. إنشاء ملف APK للاختبار

في Android Studio:
1. اختر قائمة `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
2. انتظر حتى انتهاء عملية البناء
3. ستظهر رسالة عند اكتمال البناء، انقر على "locate" لمعرفة موقع ملف APK

### 7. إنشاء ملف APK للنشر

لإنشاء ملف APK موقع رقمياً للنشر:

1. إنشاء مفتاح التوقيع (keystore):
   ```
   keytool -genkey -v -keystore bladi-tv-key.keystore -alias bladi-tv -keyalg RSA -keysize 2048 -validity 10000
   ```

2. قم بتهيئة إعدادات التوقيع في Android Studio:
   - افتح `File` > `Project Structure` > `Modules` > `app`
   - انتقل إلى علامة تبويب `Signing Configs`
   - انقر على `+` لإضافة تكوين توقيع جديد
   - أدخل معلومات مفتاح keystore الذي قمت بإنشائه

3. استخدام تكوين التوقيع:
   - افتح `Build` > `Generate Signed Bundle / APK`
   - اختر `APK`
   - حدد تكوين التوقيع الذي أنشأته
   - اختر `release` كنوع البناء
   - انقر على `Finish`

### 8. اختبار ملف APK

1. قم بتثبيت ملف APK على هاتف Android للتأكد من أنه يعمل بشكل صحيح.
2. تحقق من أن جميع الميزات تعمل كما هو متوقع.

## ملاحظات إضافية

- للتوزيع على نطاق واسع، يُفضل استخدام Google Play Store.
- تأكد من تحديث رقم الإصدار `versionCode` و `versionName` في ملف `android/app/build.gradle` قبل كل إصدار جديد.
- اختبر التطبيق على أجهزة مختلفة للتأكد من توافقه.

## وثائق مفيدة

- [توثيق Capacitor](https://capacitorjs.com/docs/android)
- [توثيق Android Studio](https://developer.android.com/studio/publish)