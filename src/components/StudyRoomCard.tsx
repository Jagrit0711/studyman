
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Clock, Lock, Globe } from 'lucide-react';

interface StudyRoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    participants: number;
    maxParticipants: number;
    isActive: boolean;
    isPrivate: boolean;
    duration: string;
    subject: string;
    host: string;
  };
}

const StudyRoomCard = ({ room }: StudyRoomCardProps) => {
  return (
    <Card className="notion-card p-4 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <Badge variant="secondary" className="text-xs">
            {room.subject}
          </Badge>
          {room.isPrivate ? (
            <Lock className="w-4 h-4 text-notion-gray-400" />
          ) : (
            <Globe className="w-4 h-4 text-notion-gray-400" />
          )}
        </div>
        <div className="flex items-center space-x-1 text-notion-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{room.participants}/{room.maxParticipants}</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-notion-gray-900 mb-2 line-clamp-1">
        {room.name}
      </h3>
      
      <p className="text-sm text-notion-gray-600 mb-3 line-clamp-2">
        {room.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-notion-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{room.duration}</span>
        </div>
        <span>by {room.host}</span>
      </div>
      
      <div className="flex space-x-2">
        <Button size="sm" className="flex-1 bg-notion-gray-900 hover:bg-notion-gray-800">
          <Video className="w-4 h-4 mr-2" />
          Join Room
        </Button>
        <Button variant="outline" size="sm">
          View
        </Button>
      </div>
    </Card>
  );
};

export default StudyRoomCard;
