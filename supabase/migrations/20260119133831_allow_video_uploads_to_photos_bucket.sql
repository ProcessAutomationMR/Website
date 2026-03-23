/*
  # Allow Video Uploads to Photos Bucket

  1. Changes
    - Update the Photos bucket configuration to allow video file uploads
    - Add video MIME types: video/mp4, video/webm, video/quicktime, video/x-msvideo
    - Keep existing image MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
  
  2. Security
    - Public read access remains unchanged (read-only for public)
    - Video uploads will require proper authentication policies (to be added if needed)
  
  3. Notes
    - This allows uploading videos for homepage and project showcases
    - Supported video formats: MP4, WebM, MOV, AVI
*/

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
]
WHERE id = 'Photos';
