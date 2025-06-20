
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AnimatedMomAvatarProps {
  mood?: 'happy' | 'stern' | 'encouraging' | 'nagging' | 'proud';
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedMomAvatar = ({ mood = 'stern', size = 'md' }: AnimatedMomAvatarProps) => {
  const [currentExpression, setCurrentExpression] = useState(mood);
  const [isBlinking, setIsBlinking] = useState(false);

  // Blink animation every 3-5 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Update expression when mood changes
  useEffect(() => {
    setCurrentExpression(mood);
  }, [mood]);

  const expressions = {
    happy: {
      face: '😊',
      eyes: isBlinking ? '😌' : '😊',
      mouth: '😊',
      color: 'from-yellow-400 to-orange-400'
    },
    stern: {
      face: '😤',
      eyes: isBlinking ? '😑' : '😠',
      mouth: '😤',
      color: 'from-red-400 to-pink-400'
    },
    encouraging: {
      face: '🥰',
      eyes: isBlinking ? '😌' : '🥰',
      mouth: '🥰',
      color: 'from-green-400 to-blue-400'
    },
    nagging: {
      face: '😒',
      eyes: isBlinking ? '😑' : '😒',
      mouth: '😒',
      color: 'from-purple-400 to-pink-400'
    },
    proud: {
      face: '🥲',
      eyes: isBlinking ? '😌' : '🥲',
      mouth: '🥲',
      color: 'from-blue-400 to-purple-400'
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const expression = expressions[currentExpression];

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} transition-all duration-300 hover:scale-110`}>
        <AvatarFallback 
          className={`bg-gradient-to-br ${expression.color} border-2 border-white shadow-lg animate-pulse`}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Main face */}
            <span 
              className={`text-white text-lg font-bold transition-all duration-300 ${
                isBlinking ? 'scale-95' : 'scale-100'
              }`}
            >
              {isBlinking ? '😑' : expression.face}
            </span>
            
            {/* Floating hearts when happy/proud */}
            {(currentExpression === 'happy' || currentExpression === 'proud') && (
              <div className="absolute -top-1 -right-1 animate-bounce">
                <span className="text-xs">💖</span>
              </div>
            )}
            
            {/* Steam when stern/nagging */}
            {(currentExpression === 'stern' || currentExpression === 'nagging') && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-0.5 animate-pulse">
                  <span className="text-xs opacity-70">💨</span>
                </div>
              </div>
            )}
          </div>
        </AvatarFallback>
      </Avatar>
      
      {/* Mood indicator ring */}
      <div 
        className={`absolute inset-0 rounded-full border-2 ${
          currentExpression === 'stern' || currentExpression === 'nagging' 
            ? 'border-red-300 animate-pulse' 
            : currentExpression === 'happy' || currentExpression === 'proud'
            ? 'border-green-300 animate-pulse'
            : 'border-blue-300'
        } transition-all duration-500`}
      />
    </div>
  );
};

export default AnimatedMomAvatar;
