# Deploy Lottolista til Vercel

## Hvorfor Vercel?
- ✅ **Gratis** for personlige prosjekter
- ✅ **Enkel deployment** direkte fra GitHub
- ✅ **Automatisk HTTPS** og CDN
- ✅ **Serverless functions** perfekt for Node.js
- ✅ **Automatiske deployments** ved git push

## 📋 Forhåndskrav
1. GitHub-konto med lottolista-repo
2. Ferdig konfigurert Supabase database
3. Google OAuth credentials (se SETUP_GOOGLE_AUTH.md)

## 🚀 Deployment Steps

### 1. Forbered Git Repository
```bash
# Push alle endringer til GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy til Vercel

**Alternativ A: Via Vercel Dashboard (Anbefalt)**
1. Gå til [vercel.com](https://vercel.com) og logg inn med GitHub
2. Klikk "New Project"
3. Velg ditt lottolista repository
4. Vercel detecter automatisk at det er en Node.js app
5. Klikk "Deploy" (ikke endre noe ennå)

**Alternativ B: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Konfigurer Environment Variables

I Vercel Dashboard for ditt prosjekt:

1. Gå til **Settings** → **Environment Variables**
2. Legg til følgende variabler:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret_here
ADMIN_EMAILS=din.epost@gmail.com,annen.admin@gmail.com
NODE_ENV=production
```

3. Klikk "Save" for hver variabel

### 4. Oppdater Google OAuth Settings

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Naviger til **APIs & Services** → **Credentials**
3. Klikk på din OAuth 2.0 Client ID
4. Legg til din Vercel URL i **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
5. Legg til callback URL i **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/auth/google/callback
   ```

### 5. Redeploy
Etter å ha lagt til environment variables:
1. Gå til **Deployments** tab i Vercel
2. Klikk "..." på latest deployment → "Redeploy"
3. Eller push en ny commit til GitHub for auto-deploy

## 🔧 Vercel Configuration

Prosjektet inkluderer `vercel.json` som konfigurerer:
- Node.js serverless functions
- Routing for admin, API og auth endpoints
- Production environment variables

## 🌐 Din App er Live!

Etter deployment vil appen være tilgjengelig på:
```
https://your-app-name.vercel.app
```

- **Hovedside**: `https://your-app-name.vercel.app/`
- **Admin**: `https://your-app-name.vercel.app/admin/`
- **Login**: `https://your-app-name.vercel.app/auth/login`

## 🔧 Feilsøking

**Build failed:**
- Sjekk at alle dependencies er i `package.json`
- Kontroller at `vercel.json` er riktig konfigurert

**OAuth error:**
- Verifiser at Google OAuth URLs matcher din Vercel URL
- Sjekk at environment variables er satt riktig
- Test at `ADMIN_EMAILS` inneholder din e-post

**Database connection error:**
- Kontroller Supabase credentials
- Sjekk at Supabase tabeller er opprettet (kjør `database-schema.sql`)

**Session issues:**
- Sørg for at `SESSION_SECRET` er satt
- Kontroller at cookies fungerer med HTTPS

## 📊 Monitoring

I Vercel Dashboard kan du:
- Se deployment logs
- Overvåke function invocations
- Sjekke performance metrics
- Se error logs

## 💰 Kostnader

**Vercel Free Tier inkluderer:**
- 100GB bandwidth per måned
- 1000 serverless function invocations per dag
- Perfekt for personlige prosjekter som lottolista

## 🔄 Automatic Deployments

Hver gang du pusher til `main` branch på GitHub:
1. Vercel bygger automatisk en ny versjon
2. Kjører tester (hvis du har noen)
3. Deployer til production
4. Gir deg en ny URL

## 🎯 Neste Steg

1. Test at alt fungerer på production URL
2. Oppdater eventuelle hardkodede localhost URLer
3. Sett opp monitoring/alerts hvis ønskelig
4. Del den nye URLen med lottolista-deltakerne!