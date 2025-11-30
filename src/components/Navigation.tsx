import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X, TrafficCone } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/product", label: "Product" },
    ...(user ? [
      { path: "/statistics", label: "Statistics" },
      { path: "/map", label: "Road Map" },
    ] : []),
  ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan rounded-lg flex items-center justify-center">
              <TrafficCone className="text-primary" size={20} />
            </div>
            Road.V
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-cyan ${
                  isActive(link.path) ? "text-cyan font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="text-primary-foreground hover:text-cyan hover:bg-primary/80"
                >
                  Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="bg-cyan text-primary hover:bg-cyan/90"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                variant="secondary"
                className="bg-cyan text-primary hover:bg-cyan/90"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors hover:text-cyan px-2 py-1 ${
                    isActive(link.path) ? "text-cyan font-semibold" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-primary-foreground hover:text-cyan hover:bg-primary/80"
                  >
                    Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="bg-cyan text-primary hover:bg-cyan/90"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  className="bg-cyan text-primary hover:bg-cyan/90"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;