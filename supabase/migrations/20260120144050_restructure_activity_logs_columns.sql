/*
  # Restructure Activity Logs Table

  1. Changes
    - Add `page_name` column - stores only the page name (e.g., "Homepage", "Contact Page")
    - Add `element_name` column - stores button label or project name (e.g., "Contactez-nous", "Project Title")
    - Add `action_type` column - stores the type of action (e.g., "page_view", "button_click", "project_view")
    - Keep existing columns for backward compatibility but will deprecate them

  2. Indexes
    - Add indexes on new columns for efficient querying

  3. Notes
    - The new structure provides cleaner data for analysis
    - Separates concerns: page context, element interacted with, and action performed
*/

ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS page_name text,
ADD COLUMN IF NOT EXISTS element_name text,
ADD COLUMN IF NOT EXISTS action_type text;

CREATE INDEX IF NOT EXISTS idx_activity_logs_page_name ON activity_logs(page_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_element_name ON activity_logs(element_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);