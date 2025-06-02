# Supabase Database Setup for Lottolista

## 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## 2. Get Database Credentials
1. In your Supabase project dashboard, go to Settings → API
2. Copy the following values:
   - Project URL (something like `https://xyzcompany.supabase.co`)
   - anon/public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Setup Environment Variables
1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Tables
1. In your Supabase project, go to the SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to create the tables

## 5. Test the Integration
1. Start the server: `npm start`
2. The server will automatically migrate your existing data.json to Supabase
3. Visit the admin interface to verify everything works

## 6. Backup Strategy
- Your old data.json file is kept as a backup
- Supabase automatically backs up your database
- You can still use the "Download Backup" feature in the admin interface

## Features
- ✅ Automatic migration from JSON to Supabase
- ✅ Real-time database operations
- ✅ Better performance and scalability
- ✅ Built-in backup and security
- ✅ Free tier includes 500MB storage and 2GB bandwidth

## Troubleshooting
- Make sure your `.env` file has the correct Supabase credentials
- Check that the database tables were created successfully
- Verify your Supabase project is active and accessible