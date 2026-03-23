/*
  # Create Projects Portfolio Table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text) - Project name
      - `description` (text) - Project description
      - `category` (text) - Main category: 'Menuiserie', 'Agencement', or 'Agencement de magasins'
      - `location` (text, optional) - Project location
      - `year` (integer, optional) - Year completed
      - `image_url` (text) - Storage path to main image
      - `materials` (text[], array) - Materials used
      - `style` (text) - Design style (modern, classic, contemporary, etc.)
      - `room_type` (text) - Room type for filtering (kitchen, bathroom, bedroom, office, store, etc.)
      - `featured` (boolean) - Whether to feature on homepage
      - `created_at` (timestamptz) - Creation timestamp
      
  2. Security
    - Enable RLS on `projects` table
    - Add policy for public read access (portfolio is public)
    - Add policy for authenticated admin users to manage projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Menuiserie', 'Agencement', 'Agencement de magasins')),
  location text,
  year integer,
  image_url text NOT NULL,
  materials text[] DEFAULT '{}',
  style text,
  room_type text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_style ON projects(style);
CREATE INDEX IF NOT EXISTS idx_projects_room_type ON projects(room_type);