
# BladiTV - بث القنوات العربية والدولية

![BladiTV Logo](public/og-image.png)

## نبذة عن المشروع

BladiTV هو تطبيق مفتوح المصدر يتيح للمستخدمين مشاهدة القنوات العربية والدولية مباشرة عبر الإنترنت. يوفر التطبيق واجهة سهلة الاستخدام تدعم العديد من الميزات مثل:

- تصفح القنوات حسب الدولة أو الفئة
- إضافة القنوات إلى المفضلة للوصول السريع إليها
- عرض آخر القنوات المشاهدة
- البحث المتقدم بالفلترة حسب الدولة أو الفئة
- وضعية الظلام (Dark Mode) ووضعية النهار (Light Mode)
- لوحة تحكم للمشرفين لإدارة القنوات والتحكم في محتوى التطبيق
- دعم للأجهزة المختلفة (الهواتف، الأجهزة اللوحية، أجهزة التلفاز الذكية)

## رابط المشروع

**URL**: https://lovable.dev/projects/02ddf7af-ec38-4c2d-befe-f3a3e0aae58a

## متطلبات النظام

- Node.js (الإصدار 18 أو أحدث) - [تثبيت باستخدام nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm (أو Yarn أو pnpm)
- متصفح حديث يدعم ES6+ و WebRTC

## خطوات التثبيت والتشغيل

### 1. تثبيت المشروع محلياً

```sh
# 1. استنساخ المستودع
git clone <YOUR_GIT_URL>

# 2. الانتقال إلى مجلد المشروع
cd <YOUR_PROJECT_NAME>

# 3. تثبيت التبعيات اللازمة
npm install
# أو باستخدام yarn
yarn install
# أو باستخدام pnpm
pnpm install

# 4. تشغيل خادم التطوير المحلي
npm run dev
# أو
yarn dev
# أو
pnpm dev
```

### 2. الوصول إلى التطبيق

بعد تشغيل الخادم المحلي، يمكنك الوصول إلى التطبيق على العنوان التالي:
http://localhost:8080

## التقنيات المستخدمة

يستخدم المشروع العديد من التقنيات الحديثة:

- **React**: مكتبة JavaScript لبناء واجهات المستخدم
- **TypeScript**: لغة برمجة توفر الأنواع الثابتة لتحسين جودة الكود
- **Vite**: أداة بناء سريعة للتطبيقات الحديثة
- **Tailwind CSS**: إطار عمل CSS لتصميم واجهات المستخدم بسرعة
- **shadcn/ui**: مكتبة مكونات UI مبنية على Radix UI و Tailwind CSS
- **TanStack Query (React Query)**: مكتبة لإدارة حالة البيانات وطلبات الشبكة
- **Recharts**: مكتبة لإنشاء الرسوم البيانية
- **React Router**: للتنقل بين صفحات التطبيق

## طرق النشر

### النشر باستخدام Lovable

1. ببساطة قم بزيارة [مشروع Lovable](https://lovable.dev/projects/02ddf7af-ec38-4c2d-befe-f3a3e0aae58a)
2. انقر على Share -> Publish

### النشر باستخدام Vercel

1. قم بإنشاء حساب على [Vercel](https://vercel.com)
2. ربط حسابك على GitHub مع Vercel
3. استيراد المشروع من GitHub
4. اتبع التعليمات لإكمال النشر

### النشر باستخدام Netlify

1. قم بإنشاء حساب على [Netlify](https://netlify.com)
2. اضغط على زر "New site from Git"
3. اختر مزود Git (GitHub, GitLab, Bitbucket)
4. حدد المستودع الخاص بالمشروع
5. قم بتكوين إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. انقر على "Deploy site"

## استخدام نطاق مخصص

لاستخدام نطاق مخصص مع موقعك، راجع وثائق المنصة التي تستخدمها للنشر (Vercel أو Netlify).

إذا كنت تستخدم Lovable، راجع [توثيق استخدام النطاقات المخصصة](https://docs.lovable.dev/tips-tricks/custom-domain/).

## طرق المساهمة

1. قم بعمل Fork للمشروع
2. قم بإنشاء فرع جديد لميزتك (`git checkout -b feature/amazing-feature`)
3. قم بعمل Commit للتغييرات الخاصة بك (`git commit -m 'إضافة ميزة رائعة'`)
4. قم بدفع الفرع (`git push origin feature/amazing-feature`)
5. قم بفتح طلب Pull Request

## الترخيص

هذا المشروع مرخص تحت ترخيص MIT - راجع ملف LICENSE للمزيد من التفاصيل.

## الاتصال والدعم

إذا كان لديك أي أسئلة أو مشاكل، يمكنك التواصل عبر:
- طرح مشكلة في هذا المستودع
- مراسلتنا عبر البريد الإلكتروني: [example@example.com](mailto:example@example.com)
- زيارة [موقعنا الرسمي](https://example.com)
