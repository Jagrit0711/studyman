import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Globe, Users, Search, X, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  id: string;
  name: string;
}

const StudyRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [passwordPrompt, setPasswordPrompt] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from('subjects').select('id, name').order('name');
      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setAllSubjects(data || []);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      let query = supabase.from('study_rooms').select(`
        *,
        profiles (username),
        subjects (name),
        tags (name)
      `);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        toast({ title: 'Error', description: 'Failed to load study rooms.', variant: 'destructive' });
      } else {
        setRooms(data || []);
      }
      setLoading(false);
    };

    const debounceFetch = setTimeout(() => {
        fetchRooms();
    }, 300); // Debounce search input

    return () => clearTimeout(debounceFetch);
  }, [searchTerm, selectedSubject, toast]);

  const handleJoinRoom = (room: any) => {
    if (room.is_private) {
      setPasswordPrompt(room);
    } else {
      window.open(room.meet_link, '_blank');
    }
  };

  const handlePasswordSubmit = async () => {
      if (!password) {
          toast({ title: "Error", description: "Password is required.", variant: 'destructive' });
          return;
      }
      setIsVerifying(true);

      try {
        const session = await supabase.auth.getSession();
        const token = session?.data?.session?.access_token;

        if (!token) {
            throw new Error("Authentication error: Could not get user token.");
        }

        const { data, error } = await supabase.functions.invoke('verify-room-password', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: { roomId: passwordPrompt.id, passwordAttempt: password },
        });

        if (error) throw error;

        if (data.error) {
             toast({ title: "Incorrect Password", description: "Please try again.", variant: 'destructive' });
        } else {
            toast({ title: "Success!", description: "Joining room..."});
            setTimeout(() => {
                window.open(data.meet_link, '_blank');
                setPasswordPrompt(null);
                setPassword('');
            }, 500);
        }
      } catch (error) {
          toast({ title: "Verification Error", description: `An error occurred: ${error.message}`, variant: 'destructive' });
      }

      setIsVerifying(false);
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mb-8 p-6 bg-white shadow-sm rounded-lg">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Study Rooms</h1>
            <p className="text-gray-600 mb-6">Find and join study sessions hosted by the community.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search by room name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
                </div>
                <Select value={selectedSubject} onValueChange={(value) => setSelectedSubject(value || '')}>
                  <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => { setSearchTerm(''); setSelectedSubject('') }} variant="ghost">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
                </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 min-h-[24px]">
                {/* Tag filtering can be re-implemented here if needed */}
            </div>
            </Card>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-lg" />)}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            initial="hidden"
            animate="show"
          >
            {rooms.map((room) => (
              <motion.div key={room.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow h-full rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate font-bold text-xl">{room.name}</span>
                    {room.is_private ? <Lock className="w-5 h-5 text-gray-400" /> : <Globe className="w-5 h-5 text-green-600" />}
                  </CardTitle>
                   <div className="text-sm text-gray-500 pt-1">
                    Hosted by <span className="font-medium text-gray-700">{room.profiles?.username || 'Anonymous'}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary">{room.subjects?.name || 'General'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{room.description || 'No description provided.'}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.tags?.map((tag: any) => <Badge key={tag.name} variant="outline">{tag.name}</Badge>)}
                  </div>
                  <Button onClick={() => handleJoinRoom(room)} className="w-full mt-auto">
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
         {rooms.length === 0 && !loading && (
            <div className="text-center py-16">
                <p className="text-gray-500">No study rooms found. Try clearing your filters or create one!</p>
            </div>
        )}
      </div>

      <Dialog open={!!passwordPrompt} onOpenChange={() => setPasswordPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password for "{passwordPrompt?.name}"</DialogTitle>
            <DialogDescription>This is a private room. Please enter the password to join.</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordPrompt(null)}>Cancel</Button>
            <Button onClick={handlePasswordSubmit} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Join'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyRooms;
