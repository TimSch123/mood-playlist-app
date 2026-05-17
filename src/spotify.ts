// Spotify Web API integration
// 100% free - uses Spotify's Web API with OAuth

import type { Mood, UserProfile, PlaylistTrack } from './types';

const CLIENT_ID = '569c040366e34a1b97045c880da135ab';
// Auto-detect: localhost for testing, vercel URL for production
const REDIRECT_URI = window.location.hostname === 'localhost' 
  ? 'http://localhost:8888/callback'
  : `${window.location.origin}/callback`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ');

// Generate random string for state parameter
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

// PKCE challenge generation
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Start Spotify login flow
export async function loginToSpotify(): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);

  localStorage.setItem('code_verifier', codeVerifier);
  localStorage.setItem('auth_state', state);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);

  window.location.href = authUrl.toString();
}

// Handle callback from Spotify
export async function handleSpotifyCallback(): Promise<string | null> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const storedState = localStorage.getItem('auth_state');

  if (!code || state !== storedState) {
    console.error('State mismatch or no code');
    return null;
  }

  const codeVerifier = localStorage.getItem('code_verifier');
  if (!codeVerifier) {
    console.error('No code verifier found');
    return null;
  }

  // Exchange code for access token
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('spotify_access_token', data.access_token);
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
    localStorage.setItem('token_expires_at', String(Date.now() + data.expires_in * 1000));
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('auth_state');
    return data.access_token;
  }

  return null;
}

// Get access token
export function getAccessToken(): string | null {
  return localStorage.getItem('spotify_access_token');
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  const token = getAccessToken();
  const expiresAt = localStorage.getItem('token_expires_at');
  if (!token || !expiresAt) return false;
  return Date.now() < parseInt(expiresAt);
}

// Logout
export function logout(): void {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('token_expires_at');
}

// Fetch with auth
async function spotifyFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Spotify API Error:', response.status, errorText);
    throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  return spotifyFetch('/me');
}

// Get user's top tracks
export async function getUserTopTracks(limit: number = 50): Promise<PlaylistTrack[]> {
  const data = await spotifyFetch(`/me/top/tracks?limit=${limit}&time_range=medium_term`);
  return data.items;
}

// Search for tracks based on mood
ex
  const genreMap: { [key: string]: string } = {
    happy: 'pop',
    chill: 'chill',
    workout: 'rock',
    sad: 'indie',
    party: 'party',
    romantic: 'soul',
    sleep: 'ambient',
    focus: 'classical',
  };

  const genre = genreMap[mood.id] || 'pop';
  
  const params = new URLSearchParams({
    seed_genres: genre, // Just ONE genre to be safe
    limit: String(limit),
    market: 'from_token', // Auto-detect user's market
  });f (audioFeatures.valence) {
    params.append('target_valence', String((audioFeatures.valence[0] + audioFeatures.valence[1]) / 2));
  }

  const data = await spotifyFetch(`/recommendations?${params}`);
  return data.tracks;
}

// Search for tracks by query
export async function searchTracks(query: string, limit: number = 10): Promise<PlaylistTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
  });
  
  const data = await spotifyFetch(`/search?${params}`);
  return data.tracks.items;
}

// Get recommendations based on seed tracks
export async function getRecommendationsFromTracks(
  seedTrackIds: string[],
  limit: number = 30
): Promise<PlaylistTrack[]> {
  const params = new URLSearchParams({
    seed_tracks: seedTrackIds.slice(0, 5).join(','), // Max 5 seeds
    limit: String(limit),
  });

  const data = await spotifyFetch(`/recommendations?${params}`);
  return data.tracks;
}

// Create playlist in user's Spotify
export async function createPlaylistOnSpotify(
  userId: string,
  name: string,
  trackUris: string[]
): Promise<string> {
  // Create playlist
  const playlist = await spotifyFetch(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description: `Generated by Mood Playlist App - ${new Date().toLocaleDateString()}`,
      public: false,
    }),
  });

  // Add tracks to playlist
  await spotifyFetch(`/playlists/${playlist.id}/tracks`, {
    method: 'POST',
    body: JSON.stringify({
      uris: trackUris,
    }),
  });

  return playlist.id;
}

// Update CLIENT_ID (user will need to set this)
export function setClientId(clientId: string): void {
  localStorage.setItem('spotify_client_id', clientId);
}

export function getClientId(): string | null {
  return localStorage.getItem('spotify_client_id') || CLIENT_ID;
}
