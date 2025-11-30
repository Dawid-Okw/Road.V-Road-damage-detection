-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Drop existing RLS policy on road_damage
DROP POLICY IF EXISTS "Users can view road damage in their jurisdiction" ON public.road_damage;

-- Create new SELECT policy that allows admins to see everything
CREATE POLICY "Users can view road damage in their jurisdiction or admins see all"
ON public.road_damage
FOR SELECT
USING (
  public.is_admin(auth.uid()) 
  OR (EXISTS ( SELECT 1
     FROM user_roles
    WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'federal'::app_role))))
  OR user_has_jurisdiction_access(auth.uid(), road_category, state, district, municipality, autobahn_region)
);

-- Create INSERT policy for admins
CREATE POLICY "Admins can insert damage reports"
ON public.road_damage
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Create UPDATE policy for admins
CREATE POLICY "Admins can update damage reports"
ON public.road_damage
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create DELETE policy for admins
CREATE POLICY "Admins can delete damage reports"
ON public.road_damage
FOR DELETE
USING (public.is_admin(auth.uid()));