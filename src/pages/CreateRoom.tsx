
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock, Lock, Globe, Plus, X } from 'lucide-react';
import Header from '@/components/Header';

const CreateRoom = () => {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    subject: '',
    maxParticipants: 10,
    duration: '',
    isPrivate: false,
    tags: [] as string[],
    password: ''
  });

  const [newTag, setNewTag] = useState('');

  const subjects = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Medicine',
    'Engineering',
    'Literature',
    'History',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating room:', roomData);
    // TODO: Implement room creation logic
  };

  const addTag = () => {
    if (newTag.trim() && !roomData.tags.includes(newTag.trim())) {
      setRoomData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setRoomData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-notion-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-notion-gray-900 font-mono mb-2">Create Study Room</h1>
            <p className="text-notion-gray-600">Set up a new study session for collaborative learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="notion-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-5 h-5" />
                  <span>Room Details</span>
                </CardTitle>
                <CardDescription>Basic information about your study room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Advanced Calculus Study Group"
                    value={roomData.name}
                    onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                    className="notion-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you'll be studying and what participants can expect..."
                    value={roomData.description}
                    onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                    className="notion-input min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={roomData.subject} onValueChange={(value) => setRoomData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger className="notion-input">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Expected Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2 hours"
                      value={roomData.duration}
                      onChange={(e) => setRoomData(prev => ({ ...prev, duration: e.target.value }))}
                      className="notion-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Settings */}
            <Card className="notion-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Room Settings</span>
                </CardTitle>
                <CardDescription>Configure access and participation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maximum Participants</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="2"
                      max="50"
                      value={roomData.maxParticipants}
                      onChange={(e) => setRoomData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="notion-input w-24"
                    />
                    <span className="text-sm text-notion-gray-600">people</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      {roomData.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      <Label htmlFor="private">Private Room</Label>
                    </div>
                    <p className="text-sm text-notion-gray-600">
                      {roomData.isPrivate ? 'Only people with the password can join' : 'Anyone can join this room'}
                    </p>
                  </div>
                  <Switch
                    id="private"
                    checked={roomData.isPrivate}
                    onCheckedChange={(checked) => setRoomData(prev => ({ ...prev, isPrivate: checked }))}
                  />
                </div>

                {roomData.isPrivate && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Room Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter a secure password"
                      value={roomData.password}
                      onChange={(e) => setRoomData(prev => ({ ...prev, password: e.target.value }))}
                      className="notion-input"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="notion-card">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help others find your room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="notion-input"
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {roomData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roomData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1 bg-notion-gray-900 hover:bg-notion-gray-800"
                disabled={!roomData.name || !roomData.subject}
              >
                <Video className="w-4 h-4 mr-2" />
                Create Room
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
