import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Filter } from "lucide-react";
import carPotholeIcon from "@/assets/car-pothole-icon.png";
import crackIcon from "@/assets/crack-icon.png";

interface DamagePoint {
  id: string;
  damage_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  road_name: string;
  road_category: string;
  confidence_score: number;
  detected_at: string;
  city: string;
  image_url: string | null;
  metadata?: any;
}

const MapView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [damagePoints, setDamagePoints] = useState<DamagePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightedMarkersRef = useRef<L.CircleMarker[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    severity: {
      high: true,
      medium: true,
      low: true,
    },
    damageType: {
      pothole: true,
      crack: true,
    },
  });

  // Get crack subtype filter from URL
  const crackSubtypeFilter = searchParams.get("crackSubtype");

  // Filter damage points based on selected filters
  const filteredDamagePoints = damagePoints.filter((point) => {
    const severityMatch = filters.severity[point.severity.toLowerCase() as keyof typeof filters.severity];
    const typeMatch = filters.damageType[point.damage_type as keyof typeof filters.damageType];

    // Apply crack subtype filter if present
    if (crackSubtypeFilter && point.damage_type === "crack") {
      const pointSubtype = point.metadata?.subtype?.toLowerCase();
      return severityMatch && typeMatch && pointSubtype === crackSubtypeFilter.toLowerCase();
    }

    return severityMatch && typeMatch;
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        loadDamageData();
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadDamageData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDamageData = async () => {
    try {
      const { data, error } = await supabase.from("road_damage").select("*").order("detected_at", { ascending: false });

      if (error) throw error;
      setDamagePoints(data || []);
    } catch (error) {
      console.error("Error loading damage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const severityLower = severity.toLowerCase();
    switch (severityLower) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || loading) return;

    // Initialize map ONCE
    const map = L.map(mapRef.current).setView([51.1657, 10.4515], 6);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Cleanup only when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  // Separate effect to update markers when filters or data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || loading) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    highlightedMarkersRef.current = [];

    // Check for highlight parameters
    const highlightLat = searchParams.get("lat");
    const highlightLng = searchParams.get("lng");
    const highlightId = searchParams.get("highlight");
    const crackSubtype = searchParams.get("crackSubtype");

    // Add markers for damage points
    filteredDamagePoints.forEach((point) => {
      // Only highlight for specific point navigation (lat/lng or id), NOT for category filters
      const isHighlighted =
        !crackSubtype &&
        (highlightId === point.id ||
          (highlightLat &&
            highlightLng &&
            Math.abs(point.latitude - parseFloat(highlightLat)) < 0.0001 &&
            Math.abs(point.longitude - parseFloat(highlightLng)) < 0.0001));

      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: isHighlighted ? 12 : 8,
        fillColor: getSeverityColor(point.severity),
        color: isHighlighted ? "#fde047" : "#fff",
        weight: isHighlighted ? 4 : 2,
        opacity: 1,
        fillOpacity: isHighlighted ? 1 : 0.8,
        className: "",
      }).addTo(map);

      markersRef.current.push(marker);

      if (isHighlighted) {
        highlightedMarkersRef.current.push(marker);
      }

      const popupContent = `
        <div class="p-2" style="min-width: 200px;">
          ${
            point.image_url
              ? `
            <img src="${point.image_url}" alt="${point.damage_type}" 
                 class="w-full h-40 object-cover rounded mb-3"
                 style="max-width: 300px;" />
          `
              : ""
          }
          <div class="font-semibold text-lg mb-1 capitalize">
            ${point.damage_type}${point.metadata?.subtype ? ` - ${point.metadata.subtype}` : ""}
          </div>
          <div class="text-sm text-gray-600 mb-2">${point.road_name || point.city}</div>
          <div class="mb-2">
            <span class="inline-block px-2 py-1 text-xs rounded uppercase" 
                  style="background-color: ${getSeverityColor(point.severity)}20; 
                         border: 1px solid ${getSeverityColor(point.severity)}; 
                         color: ${getSeverityColor(point.severity)}">
              ${point.severity} Severity
            </span>
          </div>
          <div class="text-xs space-y-1">
            <div>Coordinates: ${point.latitude.toFixed(4)}°N, ${point.longitude.toFixed(4)}°E</div>
            <div>Road Category: ${point.road_category.toUpperCase()}</div>
            <div>Confidence: ${point.confidence_score}%</div>
            <div>Detected: ${new Date(point.detected_at).toLocaleString()}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Auto-open popup and pan ONLY for single point highlight (not for category filters)
      if (isHighlighted && !crackSubtype && (highlightId || (highlightLat && highlightLng))) {
        map.setView([point.latitude, point.longitude], 14, { animate: false });
        marker.openPopup();
      }
    });
  }, [filteredDamagePoints, searchParams]);

  const toggleSeverityFilter = (severity: "high" | "medium" | "low") => {
    setFilters((prev) => ({
      ...prev,
      severity: {
        ...prev.severity,
        [severity]: !prev.severity[severity],
      },
    }));
  };

  const toggleDamageTypeFilter = (type: "pothole" | "crack") => {
    setFilters((prev) => ({
      ...prev,
      damageType: {
        ...prev.damageType,
        [type]: !prev.damageType[type],
      },
    }));
  };

  const resetFilters = () => {
    setFilters({
      severity: { high: true, medium: true, low: true },
      damageType: { pothole: true, crack: true },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">Road Damage Map</h1>
            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
                <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                <div className="px-2 py-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high-severity"
                      checked={filters.severity.high}
                      onCheckedChange={() => toggleSeverityFilter("high")}
                    />
                    <label htmlFor="high-severity" className="text-sm cursor-pointer flex-1">
                      High Severity
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medium-severity"
                      checked={filters.severity.medium}
                      onCheckedChange={() => toggleSeverityFilter("medium")}
                    />
                    <label htmlFor="medium-severity" className="text-sm cursor-pointer flex-1">
                      Medium Severity
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="low-severity"
                      checked={filters.severity.low}
                      onCheckedChange={() => toggleSeverityFilter("low")}
                    />
                    <label htmlFor="low-severity" className="text-sm cursor-pointer flex-1">
                      Low Severity
                    </label>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filter by Damage Type</DropdownMenuLabel>
                <div className="px-2 py-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pothole-type"
                      checked={filters.damageType.pothole}
                      onCheckedChange={() => toggleDamageTypeFilter("pothole")}
                    />
                    <label htmlFor="pothole-type" className="text-sm cursor-pointer flex-1">
                      Potholes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crack-type"
                      checked={filters.damageType.crack}
                      onCheckedChange={() => toggleDamageTypeFilter("crack")}
                    />
                    <label htmlFor="crack-type" className="text-sm cursor-pointer flex-1">
                      Cracks
                    </label>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <div className="px-2 py-2">
                  <Button variant="ghost" size="sm" className="w-full" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground">
            Interactive map showing detected road damage in your jurisdiction area
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className={`lg:col-span-2 transition-all duration-300 ${filterOpen ? "mt-[380px]" : ""}`}>
            <Card className="overflow-hidden shadow-lg animate-fade-in">
              <CardContent className="p-0">
                <div ref={mapRef} className="h-[600px] w-full"></div>
              </CardContent>
            </Card>
          </div>

          {/* Legend & Info */}
          <div className="space-y-6">
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Severity Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-warning"></div>
                    <span>High Severity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-amber"></div>
                    <span>Medium Severity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Low Severity</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3">Damage Type Summary</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={carPotholeIcon} alt="Pothole" className="w-4 h-4" />
                        <span className="text-sm">Potholes</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {filteredDamagePoints.filter((p) => p.damage_type === "pothole").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={crackIcon} alt="Crack" className="w-4 h-4" />
                        <span className="text-sm">Cracks</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {filteredDamagePoints.filter((p) => p.damage_type === "crack").length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Detections</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : filteredDamagePoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No damage matches the current filters</p>
                  ) : (
                    filteredDamagePoints.slice(0, 5).map((point) => (
                      <div key={point.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium capitalize">{point.damage_type}</div>
                            <div className="text-sm text-muted-foreground">{point.road_name || point.city}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {point.road_category.toUpperCase()}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="capitalize"
                            style={{
                              backgroundColor: `${getSeverityColor(point.severity)}20`,
                              borderColor: getSeverityColor(point.severity),
                              color: getSeverityColor(point.severity),
                            }}
                          >
                            {point.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {point.confidence_score}% confidence • {new Date(point.detected_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
