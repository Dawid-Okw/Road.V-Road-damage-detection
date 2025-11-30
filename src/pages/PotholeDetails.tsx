import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PotholeStats {
  carriageway: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  footway: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recentPotholes: any[];
}

const PotholeDetails = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<PotholeStats>({
    carriageway: { total: 0, high: 0, medium: 0, low: 0 },
    footway: { total: 0, high: 0, medium: 0, low: 0 },
    recentPotholes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadStats();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const { data: potholeData, error } = await supabase
        .from('road_damage')
        .select('*')
        .eq('damage_type', 'pothole')
        .order('detected_at', { ascending: false });

      if (error) throw error;

      // Categorize by road category (using footway vs carriageway logic)
      const carriageway = potholeData?.filter(d => 
        d.road_category !== 'footway' && d.road_category !== 'pedestrian'
      ) || [];
      const footway = potholeData?.filter(d => 
        d.road_category === 'footway' || d.road_category === 'pedestrian'
      ) || [];

      setStats({
        carriageway: {
          total: carriageway.length,
          high: carriageway.filter(d => d.severity === 'high').length,
          medium: carriageway.filter(d => d.severity === 'medium').length,
          low: carriageway.filter(d => d.severity === 'low').length
        },
        footway: {
          total: footway.length,
          high: footway.filter(d => d.severity === 'high').length,
          medium: footway.filter(d => d.severity === 'medium').length,
          low: footway.filter(d => d.severity === 'low').length
        },
        recentPotholes: potholeData?.slice(0, 6) || []
      });
    } catch (error) {
      console.error('Error loading pothole stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  const categories = [
    {
      title: "Carriageway Potholes",
      stats: stats.carriageway,
      icon: <AlertTriangle className="w-8 h-8 text-amber" />,
      color: "border-amber/50",
      bgColor: "bg-amber/5 hover:bg-amber/10",
      description: "Potholes on vehicle roadways"
    },
    {
      title: "Footway Potholes",
      stats: stats.footway,
      icon: <AlertTriangle className="w-8 h-8 text-cyan" />,
      color: "border-cyan/50",
      bgColor: "bg-cyan/5 hover:bg-cyan/10",
      description: "Potholes on pedestrian pathways"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/statistics")}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Statistics
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Pothole Details</h1>
          <p className="text-muted-foreground">
            Detailed breakdown of potholes by location type
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {categories.map((category, index) => (
            <Card
              key={index}
              className={`border-2 ${category.color} ${category.bgColor} animate-fade-in transition-colors`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  {category.icon}
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4 text-primary">
                  {category.stats.total}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-warning/10 rounded">
                    <span className="text-sm text-muted-foreground">High Severity</span>
                    <span className="text-sm font-semibold text-red-warning">
                      {category.stats.high}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber/10 rounded">
                    <span className="text-sm text-muted-foreground">Medium Severity</span>
                    <span className="text-sm font-semibold text-amber">
                      {category.stats.medium}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm text-muted-foreground">Low Severity</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {category.stats.low}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/map")}
                  >
                    View on Road Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Potholes */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Recent Pothole Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentPotholes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent potholes detected in your jurisdiction</p>
              ) : (
                stats.recentPotholes.map((pothole, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {pothole.road_category === 'footway' || pothole.road_category === 'pedestrian' 
                          ? 'Footway' 
                          : 'Carriageway'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pothole.road_name || pothole.city || 'Unknown location'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold capitalize ${
                        pothole.severity === "high" ? "text-red-warning" :
                        pothole.severity === "medium" ? "text-amber" :
                        "text-muted-foreground"
                      }`}>
                        {pothole.severity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(pothole.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PotholeDetails;
