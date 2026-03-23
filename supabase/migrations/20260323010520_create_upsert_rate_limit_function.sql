/*
  # Create upsert_rate_limit RPC function

  ## Purpose
  Provides an atomic upsert for rate limit tracking that survives Edge Function cold starts.
  Called by edge functions as a secondary (persistent) rate limit layer on top of in-memory Maps.

  ## Function
  - `upsert_rate_limit(p_identifier, p_window_start, p_max_requests)`
    - Atomically increments the request count for a given identifier + time window
    - Returns the new count so the caller can decide whether to allow the request
    - Old windows (> 2 hours) are cleaned up on each call (1% probability to reduce overhead)

  ## Security
  - SECURITY DEFINER runs as postgres to bypass RLS for the atomic upsert
  - GRANT EXECUTE restricted to service_role only
*/

CREATE OR REPLACE FUNCTION upsert_rate_limit(
  p_identifier text,
  p_window_start timestamptz,
  p_max_requests integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limit_requests (identifier, window_start, request_count)
  VALUES (p_identifier, p_window_start, 1)
  ON CONFLICT (identifier, window_start)
  DO UPDATE SET
    request_count = rate_limit_requests.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO v_count;

  IF random() < 0.01 THEN
    DELETE FROM rate_limit_requests
    WHERE window_start < now() - interval '2 hours';
  END IF;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION upsert_rate_limit(text, timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_rate_limit(text, timestamptz, integer) TO service_role;
