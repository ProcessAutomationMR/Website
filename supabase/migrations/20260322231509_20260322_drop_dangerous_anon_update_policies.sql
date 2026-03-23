/*
  # Suppression des politiques RLS dangereuses pour les anonymes

  ## Probleme
  Deux politiques UPDATE permettent a des utilisateurs anonymes de modifier des
  enregistrements sensibles :
  - "Anyone can update prospects" sur la table contacts (roles: anon + authenticated, USING (true))
  - "Anyone can update quote requests" sur la table quote_requests (roles: anon, USING (true))

  Ces politiques sont des residus de migrations anterieures qui n'ont pas ete
  correctement supprimees lors du durcissement RLS du 22 mars 2026 (mauvais noms).

  ## Impact si non corrige
  N'importe quel visiteur anonyme peut modifier/ecraser les coordonnees de clients
  (noms, emails, telephones) et les details de devis existants.

  ## Corrections apportees
  1. Suppression de "Anyone can update prospects" sur contacts
  2. Suppression de "Anyone can update quote requests" sur quote_requests
  3. Verification que les politiques UPDATE authentifiees restent intactes

  ## Securite post-migration
  - contacts : UPDATE uniquement pour les utilisateurs authentifies
  - quote_requests : UPDATE uniquement pour les utilisateurs authentifies
  - INSERT anonyme conserve (necessaire pour la soumission de formulaires publics)
*/

-- Suppression de la politique UPDATE dangereuse sur contacts
-- (residue de la table "prospect" avant renommage)
DROP POLICY IF EXISTS "Anyone can update prospects" ON contacts;

-- Suppression de la politique UPDATE dangereuse sur quote_requests
DROP POLICY IF EXISTS "Anyone can update quote requests" ON quote_requests;
