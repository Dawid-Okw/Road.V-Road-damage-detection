-- Create storage bucket for damage images
INSERT INTO storage.buckets (id, name, public)
VALUES ('damage-images', 'damage-images', true);

-- Add image_url column to road_damage table
ALTER TABLE road_damage 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create RLS policies for damage-images bucket
CREATE POLICY "Damage images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'damage-images');

CREATE POLICY "Authenticated users can upload damage images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'damage-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their damage images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'damage-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete damage images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'damage-images' 
  AND auth.role() = 'authenticated'
);