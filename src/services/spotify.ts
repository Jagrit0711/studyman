
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
      // Store token expiry time
      const expiryTime = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      return data.access_token;
    }
    throw new Error('Failed to get access token');
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        const expiryTime = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        return data.access_token;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
    return null;
  }

  async getValidAccessToken(): Promise<string | null> {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (!token) return null;
    
    // Check if token is expired
    if (expiry && Date.now() > parseInt(expiry)) {
      console.log('Token expired, refreshing...');
      return await this.refreshAccessToken();
    }
    
    return token;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('spotify_access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (!token) return false;
    if (expiry && Date.now() > parseInt(expiry)) {
      // Token expired, but we might be able to refresh it
      return !!localStorage.getItem('spotify_refresh_token');
    }
    
    return true;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let token = await this.getValidAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    // If unauthorized, try to refresh token once
    if (response.status === 401) {
      token = await this.refreshAccessToken();
      if (token) {
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
          }
        });
      }
    }

    return response;
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me');
    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me/playlists?limit=50');
    if (!response.ok) throw new Error('Failed to get playlists');
    const data = await response.json();
    return data.items || [];
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await this.makeAuthenticatedRequest(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`);
    if (!response.ok) throw new Error('Failed to get playlist tracks');
    const data = await response.json();
    return data.items.map((item: any) => item.track).filter((track: any) => track);
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    const response = await this.makeAuthenticatedRequest(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
    if (!response.ok) throw new Error('Failed to search tracks');
    const data = await response.json();
    return data.tracks.items || [];
  }

  // Web Playback SDK methods (requires Spotify Premium)
  async playTrack(trackUri: string, deviceId?: string): Promise<void> {
    const body: any = {
      uris: [trackUri]
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to play track');
    }
  }

  async pausePlayback(): Promise<void> {
    const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to pause playback');
    }
  }

  async resumePlayback(): Promise<void> {
    const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to resume playback');
    }
  }

  async setVolume(volume: number): Promise<void> {
    const response = await this.makeAuthenticatedRequest(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to set volume');
    }
  }

  signOut() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
  }
}

export const spotifyService = new SpotifyService();
