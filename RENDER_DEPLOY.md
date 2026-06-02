# 🚀 دليل نشر المشروع على Render

  ## معلومات المشروع
  **مركز سرعة انجاز للخدمات الطلابية والأكاديمية**
  - Flask + SocketIO + Telethon + AI
  - يتضمن: نظام تليجرام تلقائي · تحليل إحصائي أكاديمي · منسق مستندات · منشئ عروض

  ---

  ## طريقة النشر (الأسهل – Blueprint)

  1. اذهب إلى [render.com](https://render.com) → **New** → **Blueprint**
  2. اربط مستودعك `anwer1230/-Anwer_program`
  3. Render سيكتشف `render.yaml` تلقائياً ويضبط كل شيء
  4. أضف متغيرات البيئة المطلوبة (انظر أدناه)
  5. اضغط **Apply**

  ---

  ## طريقة النشر اليدوية (New Web Service)

  ### الإعدادات الأساسية

  | الإعداد | القيمة |
  |---|---|
  | **Repository** | `anwer1230/-Anwer_program` |
  | **Root Directory** | `Smart-Academic-Hub/artifacts/speed-center` |
  | **Environment** | `Python 3` |
  | **Build Command** | `pip install -r requirements.txt` |
  | **Start Command** | `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app` |
  | **Region** | Oregon (us-west) |
  | **Plan** | Free (أو Starter لاستمرارية أفضل) |

  ---

  ## متغيرات البيئة المطلوبة

  | المتغير | القيمة | الوصف |
  |---|---|---|
  | `SESSION_SECRET` | (ولّد تلقائياً أو ضع قيمة عشوائية) | مفتاح تشفير الجلسات |
  | `GROQ_API_KEY` | مفتاحك من Groq | للذكاء الاصطناعي (التحليل الأكاديمي + العروض) |
  | `RENDER` | `true` | يُفعّل تخزين الجلسات في /tmp (مهم!) |

  ### كيفية الحصول على مفتاح Groq مجاني:
  1. اذهب إلى [console.groq.com](https://console.groq.com)
  2. أنشئ حساب مجاني
  3. اذهب إلى **API Keys** → **Create API Key**
  4. انسخ المفتاح وضعه في Render

  ---

  ## ملاحظات مهمة

  ### ⚠️ الخطة المجانية (Free Plan)
  - الخادم يتوقف بعد **15 دقيقة** من عدم النشاط
  - لأن البرنامج يستخدم اتصالات Telegram المستمرة، يُنصح بـ **Starter Plan ($7/شهر)**
  - الخطة المجانية تصلح للاختبار فقط

  ### 💾 تخزين الجلسات
  - على Render، جلسات Telegram تُحفظ في `/tmp/sessions` (مؤقت)
  - عند إعادة تشغيل الخادم، ستحتاج لإعادة تسجيل الدخول لـ Telegram
  - للتخزين الدائم، استخدم Render Disk أو قاعدة بيانات خارجية

  ### 🔌 WebSocket / SocketIO
  - البرنامج يستخدم SocketIO مع eventlet
  - Render يدعم WebSocket على الخطط المدفوعة
  - الخطة المجانية تستخدم Long Polling (أبطأ لكن يعمل)

  ---

  ## البنية التقنية

  ```
  Smart-Academic-Hub/artifacts/speed-center/
  ├── app.py              ← الخادم الرئيسي (Flask + SocketIO)
  ├── requirements.txt    ← المكتبات المطلوبة
  ├── render.yaml         ← إعدادات Render
  ├── templates/
  │   ├── index.html      ← الواجهة الرئيسية
  │   └── academic.html   ← التحليل الإحصائي الأكاديمي
  ├── static/
  │   ├── icons/          ← أيقونات PWA
  │   ├── js/app.js       ← JavaScript الرئيسي
  │   └── wf/             ← منسق المستندات (مبني مسبقاً)
  └── pptx_app/           ← وحدة إنشاء العروض
  ```

  ---

  ## خطوات ما بعد النشر

  1. **تسجيل دخول Telegram**: بعد النشر، افتح التطبيق واختر مستخدماً وسجّل دخولك
  2. **مفتاح Groq**: تأكد من إضافة `GROQ_API_KEY` لمتغيرات البيئة في Render
  3. **اختبار التحليل الأكاديمي**: اضغط على "التحليل الأكاديمي الذكي" من الواجهة الرئيسية

  ---

  ## استكشاف الأخطاء

  | المشكلة | الحل |
  |---|---|
  | الواجهة لا تظهر | تحقق من Logs في Render Dashboard |
  | SocketIO لا يتصل | طبيعي على Free Plan - يستخدم Polling تلقائياً |
  | Telegram لا يعمل | أعد تسجيل الدخول بعد كل إعادة تشغيل |
  | الذكاء الاصطناعي لا يعمل | تحقق من `GROQ_API_KEY` في متغيرات البيئة |
  | Build فشل | تحقق من `requirements.txt` وتوافق Python 3 |

  ---

  *تم إنشاء هذا الملف تلقائياً — آخر تحديث: يونيو 2026*
  