import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, AlertTriangle, MapPin, Activity, ChevronDown, ChevronUp, Construction, Slash } from "lucide-react";
import potholeIcon from "@/assets/pothole-icon.png";
import crackIcon from "@/assets/crack-icon.png";
import warningIcon from "@/assets/warning-icon.png";
import roadDamageIcon from "@/assets/road-damage-icon.png";
import carPotholeIcon from "@/assets/car-pothole-icon.png";

interface RoadDamageStats {
  totalPotholes: number;
  totalCracks: number;
  highSeverity: number;
  mediumSeverity: number;
  recentDetections: any[];
  potholesBySeverity: { high: number; medium: number; low: number };
  cracksBySeverity: { high: number; medium: number; low: number };
}

const Statistics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<RoadDamageStats>({
    totalPotholes: 0,
    totalCracks: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    recentDetections: [],
    potholesBySeverity: { high: 0, medium: 0, low: 0 },
    cracksBySeverity: { high: 0, medium: 0, low: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({
    potholes: false,
    cracks: false
  });

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
      // Fetch all damage data (RLS will filter by jurisdiction)
      const { data: damageData, error } = await supabase
        .from('road_damage')
        .select('*')
        .order('detected_at', { ascending: false });

      if (error) throw error;

      const potholes = damageData?.filter(d => d.damage_type === 'pothole').length || 0;
      const cracks = damageData?.filter(d => d.damage_type === 'crack').length || 0;
      const high = damageData?.filter(d => d.severity === 'high').length || 0;
      const medium = damageData?.filter(d => d.severity === 'medium').length || 0;

      // Calculate severity breakdown for potholes
      const potholeData = damageData?.filter(d => d.damage_type === 'pothole') || [];
      const potholesBySeverity = {
        high: potholeData.filter(d => d.severity === 'high').length,
        medium: potholeData.filter(d => d.severity === 'medium').length,
        low: potholeData.filter(d => d.severity === 'low').length
      };

      // Calculate severity breakdown for cracks
      const crackData = damageData?.filter(d => d.damage_type === 'crack') || [];
      const cracksBySeverity = {
        high: crackData.filter(d => d.severity === 'high').length,
        medium: crackData.filter(d => d.severity === 'medium').length,
        low: crackData.filter(d => d.severity === 'low').length
      };

      setStats({
        totalPotholes: potholes,
        totalCracks: cracks,
        highSeverity: high,
        mediumSeverity: medium,
        recentDetections: damageData?.slice(0, 4) || [],
        potholesBySeverity,
        cracksBySeverity
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardKey: string) => {
    if (cardKey === 'potholes') {
      navigate('/potholes');
    } else if (cardKey === 'cracks') {
      navigate('/cracks');
    } else {
      setExpandedCards(prev => ({
        ...prev,
        [cardKey]: !prev[cardKey]
      }));
    }
  };

  const statCards = [
    {
      title: "Total Potholes",
      value: stats.totalPotholes.toString(),
      icon: <img src={carPotholeIcon} alt="Pothole" className="w-6 h-6" />,
      color: "border-muted-foreground/50",
      shadow: "0 8px 24px hsla(0, 0%, 45%, 0.25)",
      expandable: true,
      key: "potholes",
      subcategories: [
        { label: "High Severity", value: stats.potholesBySeverity.high, color: "text-red-warning" },
        { label: "Medium Severity", value: stats.potholesBySeverity.medium, color: "text-amber" },
        { label: "Low Severity", value: stats.potholesBySeverity.low, color: "text-muted-foreground" }
      ]
    },
    {
      title: "Total Cracks",
      value: stats.totalCracks.toString(),
      icon: <img src={crackIcon} alt="Crack" className="w-6 h-6" />,
      color: "border-muted-foreground/50",
      shadow: "0 8px 24px hsla(0, 0%, 45%, 0.25)",
      expandable: true,
      key: "cracks",
      subcategories: [
        { label: "High Severity", value: stats.cracksBySeverity.high, color: "text-red-warning" },
        { label: "Medium Severity", value: stats.cracksBySeverity.medium, color: "text-amber" },
        { label: "Low Severity", value: stats.cracksBySeverity.low, color: "text-muted-foreground" }
      ]
    },
    {
      title: "High Severity",
      value: stats.highSeverity.toString(),
      icon: <AlertTriangle className="w-6 h-6 text-red-warning" />,
      color: "border-red-warning/50",
      shadow: "0 8px 24px hsla(0, 84%, 60%, 0.25)",
      expandable: false
    },
    {
      title: "Medium Severity",
      value: stats.mediumSeverity.toString(),
      icon: <AlertTriangle className="w-6 h-6 text-amber" />,
      color: "border-amber/50",
      shadow: "0 8px 24px hsla(38, 92%, 50%, 0.25)",
      expandable: false
    },
  ];

  if (!user || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights from road damage detection system
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className={`group relative border-2 ${stat.color} bg-gradient-to-br from-card via-card to-card/80 
                hover:-translate-y-1 hover:border-opacity-80
                transition-all duration-300 animate-fade-in backdrop-blur-sm
                ${stat.expandable ? 'cursor-pointer' : ''}
                before:absolute before:inset-0 before:rounded-lg before:bg-gradient-subtle before:opacity-0 
                hover:before:opacity-100 before:transition-opacity before:-z-10`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                boxShadow: stat.shadow
              }}
              onClick={() => stat.expandable && stat.key && toggleCard(stat.key)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                    {stat.icon}
                  </div>
                  {stat.expandable && stat.key && (
                    expandedCards[stat.key] ? 
                      <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : 
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground/80">In your jurisdiction</p>
                
                {stat.expandable && stat.key && expandedCards[stat.key] && stat.subcategories && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
                    {stat.subcategories.map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                        <span className="text-sm text-muted-foreground">{sub.label}</span>
                        <span className={`text-sm font-bold ${sub.color}`}>{sub.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="animate-fade-in border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/80 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                Damage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium">Total Detections</span>
                  <span className="font-bold text-xl bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">{stats.totalPotholes + stats.totalCracks}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium">Potholes</span>
                  <span className="font-bold text-xl">{stats.totalPotholes}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground font-medium">Cracks</span>
                  <span className="font-bold text-xl">{stats.totalCracks}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-red-warning/10 border border-red-warning/20 hover:bg-red-warning/15 transition-colors">
                  <span className="text-muted-foreground font-medium">High Priority</span>
                  <span className="font-bold text-xl text-red-warning">{stats.highSeverity}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/80 hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan/10 to-cyan/5">
                  <TrendingUp className="w-5 h-5 text-cyan" />
                </div>
                Detection Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Accuracy Rate</span>
                    <span className="text-sm font-bold text-cyan">99.2%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan to-cyan/80 h-2.5 rounded-full shadow-glow transition-all duration-500" style={{ width: "99.2%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Processing Speed</span>
                    <span className="text-sm font-bold text-primary">94.8%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full shadow-glow transition-all duration-500" style={{ width: "94.8%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground/70">System Uptime</span>
                    <span className="text-sm font-bold text-foreground/70">99.9%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-foreground/60 to-foreground/50 h-2.5 rounded-full shadow-glow transition-all duration-500" style={{ width: "99.9%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="animate-fade-in border-2 border-border/50 bg-gradient-to-br from-card via-card to-card/80 hover:shadow-soft-md transition-all duration-300" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              Recent Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentDetections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent detections in your jurisdiction</p>
              ) : (
                stats.recentDetections.map((detection, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 hover:shadow-soft-sm hover:-translate-y-0.5 transition-all duration-200 border border-border/30"
                  >
                    <div className="flex-1">
                      <div className="font-semibold capitalize text-foreground group-hover:text-primary transition-colors">{detection.damage_type}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {detection.road_name || detection.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold capitalize px-3 py-1 rounded-full ${
                        detection.severity === "high" ? "bg-red-warning/20 text-red-warning" :
                        detection.severity === "medium" ? "bg-amber/20 text-amber" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {detection.severity}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
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

export default Statistics;