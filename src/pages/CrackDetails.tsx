import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertTriangle, ArrowLeft } from "lucide-react";

interface CrackStats {
  longitudinal: { total: number; high: number; medium: number; low: number };
  transverse: { total: number; high: number; medium: number; low: number };
  block: { total: number; high: number; medium: number; low: number };
  fatigue: { total: number; high: number; medium: number; low: number };
  recentDetections: any[];
}

const CrackDetails = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<CrackStats>({
    longitudinal: { total: 0, high: 0, medium: 0, low: 0 },
    transverse: { total: 0, high: 0, medium: 0, low: 0 },
    block: { total: 0, high: 0, medium: 0, low: 0 },
    fatigue: { total: 0, high: 0, medium: 0, low: 0 },
    recentDetections: []
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
        loadStats();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const { data: crackData, error } = await supabase
        .from('road_damage')
        .select('*')
        .eq('damage_type', 'crack')
        .order('detected_at', { ascending: false });

      if (error) throw error;

      const categorizeBySubtype = (subtype: string) => {
        const filtered = crackData?.filter(d => {
          const meta = d.metadata as any;
          return meta?.subtype?.toLowerCase() === subtype.toLowerCase();
        }) || [];
        return {
          total: filtered.length,
          high: filtered.filter(d => d.severity === 'high').length,
          medium: filtered.filter(d => d.severity === 'medium').length,
          low: filtered.filter(d => d.severity === 'low').length
        };
      };

      setStats({
        longitudinal: categorizeBySubtype('longitudinal'),
        transverse: categorizeBySubtype('transverse'),
        block: categorizeBySubtype('block'),
        fatigue: categorizeBySubtype('fatigue'),
        recentDetections: crackData?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error loading crack stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const crackCategories = [
    {
      title: "Longitudinal Cracks",
      key: "longitudinal",
      description: "Cracks parallel to road centerline",
      icon: <TrendingUp className="w-6 h-6 text-cyan" />,
      color: "border-cyan/50",
      bgColor: "bg-cyan/5 hover:bg-cyan/10"
    },
    {
      title: "Transverse Cracks",
      key: "transverse",
      description: "Cracks perpendicular to road centerline",
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      color: "border-primary/50",
      bgColor: "bg-primary/5 hover:bg-primary/10"
    },
    {
      title: "Block Cracks",
      key: "block",
      description: "Interconnected cracks forming blocks",
      icon: <AlertTriangle className="w-6 h-6 text-amber" />,
      color: "border-amber/50",
      bgColor: "bg-amber/5 hover:bg-amber/10"
    },
    {
      title: "Fatigue Cracks",
      key: "fatigue",
      description: "Alligator or crocodile cracking patterns",
      icon: <AlertTriangle className="w-6 h-6 text-red-warning" />,
      color: "border-red-warning/50",
      bgColor: "bg-red-warning/5 hover:bg-red-warning/10"
    }
  ];

  if (!user || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/statistics")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Statistics
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Crack Details</h1>
          <p className="text-muted-foreground">
            Detailed analysis of cracks by type in your jurisdiction
          </p>
        </div>

        {/* Crack Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {crackCategories.map((category, index) => (
            <Card
              key={index}
              className={`border-2 ${category.color} ${category.bgColor} animate-fade-in transition-colors`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-bold mb-1">
                    {category.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                {category.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {stats[category.key as keyof Omit<CrackStats, 'recentDetections'>].total}
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">
                    Severity Analysis
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-warning/10 rounded">
                    <span className="text-sm">High Severity</span>
                    <span className="text-sm font-bold text-red-warning">
                      {stats[category.key as keyof Omit<CrackStats, 'recentDetections'>].high}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber/10 rounded">
                    <span className="text-sm">Medium Severity</span>
                    <span className="text-sm font-bold text-amber">
                      {stats[category.key as keyof Omit<CrackStats, 'recentDetections'>].medium}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Low Severity</span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {stats[category.key as keyof Omit<CrackStats, 'recentDetections'>].low}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/map?crackSubtype=${category.key}`)}
                  >
                    View on Road Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Crack Detections */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>Recent Crack Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentDetections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent crack detections in your jurisdiction</p>
              ) : (
                stats.recentDetections.map((detection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {(detection.metadata as any)?.subtype || 'Unknown'} Crack
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {detection.road_name || detection.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold capitalize ${
                        detection.severity === "high" ? "text-red-warning" :
                        detection.severity === "medium" ? "text-amber" :
                        "text-muted-foreground"
                      }`}>
                        {detection.severity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(detection.detected_at).toLocaleDateString()}
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

export default CrackDetails;
