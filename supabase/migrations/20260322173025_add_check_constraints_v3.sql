/*
  # Ajouter des contraintes de validation - CORRECTION HAUTE PRIORITÉ

  ## Problème
  Aucune validation côté base de données:
  - Champs texte illimités → risque de saturation du stockage
  - Données malformées (NaN, Infinity) possibles
  - Pas de validation de format email

  ## Actions correctives
  1. Limiter la taille de tous les champs texte
  2. Valider le format des emails (sans bloquer les données existantes)

  ## Impact
  - Protection contre l'insertion de données invalides
  - Prévention de l'épuisement des ressources
  - Meilleure intégrité des données
*/

-- Contraintes sur la table contacts (sans validation d'email stricte)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_first_name_length') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_first_name_length
      CHECK (first_name IS NULL OR char_length(first_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_last_name_length') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_last_name_length
      CHECK (last_name IS NULL OR char_length(last_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_email_length') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_email_length
      CHECK (email IS NULL OR char_length(email) <= 255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_phone_length') THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_phone_length
      CHECK (phone IS NULL OR char_length(phone) <= 20);
  END IF;
END $$;

-- Contraintes sur la table quote_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_notes_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_notes_length
      CHECK (additional_notes IS NULL OR char_length(additional_notes) <= 2000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_wood_type_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_wood_type_length
      CHECK (wood_type IS NULL OR char_length(wood_type) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_finish_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_finish_length
      CHECK (finish IS NULL OR char_length(finish) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_customer_first_name_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_customer_first_name_length
      CHECK (customer_first_name IS NULL OR char_length(customer_first_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_customer_last_name_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_customer_last_name_length
      CHECK (customer_last_name IS NULL OR char_length(customer_last_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_customer_email_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_customer_email_length
      CHECK (customer_email IS NULL OR char_length(customer_email) <= 255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_customer_phone_length') THEN
    ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_customer_phone_length
      CHECK (customer_phone IS NULL OR char_length(customer_phone) <= 20);
  END IF;
END $$;

-- Contraintes sur la table project_description_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_desc_first_name_length') THEN
    ALTER TABLE project_description_requests ADD CONSTRAINT project_desc_first_name_length
      CHECK (customer_first_name IS NULL OR char_length(customer_first_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_desc_last_name_length') THEN
    ALTER TABLE project_description_requests ADD CONSTRAINT project_desc_last_name_length
      CHECK (customer_last_name IS NULL OR char_length(customer_last_name) <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_desc_email_length') THEN
    ALTER TABLE project_description_requests ADD CONSTRAINT project_desc_email_length
      CHECK (customer_email IS NULL OR char_length(customer_email) <= 255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_desc_phone_length') THEN
    ALTER TABLE project_description_requests ADD CONSTRAINT project_desc_phone_length
      CHECK (customer_phone IS NULL OR char_length(customer_phone) <= 20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_desc_description_length') THEN
    ALTER TABLE project_description_requests ADD CONSTRAINT project_desc_description_length
      CHECK (project_description IS NULL OR char_length(project_description) <= 2000);
  END IF;
END $$;