import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react";

const DataCleanup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runCleanup = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      toast.info("Starting data cleanup...");
      
      const { data, error } = await supabase.functions.invoke('cleanup-road-damage', {
        body: {},
      });

      if (error) throw error;

      setResults(data);
      
      if (data.success) {
        toast.success(`Cleanup completed! ${data.results.corrected} corrected, ${data.results.added} added, ${data.results.fixed} fixed`);
      } else {
        toast.error("Cleanup completed with errors");
      }
    } catch (error: any) {
      console.error('Error running cleanup:', error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Database Cleanup
          </h1>
          <p className="text-muted-foreground">
            Fix and standardize road damage data using Nominatim locations
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Cleanup Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>This tool will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Correct existing entries to match Nominatim location data</li>
                  <li>Fix road categories (Autobahn vs Municipal)</li>
                  <li>Update state, district, and municipality information</li>
                  <li>Add autobahn regions where applicable</li>
                  <li>Insert new verified entries</li>
                  <li>Fix specific problematic coordinates</li>
                </ul>
              </div>

              <Button
                onClick={runCleanup}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning Up Data...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Run Data Cleanup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Cleanup Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-500">
                      {results.results.corrected}
                    </div>
                    <div className="text-sm text-muted-foreground">Entries Corrected</div>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-500">
                      {results.results.added}
                    </div>
                    <div className="text-sm text-muted-foreground">Entries Added</div>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-500">
                      {results.results.fixed}
                    </div>
                    <div className="text-sm text-muted-foreground">Entries Fixed</div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {results.totalEntries}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Entries</div>
                  </div>
                </div>

                {results.results.errors.length > 0 && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="font-semibold text-red-500 mb-2">Errors:</div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {results.results.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate("/map")}
                    variant="outline"
                    className="flex-1"
                  >
                    View on Map
                  </Button>
                  <Button
                    onClick={() => navigate("/statistics")}
                    variant="outline"
                    className="flex-1"
                  >
                    View Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCleanup;
