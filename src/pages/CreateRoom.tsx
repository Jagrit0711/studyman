import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock, Lock, Globe, Plus, X, Calendar, Link as LinkIcon, RefreshCw, Copy } from 'lucide-react';
import Header from '@/components/Header';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
}

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [creationType, setCreationType] = useState<'new' | 'link'>('new');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedEvent, setLastCreatedEvent] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { isConnected, events, fetchEvents, createEvent, updateEvent } = useGoogleCalendar();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from('subjects').select('id, name').order('name');
      if (error) {
        console.error('Error fetching subjects:', error);
        toast({ title: "Database Error", description: "Failed to load subjects.", variant: 'destructive' });
      } else {
        setSubjects(data || []);
      }
    };
    fetchSubjects();
  }, [toast]);

  useEffect(() => {
    if (isConnected && creationType === 'link') {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30); // Fetch next 30 days
      fetchEvents(start, end);
    }
  }, [isConnected, creationType, fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomData.subject) {
      toast({ title: 'Missing Field', description: 'Please select a subject.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setLastCreatedEvent(null);

    if (creationType === 'new') {
      try {
        const newCalEvent = await createEvent({
          summary: roomData.name,
          description: roomData.description,
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
          conferenceData: {
            createRequest: {
              requestId: `zylo-study-hive-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          conferenceDataVersion: 1,
        });

        if (newCalEvent?.hangoutLink) {
          // Step 1: Upsert tags and get their IDs
          const { data: tagData, error: tagsError } = await supabase
            .from('tags')
            .upsert(roomData.tags.map(t => ({ name: t })), { onConflict: 'name' })
            .select('id');

          if (tagsError) throw tagsError;

          // Step 2: Insert the room with subject_id
          const { data: roomInsertData, error: dbError } = await supabase
            .from('study_rooms')
            .insert({
              creator_id: user?.id,
              name: roomData.name,
              description: roomData.description,
              subject_id: roomData.subject,
              is_private: roomData.isPrivate,
              password: roomData.isPrivate ? roomData.password : null,
              meet_link: newCalEvent.hangoutLink
            })
            .select('id')
            .single();
          
          if (dbError) throw dbError;

          // Step 3: Link tags to the room in the join table
          if (roomInsertData && tagData && tagData.length > 0) {
            const roomTagsToInsert = tagData.map(tag => ({
              room_id: roomInsertData.id,
              tag_id: tag.id,
            }));
            const { error: roomTagsError } = await supabase.from('study_room_tags').insert(roomTagsToInsert);
            if (roomTagsError) throw roomTagsError;
          }

          toast({ title: "Success", description: "Your study room has been created!" });
          if (newCalEvent.id) {
            navigate(`/session/${newCalEvent.id}`);
          }
        } else {
          toast({ title: "Meet Error", description: "Failed to create a Google Meet link.", variant: 'destructive' });
        }
      } catch (error: any) {
        console.error("Failed to create room:", JSON.stringify(error, null, 2));
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } else {
      if (!selectedEvent) {
        toast({ title: 'Error', description: 'Please select an event to link.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      try {
        const updatedEvent = await updateEvent(selectedEvent, {
          conferenceData: {
            createRequest: {
              requestId: `zylo-study-hive-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          conferenceDataVersion: 1,
        });

        if (updatedEvent.hangoutLink) {
          if (updatedEvent.id) {
            navigate(`/session/${updatedEvent.id}`);
          } else {
            toast({
              title: 'Error',
              description: 'Could not get event ID after update.',
              variant: 'destructive',
            });
          }
        } else {
          toast({ title: "Meet Error", description: "Failed to add Meet link to the event.", variant: 'destructive' });
        }
      } catch (error) {
        console.error("Failed to update Google Calendar event from CreateRoom.tsx:", JSON.stringify(error, null, 2));
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add Meet link to the event.',
          variant: 'destructive',
        });
      }
    }
    setIsLoading(false);
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
            <h1 className="text-3xl font-bold text-notion-gray-900 font-mono mb-2">Start a Video Call</h1>
            <p className="text-notion-gray-600">Set up a new study session or add a video call to an existing calendar event.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Calendar Integration */}
            <Card className="notion-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Google Calendar</span>
                </CardTitle>
                <CardDescription>
                  {isConnected ? 'Create a new session or link to an existing one.' : 'Connect your Google Calendar to start.'}
                </CardDescription>
              </CardHeader>
              {isConnected && (
                <CardContent>
                  <div className="flex space-x-2 rounded-lg bg-gray-100 p-1 mb-4">
                    <Button
                      type="button"
                      onClick={() => setCreationType('new')}
                      className={`flex-1 ${creationType === 'new' ? 'bg-white shadow' : 'bg-transparent'}`}
                      variant="ghost"
                    >
                      Create New Session
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCreationType('link')}
                      className={`flex-1 ${creationType === 'link' ? 'bg-white shadow' : 'bg-transparent'}`}
                      variant="ghost"
                    >
                      Link to Existing
                    </Button>
                  </div>

                  {creationType === 'link' && (
                    <div className="space-y-2">
                      <Label htmlFor="existing-event">Select an upcoming event</Label>
                      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="notion-input">
                          <SelectValue placeholder="Choose from your calendar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {events.length > 0 ? (
                            events.map(event => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.summary} - {new Date(event.start.dateTime).toLocaleString()}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-events" disabled>
                              No upcoming events found.
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

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
                    <Select
                      value={roomData.subject}
                      onValueChange={(value) => setRoomData(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger id="subject" className="notion-input">
                        <SelectValue placeholder="Select a subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Expected Duration (minutes)</Label>
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
                disabled={!roomData.name || !roomData.subject || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Video className="w-4 h-4 mr-2" />
                )}
                {creationType === 'new' ? 'Create Session' : 'Add Meet Link'}
              </Button>
              <Button type="button" variant="outline" disabled={isLoading}>
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
