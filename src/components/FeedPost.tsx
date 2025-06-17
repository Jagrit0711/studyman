
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share, MoreHorizontal, Clock, Send } from 'lucide-react';
import { Post, usePosts } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface FeedPostProps {
  post: Post;
}

const FeedPost = ({ post }: FeedPostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toggleLike } = usePosts();
  const { comments, createComment, isCreatingComment } = useComments(post.id);

  const handleLike = () => {
    if (!user) return;
    toggleLike({
      postId: post.id,
      isLiked: post.user_has_liked || false
    });
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    createComment(newComment.trim());
    setNewComment('');
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const username = post.profiles?.username || post.profiles?.full_name || 'Anonymous';
  const avatarInitial = username.charAt(0).toUpperCase();

  return (
    <Card className="notion-card p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-notion-gray-600 to-notion-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {avatarInitial}
            </span>
          </div>
          <div>
            <p className="font-medium text-notion-gray-900">@{username}</p>
            <div className="flex items-center space-x-2 text-xs text-notion-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(post.created_at)}</span>
              {post.subject && (
                <Badge variant="outline" className="text-xs">
                  {post.subject}
                </Badge>
              )}
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
              post.user_has_liked ? 'text-red-500' : 'text-notion-gray-500'
            }`}
            onClick={handleLike}
            disabled={!user}
          >
            <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes_count}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2 text-notion-gray-500"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments_count}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-notion-gray-500">
            <Share className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          Reply
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-notion-gray-100">
          {/* Add new comment */}
          {user && (
            <div className="flex space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-notion-gray-600 to-notion-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 flex space-x-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || isCreatingComment}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Display comments */}
          <div className="space-y-3">
            {comments?.map((comment) => {
              const commentUsername = comment.profiles?.username || comment.profiles?.full_name || 'Anonymous';
              const commentAvatar = commentUsername.charAt(0).toUpperCase();
              
              return (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-notion-gray-600 to-notion-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {commentAvatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-notion-gray-900">@{commentUsername}</span>
                      <span className="text-xs text-notion-gray-500">
                        {formatTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-notion-gray-700">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FeedPost;
