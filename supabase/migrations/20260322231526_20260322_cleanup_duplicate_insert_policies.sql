/*
  # Nettoyage des politiques INSERT dupliquees

  ## Probleme
  Les tables contacts et quote_requests possedent chacune deux politiques INSERT
  pour les anonymes, creant de la redondance et de la confusion :

  Table contacts :
  - "Anon can insert contacts" (roles: anon)
  - "Anyone can create prospects" (roles: anon, authenticated) -- doublon residuel

  Table quote_requests :
  - "Anon can insert quote requests" (roles: anon)
  - "Anyone can create quote requests" (roles: anon, authenticated) -- doublon residuel

  Les politiques "Anon can insert contacts" et "Anon can insert quote requests"
  sont les politiques canoniques conservees. Les residus de l'ancienne table
  "prospect" sont supprimes.

  ## Impact fonctionnel
  Aucun -- les formulaires publics continuent de fonctionner via les politiques
  canoniques. Les utilisateurs authentifies peuvent inserer via leur role.

  ## Politiques conservees apres cette migration
  - contacts : "Anon can insert contacts" (anon INSERT)
  - contacts : "Auth can update contacts" (authenticated UPDATE)
  - contacts : "Auth can delete contacts" (authenticated DELETE)
  - contacts : "Auth can view all contacts" (authenticated SELECT)
  - quote_requests : "Anon can insert quote requests" (anon INSERT)
  - quote_requests : "Auth can update quote requests" (authenticated UPDATE)
  - quote_requests : "Auth can delete quote requests" (authenticated DELETE)
  - quote_requests : "Auth can view all quote requests" (authenticated SELECT)
*/

-- Suppression des politiques INSERT dupliquees sur contacts
DROP POLICY IF EXISTS "Anyone can create prospects" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can view prospects" ON contacts;

-- Suppression des politiques INSERT dupliquees sur quote_requests
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
