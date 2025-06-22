import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Link as LinkIcon, Copy, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const SessionReady = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getEvent, isInitializing, isConnected } = useGoogleCalendar();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const eventDetails = await getEvent(eventId);
        setEvent(eventDetails);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load session details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isInitializing && isConnected) {
      fetchEventDetails();
    } else if (!isInitializing && !isConnected) {
        setLoading(false);
        toast({
            title: 'Not Connected',
            description: 'Please connect to Google Calendar to view session details.',
            variant: 'destructive'
        })
    }
  }, [eventId, getEvent, toast, isInitializing, isConnected]);

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-notion-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card className="notion-card">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-56 mb-4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (!event) {
     return (
      <div className="min-h-screen bg-notion-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Session Not Found</h1>
            <p className="text-notion-gray-600">The requested session could not be found or you are not connected to Google Calendar.</p>
            <Button asChild className="mt-4">
                <Link to="/create-room">Create a New Session</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
            <Button asChild variant="ghost" className="mb-4">
                <Link to="/create-room">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Create
                </Link>
            </Button>
          <Card className='bg-green-50 border-green-200'>
            <CardHeader>
              <CardTitle className='text-green-800'>Session Ready!</CardTitle>
              <CardDescription>Your video call is ready to join.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{event.summary}</p>
              {event.hangoutLink ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <Input
                      type="text"
                      readOnly
                      value={event.hangoutLink}
                      className="flex-1 bg-transparent border-none focus:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(event.hangoutLink);
                        toast({ title: 'Copied!', description: 'Meet link copied to clipboard.' });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button asChild className="w-full">
                    <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4 mr-2" />
                      Join with Google Meet
                    </a>
                  </Button>
                </div>
              ) : (
                 <p className="text-sm text-yellow-700 mt-2">
                    A Google Meet link was not generated for this event.
                  </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SessionReady; 