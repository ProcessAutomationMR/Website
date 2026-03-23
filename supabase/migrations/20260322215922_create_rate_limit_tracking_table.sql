/*
  # Create rate limit tracking table

  1. New Tables
    - `rate_limit_logs`
      - `id` (uuid, primary key)
      - `identifier` (text) - IP, email, or session ID
      - `endpoint` (text) - endpoint being rate limited
      - `request_count` (integer) - number of requests
      - `window_start` (timestamptz) - start of rate limit window
      - `window_end` (timestamptz) - end of rate limit window
      - `blocked` (boolean) - whether request was blocked
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `rate_limit_logs` table
    - Add policy for service role only (no public access)

  3. Indexes
    - Index on identifier and window_end for fast lookups
    - Index on endpoint for analytics

  4. Cleanup function
    - Function to auto-delete old logs (older than 7 days)
*/

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_end timestamptz NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_identifier CHECK (char_length(identifier) > 0 AND char_length(identifier) <= 255),
  CONSTRAINT valid_endpoint CHECK (char_length(endpoint) > 0 AND char_length(endpoint) <= 255),
  CONSTRAINT valid_request_count CHECK (request_count > 0 AND request_count <= 10000),
  CONSTRAINT valid_window CHECK (window_end > window_start)
);

ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limit logs"
  ON rate_limit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_window
  ON rate_limit_logs(identifier, window_end DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_endpoint
  ON rate_limit_logs(endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at
  ON rate_limit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limit_logs
  WHERE created_at < now() - interval '7 days';
END;
$$;

COMMENT ON TABLE rate_limit_logs IS 'Tracks rate limit events for monitoring and security';
COMMENT ON FUNCTION cleanup_old_rate_limit_logs IS 'Deletes rate limit logs older than 7 days';
