
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, MoreHorizontal, Clock } from 'lucide-react';

interface FeedPostProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: string;
    timestamp: string;
    likes: number;
    comments: number;
    subject: string;
    isLiked: boolean;
  };
}

const FeedPost = ({ post }: FeedPostProps) => {
  return (
    <Card className="notion-card p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-notion-gray-600 to-notion-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {post.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-notion-gray-900">{post.author}</p>
            <div className="flex items-center space-x-2 text-xs text-notion-gray-500">
              <Clock className="w-3 h-3" />
              <span>{post.timestamp}</span>
              <Badge variant="outline" className="text-xs">
                {post.subject}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      <h3 className="font-semibold text-notion-gray-900 mb-2">
        {post.title}
      </h3>
      
      <p className="text-notion-gray-700 mb-4 leading-relaxed">
        {post.content}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t border-notion-gray-100">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-2 ${
              post.isLiked ? 'text-red-500' : 'text-notion-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-notion-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-notion-gray-500">
            <Share className="w-4 h-4" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm">
          Reply
        </Button>
      </div>
    </Card>
  );
};

export default FeedPost;
