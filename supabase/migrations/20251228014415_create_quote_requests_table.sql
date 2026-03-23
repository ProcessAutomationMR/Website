/*
  # Create Quote Requests Table

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key) - Reference to the project
      - `customer_email` (text) - Customer email address
      - `customer_name` (text) - Customer name
      - `customer_phone` (text, optional) - Customer phone number
      - `dimensions` (jsonb) - Dimensions specified (width, height, depth, etc.)
      - `wood_type` (text) - Type of wood selected
      - `finish` (text, optional) - Finish preference (varnish, paint, oil, etc.)
      - `additional_notes` (text, optional) - Any additional requirements
      - `status` (text) - Status of the quote (pending, reviewed, quoted, completed)
      - `created_at` (timestamptz) - Creation timestamp
      
  2. Security
    - Enable RLS on `quote_requests` table
    - Add policy for anyone to create quote requests
    - Add policy for authenticated users to read all requests
    - Add policy for authenticated users to update request status
*/

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  dimensions jsonb DEFAULT '{}',
  wood_type text NOT NULL,
  finish text,
  additional_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update quote requests"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quote_requests_project_id ON quote_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
