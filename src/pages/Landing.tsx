import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Eye, MapPin, TrendingUp, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Eye className="w-8 h-8 text-cyan" />,
      title: "Computer Vision",
      description: "Advanced AI algorithms detect road damage with high precision",
    },
    {
      icon: <MapPin className="w-8 h-8 text-cyan" />,
      title: "Drone-Based Scanning",
      description: "High-resolution imagery captured from optimal vantage points",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-cyan" />,
      title: "Real-Time Analytics",
      description: "Instant insights and comprehensive statistical analysis",
    },
    {
      icon: <Zap className="w-8 h-8 text-cyan" />,
      title: "Fast Processing",
      description: "Rapid detection and classification of road infrastructure issues",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-navy-dark text-primary-foreground">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight" 
                style={{ 
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(9, 100, 90, 0.2)' 
                }}>
              Next-Generation<br />
              <span className="text-cyan-bright bg-gradient-to-r from-cyan via-cyan-bright to-cyan-light bg-clip-text text-transparent">
                Road Damage Detection
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Leveraging cutting-edge computer vision and machine learning to identify
              and analyze road infrastructure issues through drone-based high-resolution imagery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-cyan text-primary hover:bg-cyan/90 font-semibold"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                className="bg-cyan/20 text-primary-foreground hover:bg-cyan/30 border-2 border-cyan font-semibold"
                onClick={() => {
                  navigate("/product");
                  setTimeout(() => {
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligent Infrastructure Monitoring
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines state-of-the-art technology with actionable insights
            to revolutionize road maintenance and safety.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-cyan transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.2%</div>
              <div className="text-muted-foreground">Detection Accuracy</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500k+</div>
              <div className="text-muted-foreground">Kilometers Scanned</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Real-Time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="bg-cyan text-primary border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Road Maintenance?
            </h2>
            <p className="text-lg mb-8 text-primary/90 max-w-2xl mx-auto">
              Join us in building safer, more efficient infrastructure through
              intelligent damage detection and analysis.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={() => navigate("/auth")}
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 Road.V. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;