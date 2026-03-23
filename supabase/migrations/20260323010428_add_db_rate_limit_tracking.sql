/*
  # Add DB-backed rate limit tracking

  ## Purpose
  Provides persistent rate limit counters that survive Edge Function cold starts.
  In-memory Maps reset on every instance recycle; this table gives a durable fallback
  that prevents rate-limit bypass via deployment timing.

  ## New Table
  - `rate_limit_requests`
    - `id` (uuid, pk)
    - `identifier` (text) — hashed IP + endpoint key
    - `window_start` (timestamptz) — start of the current time window
    - `request_count` (int) — number of requests in this window
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled; no public access — only the service role (used by edge functions) can read/write.
  - Rows older than 2 hours are cleaned up by a scheduled function or on insert.

  ## Notes
  - Edge functions use this table as a secondary check after the in-memory cache.
  - The unique constraint on (identifier, window_start) allows efficient upserts.
*/

CREATE TABLE IF NOT EXISTS rate_limit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rate_limit_requests_identifier_window_idx
  ON rate_limit_requests (identifier, window_start);

CREATE INDEX IF NOT EXISTS rate_limit_requests_window_start_idx
  ON rate_limit_requests (window_start);

ALTER TABLE rate_limit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only — select"
  ON rate_limit_requests FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role only — insert"
  ON rate_limit_requests FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role only — update"
  ON rate_limit_requests FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role only — delete"
  ON rate_limit_requests FOR DELETE
  TO service_role
  USING (true);
