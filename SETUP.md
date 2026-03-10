# הרצת COFFEZ מקומית

## 1. התקנת תלויות

```bash
pnpm install
```

אם אין לך pnpm:
```bash
npm install -g pnpm
```
או השתמש ב־`npx pnpm` בכל הפקודות.

## 2. PostgreSQL

צריך שרת PostgreSQL שרץ (פורט 5432).

**אפשרות א – Docker:**
```bash
docker run -d --name orderbridge-pg -e POSTGRES_USER=orderbridge -e POSTGRES_PASSWORD=orderbridge -e POSTGRES_DB=orderbridge -p 5432:5432 postgres:16-alpine
```

**אפשרות ב – התקנה מקומית:**  
התקן PostgreSQL והרץ שרת עם מסד בשם `orderbridge`, משתמש `orderbridge` וסיסמה `orderbridge` (או עדכן ב־`.env`).

## 3. קובץ סביבה

הקובץ `apps/api/.env` כבר נוצר עם:
- `DATABASE_URL=postgresql://orderbridge:orderbridge@localhost:5432/orderbridge?schema=public`
- `JWT_SECRET=your-super-secret-jwt-key-min-32-chars`

אם השתמשת במשתמש/סיסמה/שם DB אחרים – עדכן את `DATABASE_URL` ב־`apps/api/.env`.

## 4. מיגרציות ו־seed

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

אם אין עדיין מיגרציה:
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

## 5. הרצת הפרויקט

```bash
pnpm dev
```

- **Web:** http://localhost:3000 (או פורט אחר אם 3000 תפוס)
- **API:** http://localhost:4000

## 6. מיגרציה לשדות קפה (beans, drinkTypes, machineType, openingHours)

אם ה־DB כבר רץ עם מיגרציות ישנות, הרץ פעם אחת:

```bash
cd apps/api
npx prisma migrate deploy
```

אם המיגרציה נכשלת כי הטבלה `seller_profiles` לא קיימת – וודא ש־`migrate deploy` רץ קודם עם מיגרציית ה־init. אם הטבלאות נוצרו ידנית, הוסף את העמודות ב־Neon SQL Editor:

```sql
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "beans" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "drink_types" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "machine_type" TEXT;
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "opening_hours" TEXT;
```

אחרי עדכון ה־DB, הרץ seed מחדש כדי לראות נתוני דמו של קפה:

```bash
cd apps/api
npx prisma db seed
```

## אם משהו נכשל

- **"Cannot find module" / שגיאות build:** הרץ קודם:
  ```bash
  pnpm --filter @orderbridge/shared build
  ```
- **פורט תפוס:** עצור תהליכים על 3000/4000 או שנה פורט ב־`.env` (למשל `PORT=4001`).
- **שגיאת DB:** וודא ש־PostgreSQL רץ ושה־`DATABASE_URL` ב־`apps/api/.env` תואם.
