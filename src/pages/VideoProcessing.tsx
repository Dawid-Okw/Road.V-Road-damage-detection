import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, Play, Image as ImageIcon, MapPin, Construction, Slash, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProcessedResult {
  id: string;
  damage_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  road_name: string;
  road_category: string;
  confidence_score: number;
  detected_at: string;
  image_url: string;
}

const mockResults: ProcessedResult[] = [
  {
    id: "1",
    damage_type: "pothole",
    severity: "high",
    latitude: 52.56762,
    longitude: 12.97082,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 89.2,
    detected_at: new Date().toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "2",
    damage_type: "crack",
    severity: "low",
    latitude: 52.49322,
    longitude: 12.96267,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 82.5,
    detected_at: new Date(Date.now() - 3600000).toISOString(),
    image_url: "/images/transverse-crack-penzberg.png"
  },
  {
    id: "3",
    damage_type: "pothole",
    severity: "high",
    latitude: 52.45712,
    longitude: 12.93760,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 91.7,
    detected_at: new Date(Date.now() - 7200000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "4",
    damage_type: "crack",
    severity: "medium",
    latitude: 52.393444,
    longitude: 12.833920,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 86.4,
    detected_at: new Date(Date.now() - 10800000).toISOString(),
    image_url: "/images/longitudinal-crack-esslingen.png"
  },
  {
    id: "5",
    damage_type: "pothole",
    severity: "medium",
    latitude: 52.36697,
    longitude: 12.81572,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 88.1,
    detected_at: new Date(Date.now() - 14400000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "6",
    damage_type: "crack",
    severity: "low",
    latitude: 52.32869,
    longitude: 12.82362,
    road_name: "A10",
    road_category: "autobahn",
    confidence_score: 79.3,
    detected_at: new Date(Date.now() - 18000000).toISOString(),
    image_url: "/images/transverse-crack-penzberg.png"
  },
  {
    id: "7",
    damage_type: "pothole",
    severity: "high",
    latitude: 52.236135,
    longitude: 12.917283,
    road_name: "A9",
    road_category: "autobahn",
    confidence_score: 93.2,
    detected_at: new Date(Date.now() - 21600000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "8",
    damage_type: "crack",
    severity: "medium",
    latitude: 52.17525,
    longitude: 12.83180,
    road_name: "A9",
    road_category: "autobahn",
    confidence_score: 84.6,
    detected_at: new Date(Date.now() - 25200000).toISOString(),
    image_url: "/images/transverse-crack-penzberg.png"
  },
  {
    id: "9",
    damage_type: "pothole",
    severity: "low",
    latitude: 52.087087,
    longitude: 12.676528,
    road_name: "A9",
    road_category: "autobahn",
    confidence_score: 81.9,
    detected_at: new Date(Date.now() - 28800000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  }
];

const VideoProcessing = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedResult[]>(() => {
    // Load cached results from sessionStorage
    const cached = sessionStorage.getItem('videoProcessingResults');
    return cached ? JSON.parse(cached) : [];
  });
  const [showResults, setShowResults] = useState(() => {
    // Load cached show state from sessionStorage
    const cached = sessionStorage.getItem('showVideoResults');
    return cached === 'true';
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        // Clean up old video URL if exists
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        setSelectedFile(file);
        setVideoUrl(URL.createObjectURL(file));
        toast.success(`Selected: ${file.name}`);
      } else {
        toast.error("Please select a valid video file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      // Clean up old video URL if exists
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      setSelectedFile(file);
      setVideoUrl(URL.createObjectURL(file));
      toast.success(`Selected: ${file.name}`);
    } else {
      toast.error("Please drop a valid video file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const startProcessing = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setShowResults(false);
    
    // Mock processing delay (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Fetch all A10 and A9 entries from the database
      const { data: dbResults, error } = await supabase
        .from('road_damage')
        .select('*')
        .in('road_name', ['A10', 'A9', 'A 10', 'A 9'])
        .order('detected_at', { ascending: false });

      if (error) throw error;

      // Transform database results to match the expected format
      const formattedResults: ProcessedResult[] = (dbResults || []).map(item => ({
        id: item.id,
        damage_type: item.damage_type,
        severity: item.severity,
        latitude: item.latitude,
        longitude: item.longitude,
        road_name: item.road_name || 'Unknown',
        road_category: item.road_category,
        confidence_score: item.confidence_score || 0,
        detected_at: item.detected_at,
        image_url: item.image_url || '/images/sample-pothole.jpg'
      }));

      setResults(formattedResults);
      setShowResults(true);
      // Cache results in sessionStorage
      sessionStorage.setItem('videoProcessingResults', JSON.stringify(formattedResults));
      sessionStorage.setItem('showVideoResults', 'true');
      toast.success(`Video processing complete! Found ${formattedResults.length} damage points.`);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error("Failed to load processing results");
    } finally {
      setIsProcessing(false);
    }
  };

  const viewOnMap = (result: ProcessedResult) => {
    navigate(`/map?highlight=${result.id}&lat=${result.latitude}&lng=${result.longitude}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-warning border-red-warning/50 bg-red-warning/10";
      case "medium":
        return "text-amber border-amber/50 bg-amber/10";
      case "low":
        return "text-green-500 border-green-500/50 bg-green-500/10";
      default:
        return "text-muted-foreground";
    }
  };

  const getDamageIcon = (damageType: string) => {
    switch (damageType.toLowerCase()) {
      case "pothole":
        return <Construction className="w-4 h-4" />;
      case "crack":
        return <Slash className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Video Processing Demo</h1>
          <p className="text-muted-foreground">
            Upload a road inspection video to detect and analyze damage
          </p>
        </div>

        {/* Upload Section */}
        {!showResults && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div
                  className="flex flex-col items-center justify-center min-h-[300px] cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => !isProcessing && document.getElementById("file-upload")?.click()}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
                      <div className="flex gap-4">
                        <div className="text-6xl animate-spin" style={{ animationDuration: "2s" }}>⚙️</div>
                        <div className="text-6xl animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }}>⚙️</div>
                        <div className="text-6xl animate-spin" style={{ animationDuration: "2.5s" }}>⚙️</div>
                      </div>
                      <h3 className="text-2xl font-semibold">Analyzing video footage...</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Our AI is detecting road damage, calculating severity levels, and mapping coordinates
                      </p>
                    </div>
                  ) : videoUrl ? (
                    <div className="animate-fade-in w-full">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-[400px] rounded-lg mb-4"
                      />
                      <h3 className="text-xl font-semibold mb-2 text-center">
                        {selectedFile?.name}
                      </h3>
                      <p className="text-muted-foreground text-center">
                        Ready to process
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <Upload className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                      <h3 className="text-xl font-semibold mb-2 text-center">
                        Drop video file here
                      </h3>
                      <p className="text-muted-foreground text-center mb-4">
                        or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground text-center">
                        Supported formats: MP4, AVI, MOV
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              disabled={!selectedFile || isProcessing}
              onClick={startProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">⚙️</div>
                    Processing Video...
                  </div>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Processing
                </>
              )}
            </Button>
          </div>
        )}

        {/* Results Table */}
        {showResults && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detection Results</h2>
              <Button variant="outline" onClick={() => { 
                setShowResults(false); 
                setSelectedFile(null);
                if (videoUrl) {
                  URL.revokeObjectURL(videoUrl);
                  setVideoUrl(null);
                }
                // Clear cached results
                sessionStorage.removeItem('videoProcessingResults');
                sessionStorage.removeItem('showVideoResults');
              }}>
                Process Another Video
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detected Damage Points ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="py-3 px-4 font-semibold">Type</th>
                        <th className="py-3 px-4 font-semibold">Severity</th>
                        <th className="py-3 px-4 font-semibold">Coordinates</th>
                        <th className="py-3 px-4 font-semibold">Road</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold">Confidence</th>
                        <th className="py-3 px-4 font-semibold">Detected At</th>
                        <th className="py-3 px-4 font-semibold">Image</th>
                        <th className="py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr
                          key={result.id}
                          className="border-b hover:bg-muted/50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 capitalize">
                              {getDamageIcon(result.damage_type)}
                              {result.damage_type}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getSeverityColor(result.severity)}`}>
                              {result.severity}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <div>{result.latitude.toFixed(4)}°N</div>
                            <div>{result.longitude.toFixed(4)}°E</div>
                          </td>
                          <td className="py-4 px-4 font-medium">{result.road_name}</td>
                          <td className="py-4 px-4">
                            <span className="text-sm uppercase text-muted-foreground">
                              {result.road_category}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-cyan">
                            {result.confidence_score}%
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {new Date(result.detected_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedImage(result.image_url)}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              onClick={() => viewOnMap(result)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <MapPin className="w-4 h-4 mr-1" />
                              View on Map
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Damage detection"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VideoProcessing;
