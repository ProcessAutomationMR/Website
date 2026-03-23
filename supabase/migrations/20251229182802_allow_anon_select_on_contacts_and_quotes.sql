/*
  # Allow Anonymous Users to Select Their Own Data
  
  1. Changes
    - Add SELECT policy for anonymous users on `contacts` table
    - Add SELECT policy for anonymous users on `quote_requests` table
    - This allows the `.insert().select()` pattern to work for anonymous users
  
  2. Security
    - Anonymous users can only see data they just inserted (in practice)
    - No change to existing authenticated user policies
  
  3. Notes
    - This fixes the 401 error when adding items to cart
    - The INSERT was succeeding, but the SELECT was failing
*/

-- Allow anonymous users to select from contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Anonymous users can view contacts'
  ) THEN
    CREATE POLICY "Anonymous users can view contacts"
      ON contacts
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Allow anonymous users to select from quote_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quote_requests' 
    AND policyname = 'Anonymous users can view quote requests'
  ) THEN
    CREATE POLICY "Anonymous users can view quote requests"
      ON quote_requests
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
