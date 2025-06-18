
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, SkipForward, Volume2, Search, Music, Settings } from 'lucide-react';
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

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
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
                <Button onClick={disconnect} variant="outline" className="w-full">
                  Disconnect Spotify
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {currentTrack ? currentTrack.name : 'No track selected'}
          </p>
          <p className="text-xs text-gray-500">
            {currentTrack ? currentTrack.artists.map(a => a.name).join(', ') : 'Spotify'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            onClick={togglePlayback}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-gray-300">
              <Search className="w-4 h-4 mr-2" />
              Search Music
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Search Music</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      playTrack(track);
                      setShowSearch(false);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{track.name}</p>
                      <p className="text-xs text-gray-500">
                        {track.artists.map((a: any) => a.name).join(', ')}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Your Playlists</h4>
                {playlists.slice(0, 5).map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                      <Music className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{playlist.name}</p>
                      <p className="text-xs text-gray-500">{playlist.tracks.total} tracks</p>
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
