/*
  # Create project_description_requests table

  1. New Tables
    - `project_description_requests`
      - `id` (uuid, primary key) - Unique identifier for each request
      - `project_id` (uuid, nullable) - Reference to the project being viewed
      - `customer_first_name` (text, nullable) - Customer's first name
      - `customer_last_name` (text, nullable) - Customer's last name
      - `customer_email` (text, nullable) - Customer's email address
      - `customer_phone` (text, nullable) - Customer's phone number
      - `project_description` (text, nullable) - Customer's project description
      - `status` (text, default: 'pending') - Status of the request (pending, reviewed, contacted, completed)
      - `created_at` (timestamptz, default: now()) - When the request was created
      - `updated_at` (timestamptz, default: now()) - When the request was last updated
  
  2. Security
    - Enable RLS on `project_description_requests` table
    - Add policy for anonymous users to insert their own requests
    - Add policy for authenticated users to read all requests (admin access)
*/

CREATE TABLE IF NOT EXISTS project_description_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  customer_phone text,
  project_description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'contacted', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_description_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit project description requests"
  ON project_description_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all project description requests"
  ON project_description_requests
  FOR SELECT
  TO authenticated
  USING (true);