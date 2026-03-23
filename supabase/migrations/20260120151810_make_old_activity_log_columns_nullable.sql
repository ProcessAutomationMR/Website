/*
  # Fix Activity Logs Table - Make Old Columns Nullable

  1. Changes
    - Make `event_type` column nullable (transitioning to `action_type`)
    - Make `event_label` column nullable (transitioning to `page_name` and `element_name`)
  
  2. Reason
    - The edge function uses the new column structure (action_type, page_name, element_name)
    - The old columns (event_type, event_label) were NOT NULL, causing inserts to fail
    - This migration allows the new structure to work while maintaining backward compatibility
  
  3. Notes
    - The new columns (action_type, page_name, element_name) are now the primary columns
    - The old columns can be populated for backward compatibility if needed
*/

ALTER TABLE activity_logs 
ALTER COLUMN event_type DROP NOT NULL,
ALTER COLUMN event_label DROP NOT NULL;
