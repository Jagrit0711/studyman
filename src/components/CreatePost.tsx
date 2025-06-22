import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, User, Image, Hash } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CreatePost = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPost, isCreatingPost } = usePosts();
  const { user } = useAuth();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Art', 'Music', 'Other'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !subject) {
      return;
    }
    setIsUploading(true);
    let media_urls: string[] = [];
    let media_types: string[] = [];
    if (images.length > 0 && user) {
      for (const file of images) {
        const ext = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('study-feed-media').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (!error) {
          const url = supabase.storage.from('study-feed-media').getPublicUrl(filePath).data.publicUrl;
          media_urls.push(url);
          media_types.push(file.type);
        }
      }
    }
    setIsUploading(false);
    createPost({
      title: title.trim(),
      content: content.trim(),
      subject,
      media_urls,
      media_types
    });
    // Reset form
    setTitle('');
    setContent('');
    setSubject('');
    setImages([]);
    setImagePreviews([]);
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

            {/* Image Upload */}
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isCreatingPost}
              >
                <Image className="w-4 h-4 mr-2" />
                {images.length > 0 ? 'Change Images' : 'Add Images'}
              </Button>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 group-hover:opacity-100 opacity-0 transition"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                disabled={!title.trim() || !content.trim() || !subject || isCreatingPost || isUploading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isUploading ? 'Uploading...' : isCreatingPost ? 'Posting...' : 'Share Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;
