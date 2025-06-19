
import { useState, useEffect } from 'react';
import { spotifyService } from '@/services/spotify';
import { useToast } from '@/hooks/use-toast';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  external_urls: { spotify: string };
  album?: {
    images: { url: string }[];
  };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
}

export const useSpotify = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = spotifyService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      // Check for auth code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code && !isAuth) {
        handleAuthCallback(code);
      }
    };

    checkAuth();
  }, []);

  const handleAuthCallback = async (code: string) => {
    try {
      setLoading(true);
      await spotifyService.exchangeCodeForToken(code);
      setIsAuthenticated(true);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: "Success",
        description: "Connected to Spotify successfully"
      });
      
      // Load playlists
      await loadPlaylists();
    } catch (error) {
      console.error('Failed to authenticate with Spotify:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Spotify",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = () => {
    const authUrl = spotifyService.getAuthUrl();
    window.location.href = authUrl;
  };

  const loadPlaylists = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const userPlaylists = await spotifyService.getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track: SpotifyTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    toast({
      title: "Now Playing",
      description: `${track.name} by ${track.artists.map(a => a.name).join(', ')}`
    });
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
    if (!isAuthenticated || !query.trim()) return [];
    
    try {
      return await spotifyService.searchTracks(query);
    } catch (error) {
      console.error('Failed to search tracks:', error);
      toast({
        title: "Error",
        description: "Failed to search tracks",
        variant: "destructive"
      });
      return [];
    }
  };

  const disconnect = () => {
    spotifyService.signOut();
    setIsAuthenticated(false);
    setPlaylists([]);
    setCurrentTrack(null);
    setIsPlaying(false);
    
    toast({
      title: "Disconnected",
      description: "Spotify has been disconnected"
    });
  };

  useEffect(() => {
    if (isAuthenticated && playlists.length === 0) {
      loadPlaylists();
    }
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    playlists,
    currentTrack,
    isPlaying,
    loading,
    connectSpotify,
    playTrack,
    togglePlayback,
    searchTracks,
    disconnect,
    loadPlaylists
  };
};
