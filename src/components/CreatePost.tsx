
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, User, Image, Hash } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

const CreatePost = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const { createPost, isCreatingPost } = usePosts();
  const { user } = useAuth();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Art', 'Music', 'Other'
  ];

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !subject) {
      return;
    }

    createPost({
      title: title.trim(),
      content: content.trim(),
      subject
    });

    // Reset form
    setTitle('');
    setContent('');
    setSubject('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card 
        className="p-4 mb-6 cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 bg-white"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 text-gray-500">
              <Plus className="w-5 h-5" />
              <span>Share your thoughts, ask a question, or start a discussion...</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 border-gray-200 shadow-md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create New Post</h3>
              <p className="text-sm text-gray-500">Share knowledge with the community</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            placeholder="Give your post a catchy title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-gray-300 focus:border-gray-500 text-lg font-medium"
          />

          <Textarea
            placeholder="What's on your mind? Share your thoughts, ask questions, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="border-gray-300 focus:border-gray-500 resize-none"
          />

          {/* Subject and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subject && (
                <Badge variant="outline" className="border-gray-300 text-gray-600">
                  {subject}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim() || !subject || isCreatingPost}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isCreatingPost ? 'Posting...' : 'Share Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;
