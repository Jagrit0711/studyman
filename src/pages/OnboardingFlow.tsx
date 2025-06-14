
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, GraduationCap, BookOpen, Calendar, Plus, Heart, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

const OnboardingFlow = () => {
  const { user, loading: authLoading } = useAuth();
  const { subjects, userSubjects, loading, addUserSubject, removeUserSubject, addNewSubject, refetch } = useSubjects();
  const { colleges, majors, addCollege, addMajor } = useCollegesAndMajors();
  const { saveProfileDetails } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showAddNewSubject, setShowAddNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
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

  const handleAddNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    setAddingSubject(true);
    try {
      const newSubject = await addNewSubject(newSubjectName.trim());
      
      if (newSubject) {
        // Add to selected subjects
        setSelectedSubjects(prev => [...prev, newSubject.id]);
        
        // Reset form
        setNewSubjectName('');
        setShowAddNewSubject(false);
      }
    } catch (error) {
      console.error('Error adding new subject:', error);
    } finally {
      setAddingSubject(false);
    }
  };

  // Get subjects for main grid (limit to first 12 most common ones)
  const getMainGridSubjects = () => {
    const commonSubjectNames = [
      'Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Art',
      'Music', 'Physical Education', 'Biology', 'Chemistry', 'Physics', 'Geography'
    ];
    
    const commonSubjects = subjects.filter(subject => 
      commonSubjectNames.includes(subject.name)
    ).slice(0, 12);
    
    // If we don't have enough common subjects, fill with others
    if (commonSubjects.length < 12) {
      const remainingSubjects = subjects
        .filter(subject => !commonSubjectNames.includes(subject.name))
        .slice(0, 12 - commonSubjects.length);
      return [...commonSubjects, ...remainingSubjects];
    }
    
    return commonSubjects;
  };

  // Get subjects that are not in the main grid for the dropdown
  const getDropdownSubjects = () => {
    const mainGridSubjectIds = getMainGridSubjects().map(s => s.id);
    return subjects
      .filter(subject => !mainGridSubjectIds.includes(subject.id) && !selectedSubjects.includes(subject.id))
      .sort((a, b) => a.name.localeCompare(b.name));
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  const mainGridSubjects = getMainGridSubjects();
  const dropdownSubjects = getDropdownSubjects();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Welcome Header with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 animate-scale-in">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
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
                      ? 'bg-black text-white scale-110'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`w-16 h-1 transition-all duration-300 ${
                      currentStep > step ? 'bg-black' : 'bg-gray-200'
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

        <Card className="shadow-xl border-2 border-gray-200 animate-slide-in-right">
          <CardHeader className="text-center pb-4">
            {currentStep === 1 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-black">Choose Your Study Subjects</CardTitle>
                <CardDescription className="text-gray-600">
                  Select the subjects you're passionate about studying
                </CardDescription>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-black">Tell Us About Your Studies</CardTitle>
                <CardDescription className="text-gray-600">
                  Help us customize your experience based on your academic background
                </CardDescription>
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-black">Special Features</CardTitle>
                <CardDescription className="text-gray-600">
                  Configure additional features to enhance your learning experience
                </CardDescription>
              </>
            )}
            {currentStep === 4 && (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-black">You're All Set!</CardTitle>
                <CardDescription className="text-gray-600">
                  Review your information and start your learning journey
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Subject Selection */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {mainGridSubjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    
                    return (
                      <div
                        key={subject.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          isSelected
                            ? 'border-black bg-gray-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => toggleSubject(subject.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {subject.icon && (
                                <span className="text-2xl">{subject.icon}</span>
                              )}
                              <h3 className="font-semibold text-black">
                                {subject.name}
                              </h3>
                            </div>
                          </div>
                          <div className="ml-2">
                            {isSelected ? (
                              <CheckCircle className="w-6 h-6 text-black animate-scale-in" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Browse More Subjects Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-gray-200 hover:border-gray-400">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-2xl">🔍</span>
                              <h3 className="font-semibold text-black">Browse More</h3>
                            </div>
                            <p className="text-sm text-gray-600">Find more subjects</p>
                          </div>
                          <div className="ml-2">
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 max-h-80 overflow-y-auto bg-white border border-gray-300 shadow-lg">
                      {dropdownSubjects.length > 0 ? (
                        <>
                          {dropdownSubjects.map((subject) => (
                            <DropdownMenuItem
                              key={subject.id}
                              onClick={() => toggleSubject(subject.id)}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <span className="text-lg">{subject.icon || '📚'}</span>
                              <span className="text-black font-medium">{subject.name}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      ) : (
                        <>
                          <div className="p-3 text-sm text-gray-500 text-center">
                            All subjects are already selected!
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => setShowAddNewSubject(true)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-black" />
                        <span className="text-black font-medium">Add New Subject</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Add New Subject Modal */}
                {showAddNewSubject && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-xl animate-fade-in border border-gray-200">
                    <h4 className="font-medium text-black mb-4">Add New Subject</h4>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter subject name (e.g., Photography, Cooking, Web Development...)"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="flex-1 border-gray-300 focus:border-black"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNewSubject()}
                      />
                      <Button 
                        onClick={handleAddNewSubject} 
                        disabled={!newSubjectName.trim() || addingSubject}
                        className="bg-black hover:bg-gray-800 text-white"
                        size="sm"
                      >
                        {addingSubject ? 'Adding...' : 'Add'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddNewSubject(false);
                          setNewSubjectName('');
                        }}
                        className="border-gray-300 text-black hover:bg-gray-50"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This subject will be saved to the database and available for all future users.
                    </p>
                  </div>
                )}

                {selectedSubjects.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl animate-fade-in">
                    <h4 className="font-medium text-black mb-2">
                      Selected Subjects ({selectedSubjects.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="secondary" className="bg-white border border-gray-300 text-black animate-scale-in">
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
                    <Label htmlFor="college" className="text-black">College/University</Label>
                    {!showCustomCollege ? (
                      <div className="flex space-x-2">
                        <Select onValueChange={(value) => {
                          if (value === 'custom') {
                            setShowCustomCollege(true);
                          } else {
                            setUserDetails(prev => ({ ...prev, college: value }));
                          }
                        }}>
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-black border-gray-300">
                            <SelectValue placeholder="Select your institution" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300">
                            {colleges.map((college) => (
                              <SelectItem key={college.id} value={college.id} className="hover:bg-gray-50">
                                {college.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className="hover:bg-gray-50">+ Add Custom Institution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter institution name"
                          value={customCollege}
                          onChange={(e) => setCustomCollege(e.target.value)}
                          className="flex-1 border-gray-300 focus:border-black"
                        />
                        <Button onClick={handleAddCustomCollege} className="bg-black hover:bg-gray-800 text-white" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCustomCollege(false)} 
                          className="border-gray-300 text-black hover:bg-gray-50"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major" className="text-black">Major/Field of Study</Label>
                    {!showCustomMajor ? (
                      <div className="flex space-x-2">
                        <Select onValueChange={(value) => {
                          if (value === 'custom') {
                            setShowCustomMajor(true);
                          } else {
                            setUserDetails(prev => ({ ...prev, major: value }));
                          }
                        }}>
                          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-black border-gray-300">
                            <SelectValue placeholder="Select your major" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300">
                            {majors.map((major) => (
                              <SelectItem key={major.id} value={major.id} className="hover:bg-gray-50">
                                {major.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className="hover:bg-gray-50">+ Add Custom Major</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter major/field of study"
                          value={customMajor}
                          onChange={(e) => setCustomMajor(e.target.value)}
                          className="flex-1 border-gray-300 focus:border-black"
                        />
                        <Button onClick={handleAddCustomMajor} className="bg-black hover:bg-gray-800 text-white" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCustomMajor(false)} 
                          className="border-gray-300 text-black hover:bg-gray-50"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-black">School Year</Label>
                  <Select onValueChange={(value) => setUserDetails(prev => ({ ...prev, schoolYear: value }))}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-black border-gray-300">
                      <SelectValue placeholder="Select your current year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      <SelectItem value="freshman" className="hover:bg-gray-50">Freshman (1st Year)</SelectItem>
                      <SelectItem value="sophomore" className="hover:bg-gray-50">Sophomore (2nd Year)</SelectItem>
                      <SelectItem value="junior" className="hover:bg-gray-50">Junior (3rd Year)</SelectItem>
                      <SelectItem value="senior" className="hover:bg-gray-50">Senior (4th Year)</SelectItem>
                      <SelectItem value="graduate" className="hover:bg-gray-50">Graduate Student</SelectItem>
                      <SelectItem value="high-school" className="hover:bg-gray-50">High School</SelectItem>
                      <SelectItem value="other" className="hover:bg-gray-50">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Special Features */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Heart className="w-6 h-6 text-black" />
                        <h3 className="text-lg font-semibold text-black">Mom Mode 💝</h3>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">
                        Enable gentle reminders and encouraging messages to help you stay motivated 
                        and maintain healthy study habits. Perfect for students who appreciate a caring, 
                        nurturing approach to learning.
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
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
                        className="data-[state=checked]:bg-black"
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
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4 animate-scale-in">
                    <CheckCircle className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-black">Ready to Start Learning!</h3>
                  <p className="text-gray-600 mb-6">
                    We've set up your personalized study environment. You can always update these preferences later.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-black mb-2">Selected Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subjectId) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="secondary" className="bg-white border border-gray-300 text-black">
                            {subject.icon} {subject.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  {(userDetails.college || userDetails.major || userDetails.schoolYear) && (
                    <div>
                      <h4 className="font-medium text-black mb-2">Academic Info</h4>
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
                      <h4 className="font-medium text-black mb-2">Special Features</h4>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-black" />
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
                className="transition-all duration-200 border-gray-300 text-black hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="bg-black hover:bg-gray-800 text-white transition-all duration-200"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={completing}
                  className="bg-black hover:bg-gray-800 text-white transition-all duration-200"
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
