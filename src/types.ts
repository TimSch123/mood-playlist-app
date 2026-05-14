// TypeScript types for the Mood Playlist App

export type Mood = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  audioFeatures: {
    energy?: [number, number]; // min, max
    valence?: [number, number]; // happiness
    danceability?: [number, number];
    acousticness?: [number, number];
    tempo?: [number, number]; // BPM
  };
};

export type UserProfile = {
  id: string;
  display_name: string;
  images: Array<{ url: string }>;
  email: string;
};

export type PlaylistTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
};

export type GeneratedPlaylist = {
  id: string;
  name: string;
  tracks: PlaylistTrack[];
  mood: Mood;
  createdAt: Date;
};
