/*
  # Add separate customer name fields

  1. Changes
    - Add `customer_first_name` column to `quote_requests` table
    - Add `customer_last_name` column to `quote_requests` table
    - Migrate existing `customer_name` data to split into first and last names
    - Keep `customer_name` for backward compatibility
  
  2. Migration Strategy
    - Split existing customer_name values at the first space
    - First part becomes customer_last_name
    - Second part (if exists) becomes customer_first_name
    - If no space exists, put entire value in customer_last_name
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'customer_first_name'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN customer_first_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'customer_last_name'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN customer_last_name text;
  END IF;
END $$;

UPDATE quote_requests
SET 
  customer_last_name = CASE 
    WHEN position(' ' in customer_name) > 0 THEN 
      split_part(customer_name, ' ', 1)
    ELSE 
      customer_name
  END,
  customer_first_name = CASE 
    WHEN position(' ' in customer_name) > 0 THEN 
      substring(customer_name from position(' ' in customer_name) + 1)
    ELSE 
      ''
  END
WHERE customer_first_name IS NULL OR customer_last_name IS NULL;