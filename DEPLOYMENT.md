# 🎵 Mood Playlist Generator - Deployment Guide

## 📱 Deploy to iPad (FREE & Easy!)

### Step 1: Setup Spotify App (FIRST TIME ONLY)

1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - **App name:** `Mood Playlist`
   - **Redirect URIs:** (add BOTH of these)
     - `http://localhost:8888/callback` (for local testing)
     - `https://mood-playlist-app-chi.vercel.app/callback` (or your Vercel URL)
4. Copy your **Client ID**
5. Open `src/spotify.ts` and verify the Client ID is set correctly

**IMPORTANT: Enable Playlist Creation**

Since the app is in Development Mode, you need to add users who can create playlists:

1. In the Spotify Developer Dashboard, open your app
2. Click **"Users and Access"** (or "Settings" → "User Management")
3. Click **"Add New User"**
4. Enter the Spotify email/username of anyone who should create playlists
5. Click "Add"

**Note:** You can add up to 25 users in Development Mode. Everyone else can still VIEW and GENERATE playlists - they just can't save them to Spotify (they can use the "Copy List" button instead).

### Step 2: Deploy to Vercel (100% FREE)

1. **Create a GitHub account** (if you don't have one): https://github.com/signup

2. **Install GitHub Desktop** (easiest way):
   - Download from: https://desktop.github.com/
   - Sign in with your GitHub account

3. **Push your project to GitHub**:
   - Open GitHub Desktop
   - Click "Add" → "Add existing repository"
   - Choose this folder: `mood-playlist-app`
   - Click "Publish repository"
   - Make it **Public** (required for free Vercel)
   - Click "Publish"

4. **Deploy with Vercel**:
   - Go to https://vercel.com/signup
   - Click "Continue with GitHub"
   - Click "Import Project"
   - Select your `mood-playlist-app` repository
   - Click "Deploy"
   - Wait 1-2 minutes ✨

5. **You'll get a URL like:** `https://mood-playlist-app-xyz.vercel.app`

### Step 3: Update Spotify Redirect URI

1. Go back to https://developer.spotify.com/dashboard
2. Open your app
3. Click "Settings"
4. Under "Redirect URIs", ADD (don't replace):
   - `https://your-vercel-url.vercel.app/callback`
   - Example: `https://mood-playlist-app-xyz.vercel.app/callback`
5. Click "Save"

### Step 4: Install on iPad 🎉

1. Open Safari on her iPad
2. Go to your Vercel URL: `https://mood-playlist-app-xyz.vercel.app`
3. Tap the Share button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "Mood Playlist" and tap "Add"

**Done!** She now has it as a full-screen app on her iPad! 📱✨

---

## 🔒 Data Privacy & Security

- ✅ **No backend server** - all API calls go directly from her iPad to Spotify
- ✅ **No data stored** - everything stays in her browser (localStorage)
- ✅ **HTTPS encryption** - Vercel provides automatic SSL
- ✅ **100% free forever** - No credit card, no hidden costs
- ✅ **You can delete anytime** - Just remove from Vercel dashboard

---

## 🛠️ Future Updates

When you make changes:
1. Commit and push to GitHub (via GitHub Desktop)
2. Vercel automatically re-deploys (takes 1 minute)
3. She refreshes the app on her iPad

---

## ❓ Troubleshooting

**"403 Forbidden" when saving playlist:**
- The app is in Development Mode (max 25 users can create playlists)
- **Solution 1:** Add your Spotify email in Developer Dashboard → Users and Access
- **Solution 2:** Use the "📋 Copy List" button to copy tracks and manually create playlist
- **Solution 3:** Request Extended Quota Mode (see below)

**"404 Error" when generating playlist:**
- ✅ FIXED: The app was using invalid Spotify genre seeds
- Make sure you've deployed the latest code to Vercel
- Redeploy: Push changes to GitHub, Vercel auto-deploys

**"Invalid Client" error:**
- Make sure the redirect URI in Spotify dashboard matches your Vercel URL exactly
- Must include BOTH redirect URIs:
  - `http://localhost:8888/callback`
  - `https://your-vercel-url.vercel.app/callback`

**Can't login on Vercel:**
- Check Spotify Developer Dashboard → Your App → Settings
- Make sure your Vercel URL is added under "Redirect URIs"
- Format: `https://mood-playlist-app-chi.vercel.app/callback`

**App won't install on iPad:**
- Make sure you're using Safari (not Chrome)
- Check that PWA meta tags are in `index.html` (already added ✅)

**Changes not showing:**
- Wait 30 seconds after Vercel deployment
- Hard refresh on iPad: Safari → Refresh button (tap and hold)
- Or clear Safari cache: Settings → Safari → Clear History and Website Data

---

## 🚀 Request Extended Quota Mode (Optional)

To remove the 25-user limit and enable playlist creation for everyone:

1. Go to https://developer.spotify.com/dashboard
2. Open your app
3. Look for **"Request Extension"** or **"Quota Extension"** button
4. Fill out the form:
   - **Use case:** Personal mood-based playlist generator
   - **Description:** Creates personalized playlists based on moods for personal use
5. Submit and wait for approval (usually 1-2 weeks)

Once approved, anyone can create playlists without being added to the user list!
- Hard refresh on iPad: Hold power button → slide to power off → power back on
