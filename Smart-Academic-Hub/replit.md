# مركز سرعة انجاز للخدمات الطلابية والأكاديمية

نظام تليجرام تلقائي + منصة أكاديمية متكاملة لإدارة 5 مستخدمين مع إرسال جماعي، مراقبة، وردود تلقائية.

## Run & Operate

- التطبيق يعمل تلقائياً عبر workflow `artifacts/speed-center: web`
- `python app.py` من داخل `artifacts/speed-center/`
- المنفذ: `PORT=22234` (محدد عبر env var)

## Stack

- **Backend**: Python + Flask + Flask-SocketIO (eventlet)
- **Frontend**: Jinja2 HTML template + Bootstrap 5 + Socket.IO client
- **Telegram**: Telethon library
- **Realtime**: Socket.IO polling (polling-only mode للتوافق مع Replit proxy)
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/speed-center/app.py` — الـ backend الرئيسي (Flask + Telethon + SocketIO)
- `artifacts/speed-center/templates/index.html` — الواجهة الرئيسية (Jinja2)
- `artifacts/speed-center/static/js/app.js` — JavaScript الـ frontend
- `artifacts/speed-center/static/icons/` — الأيقونات وصورة السبلاش
- `artifacts/speed-center/sessions/` — بيانات جلسات تليجرام (gitignored)
- `artifacts/speed-center/requirements.txt` — مكتبات Python

## Architecture decisions

- Socket.IO يعمل بـ **polling فقط** (لا WebSocket) لتجنب 502 من Replit proxy
- eventlet بدلاً من threading لـ async support مع Flask-SocketIO
- `SESSION_SECRET` من Replit secrets
- PREDEFINED_USERS: 5 مستخدمين محددين مسبقاً في app.py
- الملفات الثابتة تُقدَّم مباشرة من Flask (لا Nginx)

## Product

- إدارة 5 حسابات تليجرام بالتوازي
- إرسال جماعي للرسائل والصور للمجموعات
- مراقبة الكلمات المفتاحية والردود التلقائية
- الانضمام التلقائي للمجموعات
- الإرسال المتسلسل الدوري
- بوت التعلم الذكي
- نظام الصحة والإحصائيات

## User preferences

- استخدام الملفات من المستودع كما هي بالضبط
- المصدر الأصلي: https://github.com/anwer1230/newanwer

## Gotchas

- يجب تشغيل البرنامج من مجلد `artifacts/speed-center/` لأن `SESSIONS_DIR = "sessions"` مسار نسبي
- تعديل على app.py: أضيف `eventlet.monkey_patch()` أول شيء + `async_mode='eventlet'` + `transports=['polling']`
- السبلاش screen تختفي تلقائياً بعد 1.5-4 ثانية

## Pointers

- See the `pnpm-workspace` skill for workspace structure
