-- Create enum for authority types
CREATE TYPE public.app_role AS ENUM ('federal', 'state', 'district', 'municipal');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add jurisdiction fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN authority_type public.app_role,
ADD COLUMN organization TEXT,
ADD COLUMN state TEXT,
ADD COLUMN district TEXT,
ADD COLUMN municipality TEXT;

-- Add road category and jurisdiction to road_damage
ALTER TABLE public.road_damage
ADD COLUMN road_category TEXT NOT NULL DEFAULT 'municipal',
ADD COLUMN state TEXT,
ADD COLUMN district TEXT,
ADD COLUMN municipality TEXT,
ADD COLUMN autobahn_region TEXT;

-- Create security definer function to check jurisdiction access
CREATE OR REPLACE FUNCTION public.user_has_jurisdiction_access(
  _user_id UUID,
  _road_category TEXT,
  _state TEXT,
  _district TEXT,
  _municipality TEXT,
  _autobahn_region TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_authority_type public.app_role;
  user_state TEXT;
  user_district TEXT;
  user_municipality TEXT;
  user_organization TEXT;
BEGIN
  -- Get user's jurisdiction info
  SELECT authority_type, state, district, municipality, organization
  INTO user_authority_type, user_state, user_district, user_municipality, user_organization
  FROM public.profiles
  WHERE id = _user_id;

  -- If no authority type set, deny access
  IF user_authority_type IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Federal (Autobahn GmbH) - can only see motorways in their region
  IF user_authority_type = 'federal' THEN
    RETURN _road_category = 'autobahn' AND _autobahn_region = user_organization;
  END IF;

  -- State Government - can see Bundesstraßen and Landesstraßen in their state
  IF user_authority_type = 'state' THEN
    RETURN (_road_category = 'bundesstrasse' OR _road_category = 'landesstrasse') 
           AND _state = user_state;
  END IF;

  -- District - can see Kreisstraßen in their district
  IF user_authority_type = 'district' THEN
    RETURN _road_category = 'kreisstrasse' AND _district = user_district;
  END IF;

  -- Municipal - can see municipal roads in their municipality
  IF user_authority_type = 'municipal' THEN
    RETURN _road_category = 'municipal' AND _municipality = user_municipality;
  END IF;

  RETURN FALSE;
END;
$$;

-- Update RLS policy for road_damage to filter by jurisdiction
DROP POLICY IF EXISTS "Anyone can view road damage data" ON public.road_damage;

CREATE POLICY "Users can view road damage in their jurisdiction"
ON public.road_damage
FOR SELECT
TO authenticated
USING (
  public.user_has_jurisdiction_access(
    auth.uid(),
    road_category,
    state,
    district,
    municipality,
    autobahn_region
  )
);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);