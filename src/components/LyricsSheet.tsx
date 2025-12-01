import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, AlertTriangle, Zap } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { useLyrics } from '@/hooks/use-lyrics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

const LyricsSheet: React.FC = () => {
  const { currentTrack } = useMusicPlayer();
  const [open, setOpen] = useState(false);
  
  const title = currentTrack?.title || null;
  const artist = currentTrack?.artist || null;
  
  const { data: lyricsData, isLoading, isError, error, refetch, isPremium } = useLyrics(title, artist);
  
  // Refetch when sheet opens if data is stale or missing
  useEffect(() => {
      // Only refetch if premium and conditions met
      if (open && isPremium && !lyricsData && title && artist) {
          refetch();
      }
  }, [open, lyricsData, title, artist, refetch, isPremium]);

  const renderContent = () => {
    if (!currentTrack) {
        return <p className="text-muted-foreground text-center p-4">Select a track to view lyrics.</p>;
    }
    
    // --- Premium Check ---
    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Zap className="h-10 w-10 text-primary" />
                <p className="mt-4 text-xl font-semibold text-white">Lyrics are a Premium Feature</p>
                <p className="text-muted-foreground mt-2">Upgrade your account to unlock real-time lyrics for all your tracks.</p>
                <Button asChild className="mt-6">
                    <Link to="/upgrade">
                        <Zap className="h-4 w-4 mr-2" /> Go Premium
                    </Link>
                </Button>
            </div>
        );
    }
    // --- End Premium Check ---
    
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Searching for lyrics...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="mt-4 text-destructive font-medium">Failed to load lyrics.</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.message || "An unknown error occurred."}</p>
        </div>
      );
    }

    if (lyricsData?.lyrics) {
      const isMock = lyricsData.source.includes("Mock Data");
      
      return (
        <ScrollArea className="h-full p-4">
          {isMock && (
              <div className="mb-4 p-3 border border-yellow-500 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      ⚠️ Currently displaying mock lyrics. Please set the `genius_access_token` secret to enable Genius search.
                  </p>
              </div>
          )}
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
            {lyricsData.lyrics}
          </div>
          <p className="text-xs text-muted-foreground mt-6 border-t pt-2">
            Source: {lyricsData.source}
          </p>
        </ScrollArea>
      );
    }
    
    return <p className="text-muted-foreground text-center p-4">No lyrics found for this track.</p>;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 sm:h-10 sm:w-10 text-foreground hover:text-primary"
          disabled={!currentTrack}
          aria-label="View Lyrics"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            Lyrics
          </SheetTitle>
          {currentTrack && (
            <div className="text-left">
                <p className="text-lg font-semibold truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">by {currentTrack.artist}</p>
            </div>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
            {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LyricsSheet;