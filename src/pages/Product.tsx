import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Camera, Brain, MapPin, AlertTriangle, Shield, Upload, Play, Image as ImageIcon, Construction, Slash } from "lucide-react";
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
    latitude: 50.1109,
    longitude: 8.6821,
    road_name: "A3",
    road_category: "autobahn",
    confidence_score: 97.5,
    detected_at: new Date().toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "2",
    damage_type: "crack",
    severity: "medium",
    latitude: 48.7758,
    longitude: 9.1829,
    road_name: "B27",
    road_category: "bundesstrasse",
    confidence_score: 94.2,
    detected_at: new Date(Date.now() - 3600000).toISOString(),
    image_url: "/images/transverse-crack-penzberg.png"
  },
  {
    id: "3",
    damage_type: "pothole",
    severity: "low",
    latitude: 52.5200,
    longitude: 13.4050,
    road_name: "L101",
    road_category: "landesstrasse",
    confidence_score: 89.8,
    detected_at: new Date(Date.now() - 7200000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
  {
    id: "4",
    damage_type: "crack",
    severity: "high",
    latitude: 51.3397,
    longitude: 12.3731,
    road_name: "A9",
    road_category: "autobahn",
    confidence_score: 96.3,
    detected_at: new Date(Date.now() - 10800000).toISOString(),
    image_url: "/images/transverse-crack-penzberg.png"
  },
  {
    id: "5",
    damage_type: "pothole",
    severity: "medium",
    latitude: 50.9375,
    longitude: 6.9603,
    road_name: "K32",
    road_category: "kreisstrasse",
    confidence_score: 91.7,
    detected_at: new Date(Date.now() - 14400000).toISOString(),
    image_url: "/images/sample-pothole.jpg"
  },
];

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Scroll to demo section if hash is present
  useEffect(() => {
    if (location.hash === "#demo") {
      setTimeout(() => {
        document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-cyan" />,
      title: "Drone-Based Imaging",
      description: "High-resolution aerial photography captures road conditions from optimal angles, ensuring comprehensive coverage of road infrastructure.",
    },
    {
      icon: <Brain className="w-6 h-6 text-cyan" />,
      title: "AI-Powered Detection",
      description: "Advanced computer vision algorithms identify potholes, cracks, and other road damage with 99.2% accuracy, reducing manual inspection time.",
    },
    {
      icon: <MapPin className="w-6 h-6 text-cyan" />,
      title: "Precise Geolocation",
      description: "Every detected damage is mapped with exact GPS coordinates, making it easy to locate and prioritize repair work.",
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-cyan" />,
      title: "Severity Classification",
      description: "Automatic categorization of damage severity helps authorities prioritize maintenance and allocate resources efficiently.",
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan" />,
      title: "Jurisdiction-Based Access",
      description: "Role-based access control ensures each authority sees only their relevant road segments, from federal highways to municipal streets.",
    },
  ];

  const benefits = [
    "Reduce road inspection costs by up to 70%",
    "Identify damage 10x faster than manual surveys",
    "Prioritize repairs based on data-driven severity metrics",
    "Maintain comprehensive historical damage records",
    "Improve public safety through proactive maintenance",
    "Optimize budget allocation across road networks",
  ];

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
    navigate(`/map?lat=${result.latitude}&lng=${result.longitude}`);
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-navy-dark text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Transform Road Maintenance with{" "}
              <span className="text-cyan-bright bg-gradient-to-r from-cyan via-cyan-bright to-cyan-light bg-clip-text text-transparent">
                Intelligent Detection
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-4">
              Road.V combines drone technology and artificial intelligence to revolutionize how road authorities
              detect, track, and manage infrastructure damage.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete solution for modern road infrastructure management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-cyan transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="mb-3">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Why Choose Road.V?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How It Works</h2>
          <div className="space-y-8">
            <Card className="border-l-4 border-l-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-cyan text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                  Drone Flight & Data Capture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Drones equipped with high-resolution cameras fly over designated road sections, capturing detailed imagery
                  of the road surface from multiple angles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-cyan text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    2
                  </span>
                  AI Analysis & Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our computer vision algorithms process the imagery, detecting and classifying various types of road damage
                  including potholes, cracks, and surface deterioration.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-cyan text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    3
                  </span>
                  Dashboard & Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All detected damage appears in your personalized dashboard, complete with location data, severity ratings,
                  and visual evidence. Prioritize repairs and track maintenance history all in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Processing Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-16 md:py-24 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Our Video Processing Demo</h2>
            <p className="text-muted-foreground text-lg">
              Upload a road inspection video to see our AI detection in action
            </p>
          </div>

          {/* Upload Section */}
          {!showResults && (
            <div className="space-y-6 animate-fade-in">
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

          {/* Processing Animation - REMOVED since it's now inside upload container */}

          {/* Results Table */}
          {showResults && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Detection Results</h3>
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
                          <th className="py-3 px-4 font-semibold">Confidence</th>
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
                            <td className="py-4 px-4 font-semibold text-cyan">
                              {result.confidence_score}%
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
        </div>
      </section>

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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 Road.V. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Product;
