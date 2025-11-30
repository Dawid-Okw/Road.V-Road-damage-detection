import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authorityType, setAuthorityType] = useState<string>("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Organization options based on authority type
  const organizationOptions: Record<string, string[]> = {
    federal: ["Nord", "Nordost", "West", "Südwest", "Süd"],
    state: [
      "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
      "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
      "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
      "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
    ],
    district: [
      "Aachen", "Altenkirchen", "Bad Kreuznach", "Berchtesgadener Land",
      "Börde", "Darmstadt-Dieburg", "Enzkreis", "Esslingen", "Friesland",
      "Göttingen", "Harburg", "Hersfeld-Rotenburg", "Main-Kinzig-Kreis"
    ],
    municipal: [
      "Berlin", "Hamburg", "München", "Köln", "Frankfurt am Main",
      "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen",
      "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg"
    ]
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/statistics");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/statistics");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && (!authorityType || !organization)) {
      toast({
        title: "Missing information",
        description: "Please select authority type and organization",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (authError) throw authError;

        // Update profile with jurisdiction info
        if (authData.user) {
          const profileUpdate: any = {
            authority_type: authorityType,
            organization: organization,
          };

          // Set specific jurisdiction field based on authority type
          if (authorityType === 'state') {
            profileUpdate.state = organization;
          } else if (authorityType === 'district') {
            profileUpdate.district = organization;
          } else if (authorityType === 'municipal') {
            profileUpdate.municipality = organization;
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', authData.user.id);

          if (profileError) throw profileError;

          // Add role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: authorityType as 'federal' | 'state' | 'district' | 'municipal'
            });

          if (roleError) throw roleError;
        }

        toast({
          title: "Account created!",
          description: "Welcome to RoadGuard AI.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Enter your information to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorityType">Authority Type</Label>
                    <Select value={authorityType} onValueChange={setAuthorityType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authority type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="federal">Federal Government (Autobahn GmbH)</SelectItem>
                        <SelectItem value="state">State Government (Bundesstraßen, Landesstraßen)</SelectItem>
                        <SelectItem value="district">District / Kreis Authority</SelectItem>
                        <SelectItem value="municipal">Municipal Government (Stadt / Gemeinde)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {authorityType && (
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Select value={organization} onValueChange={setOrganization} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50 max-h-[200px]">
                          {organizationOptions[authorityType]?.map((org) => (
                            <SelectItem key={org} value={org}>
                              {org}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;