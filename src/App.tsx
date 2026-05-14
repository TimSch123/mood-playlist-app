import { useState, useEffect } from 'react';
import { MOODS } from './moods';
import type { Mood, UserProfile, PlaylistTrack } from './types';
import {
  isLoggedIn,
  loginToSpotify,
  handleSpotifyCallback,
  getUserProfile,
  searchTracksByMood,
  createPlaylistOnSpotify,
  logout,
  searchTracks,
  getRecommendationsFromTracks,
} from './spotify';
import './index.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [generatedTracks, setGeneratedTracks] = useState<PlaylistTrack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  
  // Vibe Starter feature
  const [vibeMode, setVibeMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaylistTrack[]>([]);
  const [seedTracks, setSeedTracks] = useState<PlaylistTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleSpotifyCallback().then((token) => {
        if (token) {
          setLoggedIn(true);
          window.history.replaceState({}, document.title, '/');
          loadUserProfile();
        }
      });
    } else if (isLoggedIn()) {
      setLoggedIn(true);
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setNeedsSetup(true);
    }
  };

  const handleLogin = () => {
    loginToSpotify();
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    setSelectedMood(null);
    setGeneratedTracks([]);
  };

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setIsGenerating(true);
    setPlaylistCreated(false);

    try {
      const tracks = await searchTracksByMood(mood, 30);
      setGeneratedTracks(tracks);
    } catch (error) {
      console.error('Failed to generate playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user || generatedTracks.length === 0) return;

    setIsGenerating(true);
    try {
      const playlistName = vibeMode 
        ? `🎵 Vibe Mix - ${new Date().toLocaleDateString()}`
        : `${selectedMood?.emoji} ${selectedMood?.name} - ${new Date().toLocaleDateString()}`;
      const trackUris = generatedTracks.map((track) => track.uri);
      await createPlaylistOnSpotify(user.id, playlistName, trackUris);
      setPlaylistCreated(true);
      alert(`Playlist "${playlistName}" created successfully! Check your Spotify app.`);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchTracks(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addSeedTrack = (track: PlaylistTrack) => {
    if (seedTracks.length >= 5) {
      alert('Maximum 5 seed tracks allowed');
      return;
    }
    if (seedTracks.find(t => t.id === track.id)) {
      alert('Track already added');
      return;
    }
    setSeedTracks([...seedTracks, track]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSeedTrack = (trackId: string) => {
    setSeedTracks(seedTracks.filter(t => t.id !== trackId));
  };

  const generateVibePlaylist = async () => {
    if (seedTracks.length === 0) {
      alert('Add at least 1 song to start');
      return;
    }

    setIsGenerating(true);
    setPlaylistCreated(false);

    try {
      const seedIds = seedTracks.map(t => t.id);
      const recommendations = await getRecommendationsFromTracks(seedIds, 30);
      setGeneratedTracks([...seedTracks, ...recommendations]);
    } catch (error) {
      console.error('Failed to generate vibe playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-6xl mb-4 text-center">⚙️</div>
          <h1 className="text-3xl font-bold mb-4 text-center">Setup Required</h1>
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold">To use this app, you need to create a Spotify App:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" className="text-blue-600 underline">Spotify Developer Dashboard</a></li>
              <li>Click "Create App"</li>
              <li>Fill in:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>App Name: "Mood Playlist Generator"</li>
                  <li>Redirect URI: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5175/callback</code></li>
                </ul>
              </li>
              <li>Click "Save"</li>
              <li>Copy your <strong>Client ID</strong></li>
              <li>Open <code className="bg-gray-100 px-2 py-1 rounded">src/spotify.ts</code></li>
              <li>Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_SPOTIFY_CLIENT_ID</code> with your actual Client ID</li>
              <li>Restart the dev server</li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              ✅ 100% Free • No Credit Card • Takes 2 minutes
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            I've Set It Up - Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mood Playlist
          </h1>
          <p className="text-gray-600 mb-6">
            Generate personalized Spotify playlists based on your current mood
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-spotify-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect with Spotify
          </button>
          <p className="text-xs text-gray-500 mt-4">
            100% Free • No Credit Card Required
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.images?.[0]?.url && (
                <img
                  src={user.images[0].url}
                  alt={user.display_name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">🎵 Mood Playlist</h1>
                <p className="text-gray-600">Hey, {user?.display_name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => { setVibeMode(false); setGeneratedTracks([]); setPlaylistCreated(false); }}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                !vibeMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              😊 Mood Playlists
            </button>
            <button
              onClick={() => { setVibeMode(true); setSelectedMood(null); setGeneratedTracks([]); setPlaylistCreated(false); }}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                vibeMode 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎵 Vibe Starter
            </button>
          </div>
        </div>

        {!vibeMode && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">How are you feeling?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={isGenerating}
                  className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
                    selectedMood?.id === mood.id
                      ? 'ring-4 ring-purple-500 scale-105'
                      : ''
                  } bg-gradient-to-br ${mood.color} text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="font-bold text-lg">{mood.name}</div>
                  <div className="text-sm opacity-90">{mood.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {vibeMode && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">🎵 Start with Your Songs</h2>
            <p className="text-gray-600 mb-4">Add 2-5 songs you're vibing with, and we'll complete the playlist!</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a song..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-600 mb-2">Search Results:</p>
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => addSeedTrack(track)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <img src={track.album.images[0]?.url} alt={track.album.name} className="w-10 h-10 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{track.name}</p>
                      <p className="text-xs text-gray-600 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                    </div>
                    <span className="text-2xl">+</span>
                  </div>
                ))}
              </div>
            )}

            {seedTracks.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Your Vibe ({seedTracks.length}/5):</p>
                <div className="space-y-2">
                  {seedTracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
                    >
                      <img src={track.album.images[0]?.url} alt={track.album.name} className="w-12 h-12 rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{track.name}</p>
                        <p className="text-sm text-gray-600 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                      </div>
                      <button
                        onClick={() => removeSeedTrack(track.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seedTracks.length > 0 && (
              <button
                onClick={generateVibePlaylist}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? 'Generating...' : `✨ Complete My Playlist (${seedTracks.length} seed${seedTracks.length > 1 ? 's' : ''})`}
              </button>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">
              {vibeMode ? 'Finding the perfect vibe...' : 'Creating your playlist...'}
            </p>
          </div>
        )}

        {!isGenerating && generatedTracks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {vibeMode ? '🎵 Your Vibe Playlist' : `${selectedMood?.emoji} Your ${selectedMood?.name} Playlist`}
              </h2>
              <button
                onClick={handleCreatePlaylist}
                disabled={playlistCreated}
                className="bg-spotify-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {playlistCreated ? '✅ Saved!' : 'Save to Spotify'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">{generatedTracks.length} tracks</p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {generatedTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-14 h-14 rounded shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {track.artists.map((a) => a.name).join(', ')} • {track.album.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
