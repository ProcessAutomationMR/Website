/*
  # Create Prospect Table for Lead Tracking

  1. New Tables
    - `prospect`
      - `id` (uuid, primary key) - Unique identifier
      - `first_name` (text, optional) - First name of the prospect
      - `last_name` (text, optional) - Last name of the prospect
      - `email` (text, optional) - Email address
      - `phone` (text, optional) - Phone number
      - `category_id` (uuid) - Category reference for tracking
      - `created_at` (timestamptz) - When the lead was captured
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `prospect` table
    - Allow anonymous users to create and update prospects (for lead capture)
    - Allow authenticated users to view all prospects

  3. Notes
    - This table captures partial form data as leads
    - Used before a full quote request is submitted
    - Helps track users who start but don't complete the quote process
*/

CREATE TABLE IF NOT EXISTS prospect (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  category_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prospect ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create prospects"
  ON prospect
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update prospects"
  ON prospect
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view prospects"
  ON prospect
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_prospect_category_id ON prospect(category_id);
CREATE INDEX IF NOT EXISTS idx_prospect_email ON prospect(email);
CREATE INDEX IF NOT EXISTS idx_prospect_created_at ON prospect(created_at DESC);