# ITS Maintenance Report System

Next.js (App Router) + Supabase + Vercel.

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor > paste `supabase/schema.sql` > Run (creates tables, security rules and the starting faults/RCAs).
3. Project Settings > API: copy the Project URL and the `anon` public key.

## 2. Run locally
```
npm install
cp .env.example .env.local    # paste the URL and anon key
npm run dev
```
Open http://localhost:3000

## 3. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. vercel.com > Add New > Project > import the repository.
3. Add environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy, then share the Vercel URL with the site team.

## Notes
- There is no login: anyone with the link can create reports, edit faults/RCAs and read saved reports. Only share the link with your team.
- A report is saved to History each time GENERATE or REGENERATE is clicked.
