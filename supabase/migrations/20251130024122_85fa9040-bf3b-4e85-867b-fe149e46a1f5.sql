-- Create admin role in the existing app_role enum (already has federal, state, district, municipal)
-- We'll add admin access through the user_roles table instead

-- Update the RLS policy on road_damage to allow admins to see everything
DROP POLICY IF EXISTS "Users can view road damage in their jurisdiction" ON road_damage;

CREATE POLICY "Users can view road damage in their jurisdiction" 
ON road_damage 
FOR SELECT 
USING (
  -- Check if user is admin via user_roles table
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'federal'
  )
  OR
  -- Otherwise check normal jurisdiction
  user_has_jurisdiction_access(
    auth.uid(), 
    road_category, 
    state, 
    district, 
    municipality, 
    autobahn_region
  )
);

-- Insert admin role for current user
INSERT INTO user_roles (user_id, role)
VALUES ('6993f5b8-1864-4ad5-89a9-0dd0e7a73107', 'federal')
ON CONFLICT (user_id, role) DO NOTHING;