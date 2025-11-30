import { MadeWithDyad } from "@/components/made-with-dyad";
import Layout from "@/components/Layout";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Index = () => {
  const { currentTrack, currentPlaylist, setCurrentTrack, setIsPlaying } = useMusicPlayer();

  const handlePlayFirstTrack = () => {
    if (currentPlaylist.tracks.length > 0) {
      setCurrentTrack(currentPlaylist.tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Dyad Music Player</h1>
        <p className="text-lg text-muted-foreground">
          Select a track from the sidebar to start listening to the mock playlist.
        </p>

        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Currently Playing</CardTitle>
          </CardHeader>
          <CardContent>
            {currentTrack ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={`https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`} 
                  alt={currentTrack.title} 
                  className="w-24 h-24 rounded object-cover"
                />
                <div>
                  <p className="text-xl font-semibold">{currentTrack.title}</p>
                  <p className="text-md text-muted-foreground">{currentTrack.artist}</p>
                  <p className="text-sm text-muted-foreground mt-1">Duration: {currentTrack.duration}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="mb-4">No track loaded.</p>
                <Button onClick={handlePlayFirstTrack}>
                  <Play className="w-4 h-4 mr-2" /> Start Playlist
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <MadeWithDyad />
      </div>
    </Layout>
  );
};

export default Index;