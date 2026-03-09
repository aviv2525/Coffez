# פרודקשן – Vercel + Neon

## שגיאת 500 ב־Login

אם אתה מקבל `500 (Internal Server Error)` ב־`POST /auth/login`, הסיבות הנפוצות:

### 1. משתני סביבה ב־Vercel (פרויקט ה־API)

ב־**Vercel → הפרויקט של ה־API (coffez-api)** → Settings → Environment Variables וודא:

| משתנה | חובה | תיאור |
|--------|------|--------|
| `DATABASE_URL` | ✅ | מחרוזת החיבור ל־Postgres (Neon). **חשוב:** ב־Vercel (serverless) השתמש ב־**pooled** (ראו סעיף 2). |
| `JWT_SECRET` | ✅ | מפתח סודי (לפחות 32 תווים). אל תשתמש ב־`change-me-in-production`. |
| `CORS_ORIGIN` | ✅ | כתובת האתר של ה־frontend, למשל `https://coffez.vercel.app` (בלי סלאש בסוף). אם יש כמה דומיינים: `https://a.vercel.app,https://b.vercel.app` |

אחרי שינוי משתנים – עשה **Redeploy** ל־API.

### 2. Neon – חיבור Pooled (חשוב ב־Vercel)

ב־Vercel כל קריאה יכולה לפתוח חיבור חדש ל־DB. ב־Neon מומלץ להשתמש ב־**connection pooling** כדי לא לחרוג ממגבלת החיבורים.

- ב־[Neon Console](https://console.neon.tech) → הפרויקט → **Connection details**
- הפעל **Connection pooling** והעתק את ה־connection string (ה־host מכיל `-pooler`).

דוגמה:
- **ללא pooler:** `ep-xxx.us-east-1.aws.neon.tech`
- **עם pooler:** `ep-xxx-pooler.us-east-1.aws.neon.tech`

את ה־`DATABASE_URL` ב־Vercel (API) הגדר עם המחרוזת **עם** `-pooler`.

### 3. מיגרציות על מסד הפרודקשן

וודא שהטבלאות קיימות ב־DB של הפרודקשן:

```bash
cd apps/api
DATABASE_URL="<ה-DATABASE_URL של הפרודקשן>" npx prisma migrate deploy
```

(או הרץ את זה עם ה־URL מ־Neon Console.)

### 4. בדיקת חיבור DB מפרודקשן

אחרי דיפלוי:

- פתח: `https://coffez-api.vercel.app/health`
- אם מוחזר `{ "status": "ok", "database": "connected" }` – ה־DB מחובר.
- אם `"database": "disconnected"` – יש בעיה ב־`DATABASE_URL` או ברשת (למשל IP allow list ב־Neon).

### 5. צפייה בלוגים של השגיאה האמיתית

נוסף בפרויקט **Exception Filter** שמדפיס כל שגיאת 500 ללוג. ב־Vercel:

- **Dashboard → הפרויקט של ה־API → Logs** (או Deployments → בחר deployment → Function Logs)
- נסה שוב התחברות וחפש שורות עם `AllExceptionsFilter` או את ה־stack trace של השגיאה

שם תופיע השגיאה האמיתית (למשל חוסר `JWT_SECRET`, כישלון חיבור ל־DB, וכו').

---

## סיכום צעדים

1. הגדר ב־Vercel (API): `DATABASE_URL` (עם pooler), `JWT_SECRET`, `CORS_ORIGIN`.
2. הרץ `prisma migrate deploy` מול מסד הפרודקשן.
3. בדוק `/health` ושה־DB מחובר.
4. אחרי דיפלוי מחדש – נסה login ובדוק ב־Logs מה השגיאה אם עדיין 500.
