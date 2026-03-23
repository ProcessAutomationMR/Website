/*
  # Restreindre les politiques RLS - CORRECTION CRITIQUE

  ## Problème de sécurité
  Les politiques actuelles permettent aux utilisateurs anonymes de:
  - Lire toutes les demandes de devis (emails, téléphones, noms)
  - Modifier les contacts et demandes de devis
  - Accéder aux données personnelles de tous les prospects

  ## Actions correctives
  1. Supprimer toutes les politiques SELECT/UPDATE pour les utilisateurs anonymes
  2. Permettre uniquement INSERT pour les soumissions de formulaires
  3. Réserver l'accès en lecture aux utilisateurs authentifiés (admins)

  ## Impact
  - Les utilisateurs anonymes peuvent toujours soumettre des demandes (INSERT)
  - Seuls les admins authentifiés peuvent consulter les demandes
  - Protection des données personnelles conforme au RGPD
*/

-- Supprimer les politiques dangereuses permettant la lecture anonyme
DROP POLICY IF EXISTS "Anonymous users can view quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Anonymous users can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can update contacts" ON contacts;

-- Supprimer les anciennes politiques authenticated si elles existent
DROP POLICY IF EXISTS "Authenticated users can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can delete quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;
DROP POLICY IF EXISTS "Anonymous users can insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can insert contacts" ON contacts;

-- Permettre l'insertion anonyme (soumission de formulaires)
CREATE POLICY "Anon can insert quote requests" ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can insert contacts" ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Accès complet pour les utilisateurs authentifiés (admins)
CREATE POLICY "Auth can view all quote requests" ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth can update quote requests" ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth can delete quote requests" ON quote_requests
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Auth can view all contacts" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth can update contacts" ON contacts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth can delete contacts" ON contacts
  FOR DELETE
  TO authenticated
  USING (true);