import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share, MoreHorizontal, Clock, Send, User } from 'lucide-react';
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
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {avatarInitial}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">@{username}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(post.created_at)}</span>
                {post.subject && (
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                    {post.subject}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.media_urls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`post-media-${idx}`}
                className="w-32 h-32 object-cover rounded border border-gray-200 bg-gray-100"
                style={{ maxWidth: '100%', maxHeight: '8rem' }}
              />
            ))}
          </div>
        )}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
            {post.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {post.content}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-2 px-2 py-1 ${
                post.user_has_liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
              onClick={handleLike}
              disabled={!user}
            >
              <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes_count}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-2 py-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 px-2 py-1">
              <Share className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reply
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            {/* Add new comment */}
            {user && (
              <div className="flex space-x-3 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 flex space-x-2">
                  <Textarea
                    placeholder="Write a thoughtful comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1 border-gray-300 focus:border-gray-500"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isCreatingComment}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Display comments */}
            <div className="space-y-4">
              {comments?.map((comment) => {
                const commentUsername = comment.profiles?.username || comment.profiles?.full_name || 'Anonymous';
                const commentAvatar = commentUsername.charAt(0).toUpperCase();
                
                return (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {commentAvatar}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">@{commentUsername}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {comments?.length === 0 && (
                <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FeedPost;
