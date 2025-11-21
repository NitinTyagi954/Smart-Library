# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for "Continue with Google" sign-in.

## Backend Implementation ✅

The backend implementation is complete:
- ✅ Google auth library installed (`google-auth-library`)
- ✅ `/auth/google-signin` endpoint created
- ✅ User model updated with `googleId` field
- ✅ Environment configuration added

## Frontend Implementation ✅

The frontend implementation is complete:
- ✅ Google OAuth library installed (`@react-oauth/google`)
- ✅ GoogleSignInButton component created
- ✅ App wrapped with GoogleOAuthProvider
- ✅ Google button added to login and signup forms

## Required: Google Cloud Console Setup

You need to create OAuth credentials in Google Cloud Console:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name: `SmartLibrary` (or any name)
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `SmartLibrary`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip this (click "Save and Continue")
   - Test users: Add your email (for testing)
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `SmartLibrary Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://gentle-bay-0cb5bce00.3.azurestaticapps.net
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/login
     http://localhost:3000/signup
     https://gentle-bay-0cb5bce00.3.azurestaticapps.net/login
     https://gentle-bay-0cb5bce00.3.azurestaticapps.net/signup
     ```
   - Click "Create"

5. **Copy the credentials:**
   - Client ID: `YOUR_CLIENT_ID.apps.googleusercontent.com`
   - Client Secret: `YOUR_CLIENT_SECRET`

### Step 4: Update Environment Variables

#### Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_Rhx1QRTWogcjld
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

#### Backend `.env`:
```env
# ... existing vars ...

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### Step 5: Update Azure Configuration

Add to Azure App Service environment variables:
```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

Add to Azure Static Web Apps configuration:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

## How It Works

### User Flow:
1. User clicks "Continue with Google" button on login/signup page
2. Google OAuth popup appears
3. User selects Google account and grants permission
4. Frontend receives credential token from Google
5. Frontend sends token to backend `/auth/google-signin`
6. Backend verifies token with Google
7. Backend finds or creates user in database
8. Backend generates JWT tokens and sets cookies
9. Frontend receives user data and redirects:
   - Admin → `/admin`
   - Student → `/services`

### Security Features:
- Google token is verified server-side
- JWT tokens are used for subsequent requests
- OAuth users get random password hash (can't use email/password login)
- `googleId` is stored for user tracking

## Testing Locally

1. **Start backend:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Test Google sign-in:**
   - Go to http://localhost:3000/login
   - Click "Continue with Google"
   - Select your Google account
   - Should redirect to `/admin` or `/services`

## Deployment

After setting up Google OAuth credentials:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add Google OAuth sign-in"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Build the frontend
   - Deploy to Azure Static Web Apps
   - Deploy backend to Azure App Service

3. **Verify deployment:**
   - Frontend: https://gentle-bay-0cb5bce00.3.azurestaticapps.net
   - Backend: https://smartlibrary-backend-gtgnhmescehehuhj.eastasia-01.azurewebsites.net

## Troubleshooting

### Error: "Popup closed by user"
- User closed Google popup before completing sign-in
- Ask user to try again

### Error: "Invalid Google token"
- Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Verify token is being sent correctly to backend

### Error: "Google authentication failed"
- Check backend logs for specific error
- Verify `GOOGLE_CLIENT_SECRET` is correct
- Ensure Google+ API is enabled

### Users can't sign in
- Verify Authorized JavaScript origins include your domain
- Check OAuth consent screen is published (for production)
- Add test users if app is in testing mode

## Notes

- **Phone number:** Google OAuth doesn't provide phone numbers. OAuth users will have empty phone field.
- **Password:** OAuth users can't use email/password login (random hash is set).
- **Role:** All OAuth users default to "student" role. Change in database if admin needed.
- **Testing mode:** Google OAuth apps start in "Testing" mode. Only test users can sign in.
- **Publishing:** To allow all users, publish the OAuth consent screen (requires verification for some scopes).
