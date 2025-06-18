
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

interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
}

class SpotifyService {
  private clientId = '5841c6eb4de54407857fef81e0d60011';
  private clientSecret = 'cdcfea9cd82744a68dafc3dba8fd1dea';
  private redirectUri = window.location.origin + '/focus';
  private scopes = 'user-read-private user-read-email playlist-read-private user-modify-playback-state user-read-playback-state streaming';

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      show_dialog: 'true'
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri
      })
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('spotify_access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }
      return data.access_token;
    }
    throw new Error('Failed to get access token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('spotify_access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get playlists');
    const data = await response.json();
    return data.items || [];
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to get playlist tracks');
    const data = await response.json();
    return data.items.map((item: any) => item.track).filter((track: any) => track);
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to search tracks');
    const data = await response.json();
    return data.tracks.items || [];
  }

  // Web Playback SDK methods (requires Spotify Premium)
  async playTrack(trackUri: string, deviceId?: string): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const body: any = {
      uris: [trackUri]
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to play track');
    }
  }

  async pausePlayback(): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to pause playback');
    }
  }

  async resumePlayback(): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to resume playback');
    }
  }

  async setVolume(volume: number): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to set volume');
    }
  }

  signOut() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
  }
}

export const spotifyService = new SpotifyService();
