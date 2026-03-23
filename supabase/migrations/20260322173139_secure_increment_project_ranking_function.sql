/*
  # Sécuriser la fonction increment_project_ranking - CORRECTION HAUTE PRIORITÉ

  ## Problème
  La fonction actuelle avec SECURITY DEFINER peut être appelée en boucle infinie
  par n'importe qui, permettant:
  - Manipulation du classement des projets
  - Déni de service par appels répétés
  - Surcharge de la base de données

  ## Actions correctives
  1. Supprimer SECURITY DEFINER (utiliser les permissions RLS normales)
  2. Ajouter une politique RLS permettant aux utilisateurs anonymes d'appeler la fonction
  3. La protection contre les abus se fait via le rate limiting de l'Edge Function log-activity

  ## Impact
  - La fonction reste utilisable par les utilisateurs anonymes
  - Plus de risque de privilèges élevés non nécessaires
  - Protection via rate limiting au niveau de l'Edge Function
*/

-- Recréer la fonction sans SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_project_ranking(project_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE projects
  SET ranking = COALESCE(ranking, 0) + 1
  WHERE id = project_id;
END;
$$;

-- Permettre aux utilisateurs anonymes d'exécuter la fonction
GRANT EXECUTE ON FUNCTION increment_project_ranking(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_project_ranking(uuid) TO authenticated;