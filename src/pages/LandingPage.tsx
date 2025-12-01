import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListMusic, Zap, Lock } from 'lucide-react';
import { AppCredit } from '@/components/AppCredit';

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border shadow-lg transition-transform hover:scale-[1.02] duration-300">
        <div className="text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      
      {/* Header/Nav */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Manga Music Logo" className="h-8 w-8 rounded-full" />
          <h1 className="text-xl font-semibold text-white">Manga Music</h1>
        </div>
        <Button asChild>
          <Link to="/login">
            Sign In
          </Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-5xl space-y-8 py-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white">
            Your Personal, Self-Hosted <span className="text-primary">YouTube Music</span> Collection
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Create, manage, and listen to your favorite YouTube tracks in personalized playlists, complete with drag-and-drop reordering and media controls.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <Button asChild size="lg">
              <Link to="/login">
                Get Started Free <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                Explore YouTube
              </a>
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <section className="w-full max-w-6xl py-16">
            <h2 className="text-3xl font-bold mb-12 text-white">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<ListMusic className="h-8 w-8" />}
                    title="Custom Playlists"
                    description="Organize your favorite YouTube videos into unlimited, personalized music playlists."
                />
                <FeatureCard 
                    icon={<Zap className="h-8 w-8" />}
                    title="Fast Playback"
                    description="Seamless, ad-free playback experience with full media controls and keyboard shortcuts."
                />
                <FeatureCard 
                    icon={<Lock className="h-8 w-8" />}
                    title="Secure & Private"
                    description="Your data is securely managed using Supabase, ensuring privacy and robust authentication."
                />
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <AppCredit />
      </footer>
    </div>
  );
};

export default LandingPage;