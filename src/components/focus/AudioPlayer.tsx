
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
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

const AudioPlayer = ({ track, isPlaying, onTogglePlay, volume, onVolumeChange }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  console.log('AudioPlayer render:', { 
    track: track?.name, 
    isPlaying, 
    hasPreview: !!track?.preview_url,
    previewUrl: track?.preview_url
  });

  // Reset states when track changes
  useEffect(() => {
    if (track?.preview_url) {
      console.log('Loading new track:', track.name, track.preview_url);
      setAudioLoaded(false);
      setAudioError(false);
      setCurrentTime(0);
      setDuration(0);
      
      if (audioRef.current) {
        audioRef.current.src = track.preview_url;
        audioRef.current.load();
      }
    }
  }, [track?.id, track?.preview_url]);

  // Handle play/pause when isPlaying changes
  useEffect(() => {
    if (audioRef.current && audioLoaded && !audioError) {
      if (isPlaying && track?.preview_url) {
        console.log('Attempting to play audio');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              setAudioError(true);
            });
        }
      } else {
        console.log('Pausing audio');
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioLoaded, track?.preview_url, audioError]);

  // Handle volume changes
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

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log('Audio metadata loaded, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
      setAudioLoaded(true);
      setAudioError(false);
    }
  };

  const handleCanPlay = () => {
    console.log('Audio can play');
    setAudioLoaded(true);
    setAudioError(false);
  };

  const handleEnded = () => {
    console.log('Audio ended');
    onTogglePlay();
    setCurrentTime(0);
  };

  const handleError = (e: any) => {
    console.error('Audio error:', e);
    setAudioError(true);
    setAudioLoaded(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    if (audioRef.current && audioLoaded) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // No track selected
  if (!track) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl text-center border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 font-medium">No track selected</p>
        <p className="text-xs text-gray-500 mt-1">Search for music to get started</p>
      </div>
    );
  }

  // No preview URL available
  if (!track.preview_url) {
    return (
      <div className="p-6 bg-orange-50 rounded-xl text-center border border-orange-200">
        <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <VolumeX className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-sm text-orange-700 font-medium">Preview not available</p>
        <p className="text-xs text-orange-600 mt-1">This track doesn't have a 30-second preview</p>
      </div>
    );
  }

  // Audio error
  if (audioError) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-center border border-red-200">
        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <VolumeX className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-sm text-red-700 font-medium">Audio playback error</p>
        <p className="text-xs text-red-600 mt-1">Failed to load or play this track</p>
        <Button 
          onClick={() => {
            setAudioError(false);
            if (audioRef.current && track.preview_url) {
              audioRef.current.src = track.preview_url;
              audioRef.current.load();
            }
          }}
          variant="outline" 
          size="sm" 
          className="mt-2 border-red-300 text-red-600 hover:bg-red-100"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onCanPlay={handleCanPlay}
        onError={handleError}
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Track Info with Album Art */}
      <div className="flex items-center space-x-4">
        {track.album?.images?.[0]?.url ? (
          <div className="relative">
            <img 
              src={track.album.images[0].url} 
              alt="Album cover"
              className="w-16 h-16 rounded-lg object-cover shadow-md"
            />
            {isPlaying && audioLoaded && (
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
            <div className={`w-2 h-2 rounded-full mr-2 ${
              audioLoaded ? 'bg-green-500' : 'bg-orange-500'
            }`}></div>
            <p className={`text-xs font-medium ${
              audioLoaded ? 'text-green-600' : 'text-orange-600'
            }`}>
              {audioLoaded ? '30s Preview Ready' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Play Button */}
      <div className="flex justify-center">
        <Button
          onClick={onTogglePlay}
          size="lg"
          disabled={!audioLoaded}
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
          disabled={!audioLoaded}
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3 pt-2">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-600" />
          )}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
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

export default AudioPlayer;
