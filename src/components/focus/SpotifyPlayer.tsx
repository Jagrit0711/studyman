
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, Music, Settings, Shuffle, Repeat } from 'lucide-react';
import { useSpotify } from '@/hooks/useSpotify';

const SpotifyPlayer = () => {
  const { 
    isAuthenticated, 
    playlists, 
    currentTrack, 
    isPlaying, 
    loading,
    connectSpotify, 
    playTrack,
    togglePlayback,
    searchTracks,
    disconnect
  } = useSpotify();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  // Auto-play next track when current ends
  useEffect(() => {
    if (currentPlaylist.length > 0 && !isPlaying) {
      const nextIndex = isShuffled 
        ? Math.floor(Math.random() * currentPlaylist.length)
        : (currentTrackIndex + 1) % currentPlaylist.length;
      
      if (nextIndex !== currentTrackIndex || isRepeating) {
        setCurrentTrackIndex(nextIndex);
        playTrack(currentPlaylist[nextIndex]);
      }
    }
  }, [isPlaying, currentPlaylist, currentTrackIndex, isShuffled, isRepeating]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    }
  };

  const playPlaylist = async (playlistId: string) => {
    try {
      // This would need to be implemented in the Spotify service
      // For now, we'll simulate getting playlist tracks
      const tracks = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`
        }
      }).then(res => res.json());
      
      if (tracks.items && tracks.items.length > 0) {
        const playlistTracks = tracks.items.map((item: any) => item.track).filter(Boolean);
        setCurrentPlaylist(playlistTracks);
        setCurrentTrackIndex(0);
        playTrack(playlistTracks[0]);
      }
    } catch (error) {
      console.error('Failed to play playlist:', error);
    }
  };

  const skipForward = () => {
    if (currentPlaylist.length > 0) {
      const nextIndex = isShuffled 
        ? Math.floor(Math.random() * currentPlaylist.length)
        : (currentTrackIndex + 1) % currentPlaylist.length;
      setCurrentTrackIndex(nextIndex);
      playTrack(currentPlaylist[nextIndex]);
    }
  };

  const skipBackward = () => {
    if (currentPlaylist.length > 0) {
      const prevIndex = isShuffled 
        ? Math.floor(Math.random() * currentPlaylist.length)
        : currentTrackIndex === 0 ? currentPlaylist.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      playTrack(currentPlaylist[prevIndex]);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Music</h3>
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Not Connected
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Connect Spotify to play music</p>
          </div>
          
          <Button 
            onClick={connectSpotify}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Connecting...' : 'Connect Spotify'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Music</h3>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">Connected</Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Spotify Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={disconnect} variant="outline" className="w-full">
                  Disconnect Spotify
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Now Playing with Cover Art */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="flex items-center space-x-3">
            {currentTrack?.album?.images?.[0]?.url ? (
              <img 
                src={currentTrack.album.images[0].url} 
                alt="Album cover"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentTrack ? currentTrack.name : 'No track selected'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentTrack ? currentTrack.artists.map((a: any) => a.name).join(', ') : 'Spotify'}
              </p>
              {currentPlaylist.length > 0 && (
                <p className="text-xs text-blue-600">
                  {currentTrackIndex + 1} of {currentPlaylist.length}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-3">
          <Button
            onClick={() => setIsShuffled(!isShuffled)}
            variant="outline"
            size="sm"
            className={`border-gray-300 ${isShuffled ? 'bg-green-100 text-green-700' : ''}`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={skipBackward}
            variant="outline"
            size="sm"
            className="border-gray-300"
            disabled={currentPlaylist.length === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlayback}
            variant="outline"
            size="lg"
            className="border-gray-300 w-12 h-12"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={skipForward}
            variant="outline"
            size="sm"
            className="border-gray-300"
            disabled={currentPlaylist.length === 0}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setIsRepeating(!isRepeating)}
            variant="outline"
            size="sm"
            className={`border-gray-300 ${isRepeating ? 'bg-green-100 text-green-700' : ''}`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-8">{volume}%</span>
        </div>

        <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-gray-300">
              <Search className="w-4 h-4 mr-2" />
              Search Music
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Search Music & Playlists</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Search Results</h4>
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        playTrack(track);
                        setCurrentPlaylist([track]);
                        setCurrentTrackIndex(0);
                        setShowSearch(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {track.album?.images?.[0]?.url && (
                          <img 
                            src={track.album.images[0].url} 
                            alt="Album cover"
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{track.name}</p>
                          <p className="text-xs text-gray-500">
                            {track.artists.map((a: any) => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Your Playlists</h4>
                {playlists.slice(0, 10).map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      playPlaylist(playlist.id);
                      setShowSearch(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {playlist.images?.[0]?.url ? (
                        <img 
                          src={playlist.images[0].url} 
                          alt="Playlist cover"
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                          <Music className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{playlist.name}</p>
                        <p className="text-xs text-gray-500">{playlist.tracks.total} tracks</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default SpotifyPlayer;
