# Virtual Staging App - Usage Guide

## Quick Start with Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and API keys from Settings > API

### 2. Set Up Database

1. Go to SQL Editor in Supabase Dashboard
2. Paste the contents of `backend/supabase-schema.sql`
3. Click "Run" to create tables

### 3. Set Up Storage

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named: `staging-images`
3. Make it **public** (for image access)

### 4. Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
GOOGLE_API_KEY=your_gemini_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 5. Start the App

```bash
# Backend
cd backend && npm start

# Frontend (new terminal)
cd frontend && npm run dev
```

Open: `http://localhost:5173`

---

## Adding Furniture Sets

Insert furniture via Supabase Dashboard > Table Editor > furniture_sets:

| Column | Example Value |
|--------|---------------|
| name | Modern Sofa Set |
| external_id | LR-MOD-001 |
| url | https://example.com/sofa.jpg |
| category | Living Room |

Or use SQL:
```sql
INSERT INTO furniture_sets (name, external_id, url, category)
VALUES ('Modern Sofa', 'LR-MOD-001', 'https://...', 'Living Room');
```

---

## Deploying to Production

### Deploy Backend to Supabase Edge Functions

1. Install Supabase CLI
2. `supabase functions deploy`

### Or Deploy to Railway/Render

1. Push code to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

Set `VITE_API_URL` to your backend URL.
