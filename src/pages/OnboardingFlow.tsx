import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, GraduationCap, BookOpen, Calendar, Plus, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

const OnboardingFlow = () => {
  const { user, loading: authLoading } = useAuth();
  const { subjects, userSubjects, loading, addUserSubject, removeUserSubject } = useSubjects();
  const { colleges, majors, addCollege, addMajor } = useCollegesAndMajors();
  const { saveProfileDetails } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [userDetails, setUserDetails] = useState({
    college: '',
    schoolYear: '',
    major: '',
    enableMomMode: false
  });
  const [customCollege, setCustomCollege] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomMajor, setShowCustomMajor] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigate = useNavigate();

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!authLoading && user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profile && profile.onboarding_completed) {
            console.log('User has already completed onboarding, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      } else if (!authLoading && !user) {
        navigate('/login');
        return;
      }
      setCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate]);

  // Initialize selected subjects from user's existing subjects
  useEffect(() => {
    if (userSubjects.length > 0) {
      setSelectedSubjects(userSubjects.map(us => us.subject_id));
    }
  }, [userSubjects]);

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleAddCustomCollege = async () => {
    if (customCollege.trim()) {
      const newCollege = await addCollege(customCollege.trim());
      if (newCollege) {
        setUserDetails(prev => ({ ...prev, college: newCollege.id }));
        setCustomCollege('');
        setShowCustomCollege(false);
      }
    }
  };

  const handleAddCustomMajor = async () => {
    if (customMajor.trim()) {
      const newMajor = await addMajor(customMajor.trim());
      if (newMajor) {
        setUserDetails(prev => ({ ...prev, major: newMajor.id }));
        setCustomMajor('');
        setShowCustomMajor(false);
      }
    }
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

      // Save user profile details
      const collegeValue = userDetails.college ? 
        colleges.find(c => c.id === userDetails.college)?.name || userDetails.college : 
        '';
      const majorValue = userDetails.major ? 
        majors.find(m => m.id === userDetails.major)?.name || userDetails.major : 
        '';

      await saveProfileDetails({
        college: collegeValue,
        school_year: userDetails.schoolYear,
        major: majorValue,
        enable_mom_mode: userDetails.enableMomMode
      });

      // Update profile with onboarding completion
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url,
            onboarding_completed: true
          });
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (authLoading || loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Welcome Header with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 animate-scale-in">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Zylo Study! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Let's personalize your learning journey in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step < totalSteps ? 'mr-4' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-indigo-600 text-white scale-110'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-16 h-1 transition-all duration-300 ${
                      currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <Card className="shadow-xl border-0 animate-slide-in-right">
          <CardHeader className="text-center pb-4">
            {currentStep === 1 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">Choose Your Study Subjects</CardTitle>
                <CardDescription>
                  Select the subjects you're passionate about studying
                </CardDescription>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">Tell Us About Your Studies</CardTitle>
                <CardDescription>
                  Help us customize your experience based on your academic background
                </CardDescription>
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">Special Features</CardTitle>
                <CardDescription>
                  Configure additional features to enhance your learning experience
                </CardDescription>
              </>
            )}
            {currentStep === 4 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">You're All Set!</CardTitle>
                <CardDescription>
                  Review your information and start your learning journey
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Subject Selection */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                {/* ... keep existing code (subject selection grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {subjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    
                    return (
                      <div
                        key={subject.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => toggleSubject(subject.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {subject.icon && (
                                <span className="text-2xl">{subject.icon}</span>
                              )}
                              <h3 className="font-semibold text-gray-900">
                                {subject.name}
                              </h3>
                            </div>
                          </div>
                          <div className="ml-2">
                            {isSelected ? (
                              <CheckCircle className="w-6 h-6 text-indigo-600 animate-scale-in" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="p-4 bg-indigo-50 rounded-xl animate-fade-in">
                    <h4 className="font-medium text-indigo-900 mb-2">
                      Selected Subjects ({selectedSubjects.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="secondary" className="animate-scale-in">
                            {subject.icon} {subject.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: User Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="college">College/University</Label>
                    {!showCustomCollege ? (
                      <div className="flex space-x-2">
                        <Select onValueChange={(value) => {
                          if (value === 'custom') {
                            setShowCustomCollege(true);
                          } else {
                            setUserDetails(prev => ({ ...prev, college: value }));
                          }
                        }}>
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                            <SelectValue placeholder="Select your institution" />
                          </SelectTrigger>
                          <SelectContent>
                            {colleges.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add Custom Institution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter institution name"
                          value={customCollege}
                          onChange={(e) => setCustomCollege(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAddCustomCollege} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCustomCollege(false)} 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major/Field of Study</Label>
                    {!showCustomMajor ? (
                      <div className="flex space-x-2">
                        <Select onValueChange={(value) => {
                          if (value === 'custom') {
                            setShowCustomMajor(true);
                          } else {
                            setUserDetails(prev => ({ ...prev, major: value }));
                          }
                        }}>
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                            <SelectValue placeholder="Select your major" />
                          </SelectTrigger>
                          <SelectContent>
                            {majors.map((major) => (
                              <SelectItem key={major.id} value={major.id}>
                                {major.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add Custom Major</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter major/field of study"
                          value={customMajor}
                          onChange={(e) => setCustomMajor(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAddCustomMajor} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCustomMajor(false)} 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">School Year</Label>
                  <Select onValueChange={(value) => setUserDetails(prev => ({ ...prev, schoolYear: value }))}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                      <SelectValue placeholder="Select your current year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshman">Freshman (1st Year)</SelectItem>
                      <SelectItem value="sophomore">Sophomore (2nd Year)</SelectItem>
                      <SelectItem value="junior">Junior (3rd Year)</SelectItem>
                      <SelectItem value="senior">Senior (4th Year)</SelectItem>
                      <SelectItem value="graduate">Graduate Student</SelectItem>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Special Features */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Heart className="w-6 h-6 text-pink-600" />
                        <h3 className="text-lg font-semibold text-pink-900">Mom Mode 💝</h3>
                      </div>
                      <p className="text-pink-700 text-sm mb-4">
                        Enable gentle reminders and encouraging messages to help you stay motivated 
                        and maintain healthy study habits. Perfect for students who appreciate a caring, 
                        nurturing approach to learning.
                      </p>
                      <div className="text-xs text-pink-600 space-y-1">
                        <p>• Get gentle study reminders</p>
                        <p>• Receive encouraging messages when you're struggling</p>
                        <p>• Reminders to take breaks and stay hydrated</p>
                        <p>• Celebration of your achievements, big and small</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Switch
                        checked={userDetails.enableMomMode}
                        onCheckedChange={(checked) => 
                          setUserDetails(prev => ({ ...prev, enableMomMode: checked }))
                        }
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-scale-in">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Ready to Start Learning!</h3>
                  <p className="text-gray-600 mb-6">
                    We've set up your personalized study environment. You can always update these preferences later.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Selected Subjects</h4>
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
                  
                  {(userDetails.college || userDetails.major || userDetails.schoolYear) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Academic Info</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {userDetails.college && (
                          <p>Institution: {colleges.find(c => c.id === userDetails.college)?.name}</p>
                        )}
                        {userDetails.major && (
                          <p>Major: {majors.find(m => m.id === userDetails.major)?.name}</p>
                        )}
                        {userDetails.schoolYear && <p>Year: {userDetails.schoolYear}</p>}
                      </div>
                    </div>
                  )}

                  {userDetails.enableMomMode && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Features</h4>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-pink-600" />
                        <span className="text-sm text-gray-600">Mom Mode Enabled 💝</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={completing}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                >
                  {completing ? 'Setting up...' : 'Complete Setup'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
