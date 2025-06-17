
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';

const CreatePost = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const { createPost, isCreatingPost } = usePosts();

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
      <Card className="p-4 mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsExpanded(true)}>
        <div className="flex items-center space-x-3 text-muted-foreground">
          <Plus className="w-5 h-5" />
          <span>Share your thoughts or ask a question...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create New Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Input
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          placeholder="What's on your mind? Share your thoughts, ask questions, or start a discussion..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        <div className="flex items-center space-x-4">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48">
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

          {subject && (
            <Badge variant="outline">
              {subject}
            </Badge>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || !subject || isCreatingPost}
          >
            {isCreatingPost ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;
