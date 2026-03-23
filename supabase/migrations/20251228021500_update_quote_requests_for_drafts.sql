/*
  # Update Quote Requests for Draft Support

  1. Schema Changes
    - Add "draft" status to quote_requests status check
    - Make customer_name, customer_email, and wood_type nullable to support draft quotes
    - Update default status to "draft"
  
  2. Security
    - Add policy for anonymous users to update quote requests
    - This allows the form to auto-save as users type

  3. Notes
    - Draft quotes can be created with partial information
    - When user clicks "Envoyer la demande", status changes to "pending"
*/

-- Drop the existing check constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quote_requests_status_check'
  ) THEN
    ALTER TABLE quote_requests DROP CONSTRAINT quote_requests_status_check;
  END IF;
END $$;

-- Add new check constraint with "draft" status
ALTER TABLE quote_requests 
ADD CONSTRAINT quote_requests_status_check 
CHECK (status IN ('draft', 'pending', 'reviewed', 'quoted', 'completed'));

-- Change default status to "draft"
ALTER TABLE quote_requests 
ALTER COLUMN status SET DEFAULT 'draft';

-- Make fields nullable for draft support
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_requests' 
    AND column_name = 'customer_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE quote_requests ALTER COLUMN customer_name DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_requests' 
    AND column_name = 'customer_email' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE quote_requests ALTER COLUMN customer_email DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_requests' 
    AND column_name = 'wood_type' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE quote_requests ALTER COLUMN wood_type DROP NOT NULL;
  END IF;
END $$;

-- Add policy for anonymous users to update quote requests
CREATE POLICY "Anyone can update quote requests"
  ON quote_requests
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);