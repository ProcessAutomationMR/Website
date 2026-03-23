/*
  # Add database-level check constraints (length only, skips email format due to existing test data)

  ## Purpose
  Enforce data integrity at the database layer as a second line of defense.

  ## Changes
  - contacts: first_name, last_name, phone length constraints
  - quote_requests: additional_notes length, status enum
  - Email format constraint is NOT added here due to existing test rows with
    single-char email values (e.g. "r"). Clean up test data first, then add
    the email format constraint manually.

  ## Notes
  - All constraints use IF NOT EXISTS pattern for idempotency
  - Non-destructive: existing valid data is unaffected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contacts_first_name_length'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_first_name_length
      CHECK (char_length(first_name) BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contacts_last_name_length'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_last_name_length
      CHECK (char_length(last_name) BETWEEN 1 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contacts_phone_length'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_phone_length
      CHECK (phone IS NULL OR char_length(phone) <= 30);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_notes_length'
  ) THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_notes_length
      CHECK (additional_notes IS NULL OR char_length(additional_notes) <= 5000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_status_values'
  ) THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_status_values
      CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'draft'));
  END IF;
END $$;
