# Google OAuth Setup for Lottolista Admin

## 1. Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google People API)

### Steps:
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as application type
4. Set up the OAuth consent screen first if prompted:
   - User Type: **External** (unless you have a Google Workspace)
   - App name: `Lottolista Admin`
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `../auth/userinfo.email` and `../auth/userinfo.profile`
   - Test users: Add the email addresses that should have admin access

5. Configure OAuth 2.0 Client:
   - Name: `Lottolista Admin`
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

## 2. Get Credentials

After creating the OAuth client, you'll get:
- **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

## 3. Configure Environment Variables

1. Copy your `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SESSION_SECRET=some_random_string_here

# Admin Access Control (comma-separated email addresses)
ADMIN_EMAILS=din.epost@gmail.com,annen.admin@gmail.com
```

## 4. Add Admin Users

In the `.env` file, list all email addresses that should have admin access:
```env
ADMIN_EMAILS=halvor@example.com,admin@example.com,boss@example.com
```

Only users with these email addresses can log in to the admin panel.

## 5. Test the Setup

1. Start the server: `npm start`
2. Go to `http://localhost:3000/admin/`
3. You should be redirected to the login page
4. Click "Logg inn med Google" 
5. Complete the Google OAuth flow
6. If your email is in the ADMIN_EMAILS list, you'll be redirected to the admin panel

## Security Features

✅ **OAuth 2.0** - Secure Google authentication  
✅ **Email Whitelist** - Only specific emails can access admin  
✅ **Session Management** - 24-hour login sessions  
✅ **Route Protection** - All admin routes require authentication  
✅ **API Protection** - All data modification APIs require auth  

## Troubleshooting

**"Access denied" error:**
- Make sure your email is in the `ADMIN_EMAILS` list
- Check that there are no extra spaces in the email list

**OAuth error:**
- Verify your Google OAuth credentials are correct
- Make sure the redirect URI matches exactly: `http://localhost:3000/auth/google/callback`
- Check that your OAuth consent screen is configured

**Session issues:**
- Make sure `SESSION_SECRET` is set in your `.env` file
- Clear your browser cookies if you're having login issues

## Production Deployment

For production, update your Google OAuth settings:
- Add your production domain to authorized origins
- Update the callback URL to your production domain
- Set `cookie.secure: true` in session config for HTTPS