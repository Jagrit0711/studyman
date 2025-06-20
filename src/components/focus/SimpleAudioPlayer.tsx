
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface SimpleAudioPlayerProps {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    preview_url: string | null;
    album?: {
      images: { url: string }[];
    };
  } | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const SimpleAudioPlayer = ({ track, isPlaying, onTogglePlay, volume, onVolumeChange }: SimpleAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  console.log('SimpleAudioPlayer render:', { 
    trackName: track?.name, 
    isPlaying, 
    hasPreview: !!track?.preview_url,
    isReady
  });

  // Reset and load audio when track changes
  useEffect(() => {
    if (track?.preview_url && audioRef.current) {
      console.log('Loading new track:', track.name);
      setIsReady(false);
      setCurrentTime(0);
      setDuration(0);
      
      audioRef.current.src = track.preview_url;
      audioRef.current.load();
    }
  }, [track?.id, track?.preview_url]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && isReady && track?.preview_url) {
      if (isPlaying) {
        console.log('Playing audio');
        audioRef.current.play().catch(error => {
          console.error('Play failed:', error);
        });
      } else {
        console.log('Pausing audio');
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isReady, track?.preview_url]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedData = () => {
    if (audioRef.current) {
      console.log('Audio loaded and ready');
      setDuration(audioRef.current.duration);
      setIsReady(true);
    }
  };

  const handleEnded = () => {
    console.log('Audio ended');
    onTogglePlay();
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && isReady) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // No track selected
  if (!track) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl text-center border border-gray-200 animate-fade-in">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 font-medium">No track selected</p>
        <p className="text-xs text-gray-500 mt-1">Search for music to get started</p>
      </div>
    );
  }

  // No preview available
  if (!track.preview_url) {
    return (
      <div className="p-6 bg-orange-50 rounded-xl text-center border border-orange-200 animate-fade-in">
        <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <VolumeX className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-sm text-orange-700 font-medium">Preview not available</p>
        <p className="text-xs text-orange-600 mt-1">This track doesn't have a 30-second preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-scale-in">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Track Info */}
      <div className="flex items-center space-x-4">
        {track.album?.images?.[0]?.url ? (
          <div className="relative">
            <img 
              src={track.album.images[0].url} 
              alt="Album cover"
              className="w-16 h-16 rounded-lg object-cover shadow-md transition-transform hover:scale-105"
            />
            {isPlaying && isReady && (
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-green-300 rounded-lg flex items-center justify-center shadow-md">
            <Play className="w-8 h-8 text-green-700" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{track.name}</p>
          <p className="text-sm text-gray-600 truncate">
            {track.artists.map(a => a.name).join(', ')}
          </p>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${
              isReady ? 'bg-green-500' : 'bg-orange-500'
            }`}></div>
            <p className={`text-xs font-medium transition-colors ${
              isReady ? 'text-green-600' : 'text-orange-600'
            }`}>
              {isReady ? '30s Preview Ready' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Play Button */}
      <div className="flex justify-center">
        <Button
          onClick={onTogglePlay}
          size="lg"
          disabled={!isReady}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          max={100}
          step={1}
          className="w-full"
          disabled={!isReady}
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3 pt-2">
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-600" />
          )}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={(value) => {
            onVolumeChange(value[0]);
            setIsMuted(false);
          }}
          max={100}
          step={1}
          className="flex-1"
        />
        
        <span className="text-xs text-gray-600 font-mono w-8 text-right">
          {isMuted ? 0 : volume}%
        </span>
      </div>
    </div>
  );
};

export default SimpleAudioPlayer;
