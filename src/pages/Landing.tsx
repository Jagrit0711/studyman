
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Video, MessageSquare, ArrowRight, Play, Sparkles, Zap } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Video,
      title: 'Virtual Study Rooms',
      description: 'Immersive collaborative spaces with real-time sync and focus modes.'
    },
    {
      icon: Users,
      title: 'Study Circles',
      description: 'Connect with like-minded learners and build your academic network.'
    },
    {
      icon: MessageSquare,
      title: 'Live Feed',
      description: 'Share insights, ask questions, and stay connected with your community.'
    },
    {
      icon: BookOpen,
      title: 'Smart Organization',
      description: 'AI-powered subject matching and personalized study recommendations.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimalist Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold font-mono tracking-tight">Zylo Study</div>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span className="text-sm text-muted-foreground font-mono">Zylon Labs</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="font-medium">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2 mb-8 border border-border">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Study smarter, not harder</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold font-mono mb-8 leading-none tracking-tight">
            Study
            <br />
            <span className="text-muted-foreground">Together</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            The collaborative study platform designed for the next generation of learners.
            Connect, create, and conquer your academic goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 font-medium group">
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 font-medium group">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-mono mb-6 tracking-tight">
              Built for focus
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to study effectively in one seamless platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Break */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent h-px top-1/2"></div>
            <div className="relative bg-background px-8">
              <Zap className="w-8 h-8 mx-auto text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA */}
      <section className="py-32 px-6 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-6 tracking-tight">
            Ready to level up?
          </h2>
          <p className="text-xl text-background/70 mb-10 max-w-2xl mx-auto">
            Join thousands of students already transforming their study experience.
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-10 py-6 font-medium bg-background text-foreground hover:bg-background/90 border-background/20 group"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-bold font-mono">Zylo Study</div>
              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
              <span className="text-sm text-muted-foreground">by Zylon Labs</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms-conditions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <span className="text-sm text-muted-foreground">© 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
