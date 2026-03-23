/*
  # Rename prospect table to contacts
  
  1. Changes
    - Rename `prospect` table to `contacts`
    - Update all indexes to reference the new table name
    - RLS policies and permissions remain unchanged
  
  2. Notes
    - This is a simple rename operation
    - All data and relationships are preserved
    - All existing policies and indexes are maintained
*/

ALTER TABLE IF EXISTS prospect RENAME TO contacts;

ALTER INDEX IF EXISTS idx_prospect_category_id RENAME TO idx_contacts_category_id;
ALTER INDEX IF EXISTS idx_prospect_email RENAME TO idx_contacts_email;
ALTER INDEX IF EXISTS idx_prospect_created_at RENAME TO idx_contacts_created_at;