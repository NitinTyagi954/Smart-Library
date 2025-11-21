# Google OAuth Authorization Error Fix

## Error: "Access blocked: Authorization Error - Missing required parameter: client_id"

This error means Google Cloud Console isn't configured correctly for your app.

## Quick Fix Steps (5 minutes)

### Step 1: Go to Google Cloud Console
- https://console.cloud.google.com/

### Step 2: Select Your Project
- Look for project dropdown at top
- Find your SmartLibrary project or create one

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (if not already selected)
3. Fill in:
   - **App name:** SmartLibrary
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **Save and Continue**
5. **Scopes:** Skip (just click **Save and Continue**)
6. **Test users:**
   - Click **Add users**
   - Add your email address (the one you'll use to test)
7. Click **Save and Continue**
8. Click **Back to Dashboard**

### Step 4: Update OAuth Client Credentials

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (should be there already)
3. Click on it to edit
4. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000
   http://localhost:3000/login
   http://localhost:3000/signup
   http://127.0.0.1:3000
   http://127.0.0.1:3000/login
   ```
6. Click **Save**

### Step 5: Verify Your Credentials

Make sure your `.env.local` has the correct Client ID:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=377973410536-gegc18qoa7njb68h0gu00hrsikdj9dqm.apps.googleusercontent.com
```

### Step 6: Test Locally

1. **Clear browser cache/cookies** (Ctrl+Shift+Delete)
2. **Restart frontend:** Kill and restart `npm run dev`
3. Go to http://localhost:3000/login
4. Click "Continue with Google"
5. Select your Google account (the one you added as test user)

## Common Issues

### "Invalid client" or "Redirect URI mismatch"
- Check that `http://localhost:3000` is in **Authorized JavaScript origins**
- Check that `http://localhost:3000/login` is in **Authorized redirect URIs**

### "Access denied" or OAuth consent screen shows error
- Make sure you added your email as a **test user** in the consent screen
- The app is in "Testing" mode, so only test users can sign in

### Still seeing "client_id" error
- Your Client ID might not be set correctly
- Double-check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
- Restart frontend after changing `.env`

## For Production Deployment

When deploying to Azure:

1. Add authorized origins:
   ```
   https://gentle-bay-0cb5bce00.3.azurestaticapps.net
   ```

2. Add authorized redirect URIs:
   ```
   https://gentle-bay-0cb5bce00.3.azurestaticapps.net
   https://gentle-bay-0cb5bce00.3.azurestaticapps.net/login
   https://gentle-bay-0cb5bce00.3.azurestaticapps.net/signup
   ```

3. Publish the OAuth consent screen (requires app verification)

## Next Steps

After fixing these settings:
1. Clear cookies and restart frontend
2. Try Google sign-in again
3. You should see the Google account selector
4. Sign in with your test user email

If you still get errors, check Google Cloud Console logs for more details.
