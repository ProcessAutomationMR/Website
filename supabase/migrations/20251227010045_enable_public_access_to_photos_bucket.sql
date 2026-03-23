/*
  # Enable Public Access to Photos Bucket

  1. Changes
    - Create RLS policy to allow public SELECT access to objects in the Photos bucket
    - This enables the homepage images to be displayed publicly without authentication
  
  2. Security
    - Only SELECT (read) operations are allowed
    - Policy applies to all users (public access)
    - Restricted to the Photos bucket only
*/

CREATE POLICY "Public read access for Photos bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'Photos');