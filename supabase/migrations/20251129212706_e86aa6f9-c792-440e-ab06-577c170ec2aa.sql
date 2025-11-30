-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create road_damage table for damage detection data
CREATE TABLE public.road_damage (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  damage_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  confidence_score DECIMAL(5, 2),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  road_name TEXT,
  city TEXT,
  metadata JSONB,
  PRIMARY KEY (id)
);

-- Enable RLS on road_damage (public read access for map display)
ALTER TABLE public.road_damage ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read road damage data (for public map display)
CREATE POLICY "Anyone can view road damage data"
  ON public.road_damage FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_road_damage_location ON public.road_damage (latitude, longitude);
CREATE INDEX idx_road_damage_detected_at ON public.road_damage (detected_at DESC);
CREATE INDEX idx_road_damage_type ON public.road_damage (damage_type);

-- Create statistics table for dashboard metrics
CREATE TABLE public.statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15, 2) NOT NULL,
  period TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on statistics
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read statistics
CREATE POLICY "Anyone can view statistics"
  ON public.statistics FOR SELECT
  USING (true);