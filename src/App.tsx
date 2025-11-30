import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Product from "./pages/Product";
import Statistics from "./pages/Statistics";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import PotholeDetails from "./pages/PotholeDetails";
import CrackDetails from "./pages/CrackDetails";
import VideoProcessing from "./pages/VideoProcessing";
import DataCleanup from "./pages/DataCleanup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/product" element={<Product />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/potholes" element={<PotholeDetails />} />
          <Route path="/cracks" element={<CrackDetails />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/video-demo" element={<VideoProcessing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/data-cleanup" element={<DataCleanup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
