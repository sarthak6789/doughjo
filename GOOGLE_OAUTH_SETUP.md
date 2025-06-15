# Complete Google OAuth Setup Guide for DoughJo

This guide will walk you through setting up Google OAuth authentication for your DoughJo app step by step.

## Prerequisites

- Supabase project already set up (from SUPABASE_SETUP.md)
- Google account for creating OAuth credentials

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Sign in** with your Google account
3. **Create a new project**:
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `doughjo-oauth`
   - Click "Create"
4. **Select your project** from the dropdown to make it active

## Step 2: Enable Google+ API

1. **Go to APIs & Services**: In the left sidebar, click "APIs & Services" → "Library"
2. **Search for "Google+ API"**: Type in the search box
3. **Enable the API**: Click on "Google+ API" and then click "Enable"
4. **Also enable "Google Identity"**: Search for and enable "Google Identity" API

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth consent screen**: In the left sidebar, click "APIs & Services" → "OAuth consent screen"
2. **Choose User Type**: Select "External" (unless you have a Google Workspace account)
3. **Fill in App Information**:
   - App name: `DoughJo`
   - User support email: Your email
   - App logo: (Optional - you can upload the DoughJo logo later)
   - App domain: Leave blank for now
   - Developer contact information: Your email
4. **Click "Save and Continue"**
5. **Scopes**: Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click "Update" then "Save and Continue"
6. **Test users**: Add your email as a test user
7. **Summary**: Review and click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. **Go to Credentials**: In the left sidebar, click "APIs & Services" → "Credentials"
2. **Create Credentials**: Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. **Create credentials for each platform**:

### For Web Application:
- Application type: "Web application"
- Name: `DoughJo Web`
- Authorized JavaScript origins:
  - `http://localhost:8081` (for development)
  - `https://your-production-domain.com` (add later)
- Authorized redirect URIs:
  - `http://localhost:8081`
  - `https://your-production-domain.com` (add later)
- Click "Create"
- **Save the Client ID** (you'll need this)

### For iOS Application:
- Application type: "iOS"
- Name: `DoughJo iOS`
- Bundle ID: `com.doughjo.app`
- Click "Create"
- **Save the Client ID** (you'll need this)

### For Android Application:
- Application type: "Android"
- Name: `DoughJo Android`
- Package name: `com.doughjo.app`
- SHA-1 certificate fingerprint: (We'll get this in Step 6)
- Click "Create"
- **Save the Client ID** (you'll need this)

## Step 5: Configure Supabase for Google OAuth

1. **Go to your Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Navigate to Authentication**: Click "Authentication" in the left sidebar
3. **Go to Providers**: Click on the "Providers" tab
4. **Enable Google**:
   - Find "Google" in the list and toggle it ON
   - Client ID: Paste your **Web Client ID** from Google Cloud Console
   - Client Secret: Paste your **Web Client Secret** from Google Cloud Console
   - Redirect URL: Copy this URL (you'll need it for Google Cloud Console)
5. **Save the configuration**

## Step 6: Get Android SHA-1 Certificate (For Android)

### For Development:
1. **Open terminal** in your project directory
2. **Run this command**:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. **Copy the SHA-1 fingerprint** from the output
4. **Go back to Google Cloud Console** → Credentials → Your Android OAuth client
5. **Add the SHA-1 fingerprint** and save

### For Production (later):
You'll need to generate a production keystore and get its SHA-1 fingerprint.

## Step 7: Update Environment Variables

1. **Open your `.env` file** in the project root
2. **Add these Google OAuth variables**:

```bash
# Existing Supabase variables
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

**Important**: Replace all the placeholder values with your actual Client IDs from Google Cloud Console.

## Step 8: Update Google Cloud Console Redirect URIs

1. **Go back to Google Cloud Console** → Credentials → Your Web OAuth client
2. **Add Supabase redirect URI**:
   - Copy the redirect URL from Supabase (from Step 5)
   - Add it to "Authorized redirect URIs"
   - Should look like: `https://your-project-id.supabase.co/auth/v1/callback`
3. **Save the changes**

## Step 9: Test the Implementation

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test on different platforms**:
   - **Web**: Google OAuth will show a warning (normal for development)
   - **iOS Simulator**: Should work with proper setup
   - **Android Emulator**: Should work with proper setup
   - **Physical devices**: Requires proper certificates

## Step 10: Handle Development vs Production

### Development Testing:
- Google will show "This app isn't verified" warning
- Click "Advanced" → "Go to DoughJo (unsafe)" to continue
- This is normal for development

### Production Setup (Later):
1. **Verify your app** with Google (requires domain verification)
2. **Update redirect URIs** with production domains
3. **Update environment variables** for production
4. **Generate production certificates** for mobile apps

## Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Check that redirect URIs in Google Cloud Console match exactly
   - Make sure you added the Supabase callback URL

2. **"This app isn't verified"**
   - Normal for development
   - Click "Advanced" → "Go to DoughJo (unsafe)"

3. **"Invalid client ID"**
   - Double-check environment variables
   - Make sure Client IDs are correct for each platform

4. **OAuth not working on mobile**
   - Check bundle ID/package name matches exactly
   - Verify SHA-1 certificate for Android

5. **"Google OAuth Not Available" alert**
   - This appears on web preview - normal behavior
   - Test on actual devices/simulators

### Getting Help:

- Google Cloud Console Help: [https://cloud.google.com/support](https://cloud.google.com/support)
- Supabase Auth Docs: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- Expo Auth Session Docs: [https://docs.expo.dev/guides/authentication/](https://docs.expo.dev/guides/authentication/)

## Security Notes

1. **Never commit Client Secrets** to version control
2. **Use different credentials** for development and production
3. **Regularly rotate credentials** for production apps
4. **Monitor OAuth usage** in Google Cloud Console

## Next Steps

After successful setup:

1. **Test thoroughly** on all target platforms
2. **Set up production credentials** when ready to deploy
3. **Implement additional OAuth providers** if needed (Facebook, Apple, etc.)
4. **Add user profile sync** between Google and your app

Your DoughJo app now supports Google OAuth authentication! 🎉

## Quick Reference

### Environment Variables Template:
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Bundle/Package Identifiers:
- iOS Bundle ID: `com.doughjo.app`
- Android Package: `com.doughjo.app`
- Expo Scheme: `com.doughjo.app`