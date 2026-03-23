/*
  # Suppression de SECURITY DEFINER sur cleanup_old_rate_limit_logs

  ## Probleme
  La fonction cleanup_old_rate_limit_logs() etait definie avec SECURITY DEFINER,
  ce qui signifie qu'elle s'execute avec les privileges de son createur (postgres)
  et non avec ceux de l'appelant. Cela viole le principe du moindre privilege.

  ## Correction
  Recréation de la fonction sans SECURITY DEFINER. La fonction s'execute desormais
  avec les privileges du role appelant. Seul le service_role (qui a acces complet
  a rate_limit_logs via la politique ALL) peut l'executer efficacement.

  ## Impact fonctionnel
  Aucun impact sur les operations normales. La fonction est prevue pour etre
  appelee par un job planifie avec le service_role.
*/

CREATE OR REPLACE FUNCTION cleanup_old_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rate_limit_logs
  WHERE created_at < now() - interval '7 days';
END;
$$;
