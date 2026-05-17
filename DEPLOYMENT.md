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

## 404 Error" when generating playlist:**
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
- Wait 30 seconds after Vercel deployment
- Hard refresh on iPad: Hold power button → slide to power off → power back on
