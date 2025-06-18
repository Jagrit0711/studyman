
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Users, BookOpen, Clock, Star, Sparkles, Zap, Heart } from 'lucide-react';
import Header from '@/components/Header';

const StudyRooms = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Video,
      title: "Live Study Sessions",
      description: "Join real-time video study rooms with students worldwide",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Create and join subject-specific study groups",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: BookOpen,
      title: "Shared Resources",
      description: "Access and share study materials in real-time",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Clock,
      title: "Scheduled Sessions",
      description: "Plan and schedule study sessions with your peers",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const floatingIcons = [
    { icon: Star, delay: 0, color: "text-yellow-500" },
    { icon: Sparkles, delay: 500, color: "text-purple-500" },
    { icon: Zap, delay: 1000, color: "text-blue-500" },
    { icon: Heart, delay: 1500, color: "text-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Animation */}
        <div className="text-center mb-16 relative">
          {/* Floating Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingIcons.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`absolute ${item.color} animate-bounce`}
                  style={{
                    left: `${20 + index * 20}%`,
                    top: `${10 + (index % 2) * 30}%`,
                    animationDelay: `${item.delay}ms`,
                    animationDuration: '3s'
                  }}
                >
                  <Icon className="w-8 h-8 opacity-30" />
                </div>
              );
            })}
          </div>

          {/* Main Animation */}
          <div className="relative z-10">
            <div className={`mb-8 transition-all duration-1000 ${
              animationPhase === 0 ? 'scale-100 opacity-100' : 
              animationPhase === 1 ? 'scale-110 opacity-90' :
              animationPhase === 2 ? 'scale-105 opacity-95' : 'scale-100 opacity-100'
            }`}>
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center shadow-2xl">
                <Video className={`w-16 h-16 text-white transition-all duration-500 ${
                  animationPhase % 2 === 0 ? 'scale-100' : 'scale-110'
                }`} />
              </div>
            </div>

            <h1 className={`text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent transition-all duration-1000 ${
              animationPhase === 1 ? 'scale-105' : 'scale-100'
            }`}>
              Study Rooms
            </h1>
            
            <div className="relative">
              <p className={`text-xl text-gray-600 mb-8 transition-all duration-1000 ${
                animationPhase === 2 ? 'text-gray-800 scale-105' : 'text-gray-600 scale-100'
              }`}>
                Revolutionary collaborative study experience
              </p>
              
              {/* Animated Coming Soon Badge */}
              <div className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full shadow-lg transition-all duration-1000 ${
                animationPhase === 3 ? 'scale-110 shadow-2xl' : 'scale-100 shadow-lg'
              }`}>
                <Sparkles className={`w-5 h-5 transition-all duration-500 ${
                  animationPhase % 2 === 0 ? 'rotate-0' : 'rotate-180'
                }`} />
                <span className="text-lg font-semibold">Coming Very Soon</span>
                <Sparkles className={`w-5 h-5 transition-all duration-500 ${
                  animationPhase % 2 === 0 ? 'rotate-0' : '-rotate-180'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What's Coming</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`p-8 border-gray-200 hover:shadow-xl transition-all duration-500 hover:scale-105 ${
                    animationPhase === index % 4 ? 'shadow-lg scale-105' : 'shadow-md scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="p-8 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Development Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Design & Planning</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full transition-all duration-1000"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend Development</span>
                <span className="text-sm font-medium text-blue-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-blue-500 h-2 rounded-full transition-all duration-1000 ${
                  animationPhase % 2 === 0 ? 'w-3/4' : 'w-4/5'
                }`}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frontend Development</span>
                <span className="text-sm font-medium text-purple-600">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-purple-500 h-2 rounded-full transition-all duration-1000 ${
                  animationPhase === 1 ? 'w-3/5' : animationPhase === 3 ? 'w-2/3' : 'w-3/5'
                }`}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Testing & QA</span>
                <span className="text-sm font-medium text-orange-600">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`bg-orange-500 h-2 rounded-full transition-all duration-2000 ${
                  animationPhase === 2 ? 'w-1/4' : 'w-1/5'
                }`}></div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-12 border-gray-200 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
            <h3 className="text-3xl font-bold mb-6">Be the First to Know</h3>
            <p className="text-gray-300 mb-8 text-lg">
              Join our waitlist and get early access to Study Rooms when we launch
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className={`bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 transition-all duration-300 ${
                  animationPhase === 0 ? 'scale-105 shadow-lg' : 'scale-100'
                }`}
              >
                Join Waitlist
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyRooms;
