/*
  # Create Activity Logs Table

  1. New Tables
    - `activity_logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `created_at` (timestamptz) - Timestamp of the activity
      - `ip_address` (text) - IP address of the user
      - `event_type` (text) - Type of event (page_view, button_click, project_view, etc.)
      - `event_label` (text) - Clear description of the action
      - `page_url` (text) - URL where the event occurred
      - `user_agent` (text) - Browser user agent
      - `project_id` (uuid, nullable) - Reference to project if applicable
      - `metadata` (jsonb, nullable) - Additional data about the event
      - `session_id` (text, nullable) - Session identifier for tracking user sessions

  2. Security
    - Enable RLS on `activity_logs` table
    - Only allow inserts from authenticated service role (via edge function)
    - No public read access (admin only)

  3. Indexes
    - Index on created_at for time-based queries
    - Index on event_type for filtering
    - Index on ip_address for user analysis
    - Index on project_id for project analytics
*/

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  ip_address text,
  event_type text NOT NULL,
  event_label text NOT NULL,
  page_url text,
  user_agent text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  metadata jsonb,
  session_id text
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "No public access to activity logs"
  ON activity_logs
  FOR SELECT
  TO public
  USING (false);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_ip_address ON activity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON activity_logs(session_id);