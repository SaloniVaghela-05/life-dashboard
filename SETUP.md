# Life Dashboard — Setup Guide

## Step 1: Fix Your Supabase Database

Your database was created with camelCase column names. The frontend uses snake_case.

**Go to Supabase → SQL Editor → paste and run `supabase_column_fix.sql`**

> ⚠️ If you get errors about tables already having snake_case names, your DB is already correct — skip this step.

---

## Step 2: Create the Frontend Project

```bash
npx create-next-app@latest life-dashboard --typescript --tailwind --eslint --app --no-src-dir
cd life-dashboard
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr recharts date-fns lucide-react react-hot-toast clsx tailwind-merge
```

## Step 4: Copy All Files

Copy every file from this package into your project, matching the folder structure exactly.

## Step 5: Configure Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Settings → API

## Step 6: Run the App

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to login.

## Step 7: Create Your Account

1. Go to `/auth/signup`
2. Create an account
3. Check your email (Supabase sends a confirmation)
4. Log in

---

## File Structure

```
life-dashboard/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx           ← Overview
│       ├── tasks/page.tsx
│       ├── habits/page.tsx
│       ├── finance/page.tsx
│       ├── goals/page.tsx
│       ├── journal/page.tsx
│       ├── subscriptions/page.tsx
│       └── insights/page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── middleware.ts
├── .env.local          ← YOU CREATE THIS
└── supabase_column_fix.sql
```

---

## Troubleshooting

**"relation does not exist" errors**
→ Your table names may differ. Go to Supabase Table Editor and check the exact table names, then update the queries in each page file.

**Data not loading after login**
→ Check browser console. Usually means the column names in the query don't match your DB. Compare with Table Editor.

**Can't sign up / email not arriving**
→ Go to Supabase → Authentication → Email Templates. For development, you can disable email confirmation in Authentication → Settings.

**RLS errors (403)**  
→ Run the policy section of `supabase_column_fix.sql` to ensure all Row Level Security policies are correct.

---

## Disable Email Confirmation (Development)

Supabase → Authentication → Providers → Email → disable "Confirm email"

This lets you test without email verification.
