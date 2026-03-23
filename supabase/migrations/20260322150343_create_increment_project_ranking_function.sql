/*
  # Create increment_project_ranking function

  1. New Functions
    - `increment_project_ranking(project_id uuid)`
      - Increments the ranking column by 1 for a specific project
      - Uses atomic operation to ensure data integrity
      - Returns void

  2. Purpose
    - Track project popularity by incrementing ranking when users click on projects
    - Enables sorting projects by popularity (highest ranking first)

  3. Security
    - Function is marked as SECURITY DEFINER to allow anonymous users to increment
    - Only performs increment operation, no data exposure risk
*/

CREATE OR REPLACE FUNCTION increment_project_ranking(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET ranking = COALESCE(ranking, 0) + 1
  WHERE id = project_id;
END;
$$;