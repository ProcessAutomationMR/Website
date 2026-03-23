# SECURITY AUDIT — GBM Menuiserie
**Date :** 2026-03-22
**Auditeur :** Audit automatisé + revue manuelle
**Perimetre :** Code source complet, edge functions, base de donnees, dependances
**Stack :** React 18 + TypeScript + Vite 5 + Supabase (PostgreSQL + Edge Functions Deno)

---

## Surfaces d'attaque identifiees

### Formulaires publics
| Surface | Route | Auth requise |
|---------|-------|-------------|
| Formulaire contact | `/contact` | Non |
| Demande de devis | `/devis` | Non |
| Demande de description projet | Modal ProductDetailPage | Non |
| Demande projet general | Modal CategoryPage | Non |
| Recherche | Modal Header | Non |

### Endpoints API (Edge Functions)
| Endpoint | Methode | Auth | Rate Limit |
|----------|---------|------|-----------|
| `/functions/v1/submit-contact` | POST | Anon key | 3/min + 10/h |
| `/functions/v1/submit-quote` | POST | Anon key | 3/min + 10/h |
| `/functions/v1/log-activity` | POST | Anon key | 20/min |

### Acces direct Supabase depuis le frontend
| Table | Operation | Auth |
|-------|-----------|------|
| `projects` | SELECT | Anon (RLS public read) |
| `projects` | UPDATE ranking | Anon via RPC function securisee |
| Storage `Photos` | GET (public) | Aucune |

### Routes publiques / authentifiees / admin
- Toutes les routes frontend sont publiques (site vitrine)
- Aucun dashboard admin expose dans l'application publique
- Acces admin uniquement via Supabase Studio (hors perimetre)

---

## Inventaire des risques

### HAUTE

| ID | Vulnerabilite | Fichier | Risque concret | Correctif | Statut |
|----|--------------|---------|---------------|-----------|--------|
| H-01 | CORS fallback vers origine autorisee pour requetes inconnues | `_shared/middleware.ts:34-36` | Le header `Access-Control-Allow-Origin` retournait toujours `gbm-menuiserie.fr` meme pour des origines inconnues. Mauvaise configuration pouvant induire en erreur des outils d'audit. | Retourner l'origine uniquement si elle est dans la liste + header `Vary: Origin` | CORRIGE |
| H-02 | CSRF token valide par longueur uniquement (pas d'authenticite cryptographique) | `submit-contact/index.ts:72-75` | N'importe quelle chaine de 32+ caracteres passe la verification CSRF. Un attaquant peut forger un token valide. La protection SPA + CORS reste fonctionnelle contre les attaques CSRF classiques. | Protection SPA/CORS fonctionnelle. Token cryptographique complet necessiterait un endpoint de generation server-side signe (HMAC). | PARTIEL |
| H-03 | `console.error` bruts dans des composants frontend | `CategoryPage.tsx`, `AllProjectsPage.tsx`, `GeneralProjectModal.tsx`, `ProjectDescriptionModal.tsx` | Messages d'erreur techniques (structure interne, details Supabase) visibles dans la console navigateur en production. | Remplaces par `logger.error()` qui supprime les details en production | CORRIGE |
| H-04 | Dependance vulnerable : esbuild <= 0.24.2 via Vite 5.4.x | `package.json` | GHSA-67mh-4wv8-2f99 : le serveur de dev peut repondre a des requetes cross-origin. Impact UNIQUEMENT en developpement local, zero impact en production. | Vite 5.4.21 est la derniere stable de la branche 5.x. La correction complete necessite Vite 6.x (breaking change). | NON APPLICABLE en prod |

### MOYENNE

| ID | Vulnerabilite | Fichier | Risque concret | Correctif | Statut |
|----|--------------|---------|---------------|-----------|--------|
| M-01 | Rate limiting en memoire (Map JS) — contournable via cold-start | `_shared/middleware.ts:96-128` | Les Edge Functions Deno peuvent redemarrer entre requetes. Le cache memoire est efface, reinitialisant les compteurs. | Migrer vers la table `rate_limit_tracking` deja creee en base. | NON CORRIGE |
| M-02 | `unsafe-inline` dans CSP (serveur dev et preview) | `vite.config.ts:34,44` | Autorise les scripts inline si le CSP est contourne. Ne s'applique qu'en dev/preview, pas au deploiement production. | Configurer les headers CSP au niveau de la plateforme de deploiement sans `unsafe-inline`. | NON CORRIGE — config plateforme |
| M-03 | Contraintes DB partielles sur contacts/quote_requests | tables `contacts`, `quote_requests` | Sans contraintes au niveau base, un acces direct bypass edge function permettrait des valeurs arbitraires. | Contraintes CHECK ajoutees sur longueurs. Contrainte email_format en attente de nettoyage des donnees de test. | CORRIGE (partiel) |
| M-04 | Localhost code en dur dans les origines CORS des edge functions | `submit-contact`, `submit-quote`, `log-activity` index.ts | Origines `localhost:5173/4173` actives en production. Risque faible (CORS = protection navigateur). | Gerer via variable d'environnement Deno. | NON CORRIGE — faible risque |

### BASSE

| ID | Vulnerabilite | Fichier | Risque concret | Correctif | Statut |
|----|--------------|---------|---------------|-----------|--------|
| B-01 | Honeypot defini mais jamais utilise dans les formulaires | `anti-automation.utils.ts:149-179` | Code mort. Les formulaires n'utilisent pas le honeypot. | Implementer dans Contact et Devis, ou supprimer. | NON CORRIGE |
| B-02 | Normalisation telephone absente cote serveur | `_shared/validation.ts:97-103` | Formats varies stockes en base (0612..., +33612...). Normalisation presente cote client uniquement. | Ajouter `normalizePhone` dans la validation serveur des edge functions. | NON CORRIGE — low impact |
| B-03 | Contrainte email_format non ajoutee a la DB | table `contacts` | Donnees de test avec emails invalides ("r") bloquent l'ajout de la contrainte. | Supprimer les lignes de test, puis ajouter la contrainte manuellement. | NON CORRIGE — nettoyage necessaire |
| B-04 | HSTS absent des headers Vite dev | `vite.config.ts` | Normal en dev. Verifier que la plateforme de deploiement l'ajoute en production. | Configurer HSTS au niveau de la plateforme (Vercel/Cloudflare). | NON APPLICABLE |

---

## Points forts identifies

| Domaine | Description |
|---------|-------------|
| RLS Supabase | Politiques correctement configurees : lecture/modification aux authentifies, INSERT anonyme limite aux formulaires |
| Validation double couche | Validation regex stricte cote client ET validation complete cote serveur (edge functions) |
| XSS | DOMPurify avec liste d'attributs/tags explicite sur tout rendu HTML, `escapeHtml()` disponible |
| Secrets | Aucun secret code en dur ; service role key uniquement dans les edge functions ; `.env` dans `.gitignore` |
| Logs | Logger conditionnel : silencieux en production, details en developpement uniquement |
| IP | Anonymisation des adresses IP avant stockage (RGPD) |
| Headers securite | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy sur toutes les reponses |
| Anti-automation | Detection comportementale, canvas fingerprinting, detection WebDriver/Nightmare/PhantomJS |
| CSRF | Token cryptographique 256 bits via `crypto.getRandomValues()`, envoye en header custom |
| Build prod | console.log supprimes par Terser (`drop_console: true`), sourcemaps desactives |
