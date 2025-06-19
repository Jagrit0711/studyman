
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SkipForward, SkipBack, Search, Music, Settings, Shuffle, Repeat } from 'lucide-react';
import { useSpotify } from '@/hooks/useSpotify';
import AudioPlayer from './AudioPlayer';

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

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchTracks(searchQuery);
      // Filter results to prioritize tracks with preview URLs
      const tracksWithPreview = results.filter(track => track.preview_url);
      const tracksWithoutPreview = results.filter(track => !track.preview_url);
      setSearchResults([...tracksWithPreview, ...tracksWithoutPreview]);
    }
  };

  const playPlaylist = async (playlistId: string) => {
    try {
      const tracks = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`
        }
      }).then(res => res.json());
      
      if (tracks.items && tracks.items.length > 0) {
        const playlistTracks = tracks.items.map((item: any) => item.track).filter(Boolean);
        // Prioritize tracks with preview URLs
        const tracksWithPreview = playlistTracks.filter(track => track.preview_url);
        const finalTracks = tracksWithPreview.length > 0 ? tracksWithPreview : playlistTracks;
        
        setCurrentPlaylist(finalTracks);
        setCurrentTrackIndex(0);
        playTrack(finalTracks[0]);
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
      <Card className="p-6 border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Music</h3>
          <Badge variant="outline" className="border-red-300 text-red-600 bg-red-50">
            Not Connected
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center border border-green-200">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Music className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-700 font-medium mb-2">Connect your Spotify account</p>
            <p className="text-xs text-gray-600">Play 30-second previews during focus sessions</p>
          </div>
          
          <Button 
            onClick={connectSpotify}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Connecting...
              </div>
            ) : (
              <>
                <Music className="w-5 h-5 mr-2" />
                Connect Spotify
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Music</h3>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 rounded-lg">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle>Spotify Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Button 
                  onClick={disconnect} 
                  variant="outline" 
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Disconnect Spotify
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Audio Player Component */}
        <AudioPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayback}
          volume={volume}
          onVolumeChange={setVolume}
        />
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => setIsShuffled(!isShuffled)}
            variant="outline"
            size="sm"
            className={`border-gray-300 rounded-lg transition-all duration-200 ${
              isShuffled 
                ? 'bg-green-100 text-green-700 border-green-300 shadow-sm' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={skipBackward}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            disabled={currentPlaylist.length === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={skipForward}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            disabled={currentPlaylist.length === 0}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setIsRepeating(!isRepeating)}
            variant="outline"
            size="sm"
            className={`border-gray-300 rounded-lg transition-all duration-200 ${
              isRepeating 
                ? 'bg-green-100 text-green-700 border-green-300 shadow-sm' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Playlists */}
        <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50 rounded-xl py-3 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Music & Playlists
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-hidden rounded-xl">
            <DialogHeader>
              <DialogTitle>Search Music & Playlists</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for songs with previews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 rounded-lg"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Search Results</h4>
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        track.preview_url 
                          ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
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
                            className="w-12 h-12 rounded-lg object-cover shadow-sm"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{track.name}</p>
                          <p className="text-xs text-gray-500">
                            {track.artists.map((a: any) => a.name).join(', ')}
                          </p>
                          {track.preview_url ? (
                            <div className="flex items-center mt-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-green-600 font-medium">Preview Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center mt-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-500">No Preview</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Playlists */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Your Playlists</h4>
                {playlists.slice(0, 10).map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer border border-blue-200 transition-all duration-200"
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
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{playlist.name}</p>
                        <p className="text-xs text-gray-500">{playlist.tracks.total} tracks</p>
                      </div>
                    </div>
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
