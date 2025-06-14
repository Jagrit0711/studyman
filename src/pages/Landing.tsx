
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Video, MessageSquare, Star, ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Video,
      title: 'Virtual Study Rooms',
      description: 'Create or join study rooms with video chat, screen sharing, and collaborative tools.'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Connect with fellow students studying the same subjects and form lasting study partnerships.'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Feed',
      description: 'Share questions, resources, and study tips with the community in real-time.'
    },
    {
      icon: BookOpen,
      title: 'Subject Organization',
      description: 'Organize your studies by subject and find others working on similar topics.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      content: 'Zylo Study transformed how I approach group studying. The virtual rooms make it so easy to collaborate.',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      role: 'Pre-Med Student',
      content: 'Found my study group here and we\'ve been crushing our exams together. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Engineering Student',
      content: 'The best platform for collaborative learning. Love the community aspect and the tools.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">Zylo Study</div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">by Zylon Labs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-mono">
            Study Together,
            <br />
            <span className="text-gray-600 dark:text-gray-300">Succeed Together</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students collaborating in virtual study rooms, sharing knowledge, 
            and achieving academic excellence together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-lg px-8 py-3">
                Start Studying Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              Everything You Need to Study Smart
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful tools designed to make collaborative studying effortless and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-mono">
                Why Students Choose Zylo Study
              </h2>
              <div className="space-y-4">
                {[
                  'Connect with students from your university or worldwide',
                  'Organize study sessions by subject and difficulty level',
                  'Share resources, notes, and study materials instantly',
                  'Track your study progress and build lasting connections',
                  'Access 24/7 study rooms whenever you need them'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">Active Students</div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">Study Rooms Daily</div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of successful students already using Zylo Study
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-400 mb-8">
            Join the community of students who are already studying smarter, not harder.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-200 text-lg px-8 py-3">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-mono">Zylo Study</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">by Zylon Labs</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              © 2024 Zylon Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
