import { AppCredit } from "@/components/AppCredit";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { currentTrack, currentPlaylist, setCurrentTrack, setIsPlaying, isLoadingData } = useMusicPlayer();

  const handlePlayFirstTrack = () => {
    if (currentPlaylist && currentPlaylist.tracks.length > 0) {
      setCurrentTrack(currentPlaylist.tracks[0]);
      setIsPlaying(true);
    }
  };
  
  // Calculate height dynamically: 100vh - Player (80px) - Header (64px)
  const mainContentHeightClass = "min-h-[calc(100vh-80px-64px)]";
  
  if (isLoadingData) {
      return (
          <div className={cn("p-4 sm:p-8 flex items-center justify-center", mainContentHeightClass)}>
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-lg text-muted-foreground">Loading application data...</p>
          </div>
      );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-4 sm:p-8", mainContentHeightClass)}>
      
      <div className="w-full max-w-4xl text-center space-y-10">
        
        <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Manga Music Player</h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              Your personalized, self-hosted YouTube music collection.
            </p>
        </div>

        <Card className="w-full p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-primary/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Now Playing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {currentTrack ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                <img 
                  src={`https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`} 
                  alt={currentTrack.title} 
                  className="w-full max-w-sm aspect-video rounded-xl shadow-lg object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
                <div className="text-center space-y-1">
                  <p className="text-xl sm:text-3xl font-bold tracking-tight">{currentTrack.title}</p>
                  <p className="text-sm sm:text-lg text-muted-foreground">{currentTrack.artist}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground pt-2">Duration: {currentTrack.duration}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 sm:p-8 border border-dashed border-border rounded-lg w-full">
                <p className="mb-4 text-base sm:text-lg text-muted-foreground">
                  {currentPlaylist && currentPlaylist.tracks.length > 0 
                    ? `Playlist "${currentPlaylist.name}" is loaded but no track is playing.` 
                    : "Your playlist is empty. Add a track using the sidebar."
                  }
                </p>
                {currentPlaylist && currentPlaylist.tracks.length > 0 && (
                    <Button onClick={handlePlayFirstTrack} size="lg">
                      <Play className="w-5 h-5 mr-2" /> Start Listening
                    </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-auto pt-10">
        <AppCredit />
      </div>
    </div>
  );
};

export default Index;