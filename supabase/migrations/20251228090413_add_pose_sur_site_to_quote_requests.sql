/*
  # Add pose_sur_site column to quote_requests
  
  1. Changes
    - Add `pose_sur_site` (boolean) column to `quote_requests` table
    - Default value is false
    - Indicates if customer wants installation on site
  
  2. Notes
    - This allows customers to specify if they want the product installed on their site
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'pose_sur_site'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN pose_sur_site boolean DEFAULT false;
  END IF;
END $$;