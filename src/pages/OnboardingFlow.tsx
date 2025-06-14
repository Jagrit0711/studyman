
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';

const OnboardingFlow = () => {
  const { user } = useAuth();
  const { subjects, userSubjects, loading, addUserSubject, removeUserSubject } = useSubjects();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Initialize selected subjects from user's existing subjects
  useEffect(() => {
    if (userSubjects.length > 0) {
      setSelectedSubjects(userSubjects.map(us => us.subject_id));
    }
  }, [userSubjects]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleCompleteOnboarding = async () => {
    setCompleting(true);
    
    try {
      // Remove subjects that are no longer selected
      const toRemove = userSubjects
        .filter(us => !selectedSubjects.includes(us.subject_id))
        .map(us => us.subject_id);
      
      // Add new subjects
      const toAdd = selectedSubjects.filter(
        subjectId => !userSubjects.some(us => us.subject_id === subjectId)
      );

      // Execute removals
      for (const subjectId of toRemove) {
        await removeUserSubject(subjectId);
      }

      // Execute additions
      for (const subjectId of toAdd) {
        await addUserSubject(subjectId);
      }

      // Mark onboarding as completed
      if (user) {
        await supabase
          .from('profiles' as any)
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url,
            onboarding_completed: true
          } as any);
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-gray-900 mx-auto mb-4"></div>
          <p className="text-notion-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-notion-gray-900 mb-2">
            Welcome to Zylo Study! 🎉
          </h1>
          <p className="text-notion-gray-600">
            Let's personalize your experience by selecting your study subjects
          </p>
        </div>

        <Card className="notion-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Study Subjects</CardTitle>
            <CardDescription>
              Select the subjects you're interested in studying. You can always change these later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                
                return (
                  <div
                    key={subject.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'border-notion-gray-900 bg-notion-gray-50'
                        : 'border-notion-gray-200 hover:border-notion-gray-300'
                    }`}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {subject.icon && (
                            <span className="text-2xl">{subject.icon}</span>
                          )}
                          <h3 className="font-semibold text-notion-gray-900">
                            {subject.name}
                          </h3>
                        </div>
                        {subject.description && (
                          <p className="text-sm text-notion-gray-600">
                            {subject.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        {isSelected ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-notion-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSubjects.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Selected Subjects ({selectedSubjects.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subjectId) => {
                    const subject = subjects.find(s => s.id === subjectId);
                    return subject ? (
                      <Badge key={subjectId} variant="secondary">
                        {subject.icon} {subject.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={() => handleCompleteOnboarding()}
                disabled={completing}
              >
                Skip for now
              </Button>
              
              <Button
                onClick={handleCompleteOnboarding}
                disabled={completing}
                className="bg-notion-gray-900 hover:bg-notion-gray-800"
              >
                {completing ? 'Setting up...' : 'Complete Setup'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
