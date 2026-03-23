# SECURITY TEST PLAN — GBM Menuiserie
**Date :** 2026-03-22
**Type :** Tests defensifs non destructifs
**Environnement cible :** Local (localhost:5173) + Staging si disponible

---

## Prerequis pour executer les tests en staging

1. Avoir un environnement Supabase de staging distinct (projet separé)
2. Variables d'environnement `.env.staging` avec les cles du projet staging
3. Base de donnees de staging avec schema identique a la production
4. Ne jamais executer les tests directement sur la production

```bash
# Lancer le projet en mode local
npm run dev

# Verifier que la version de build est correcte
npm run build && npm run preview
```

---

## SIM-1 : Bypass d'origine CORS

**Objectif :** Verifier que les origines non autorisees ne recoivent pas de credentials CORS.

**Statut :** Execute localement (simulation Node.js)

**Resultat :** VULNERABILITE CORRIGEE
- Avant : n'importe quelle origine recevait `Access-Control-Allow-Origin: gbm-menuiserie.fr`
- Apres : seules les origines autorisees recoivent leur propre origine ; header `Vary: Origin` ajoute

**Commande de verification :**
```bash
# Test depuis curl (ne valide pas le CORS navigateur, mais verifie le header)
curl -s -I -X OPTIONS \
  -H "Origin: https://attacker.com" \
  -H "Access-Control-Request-Method: POST" \
  https://[SUPABASE_PROJECT_REF].supabase.co/functions/v1/submit-contact \
  | grep -i "access-control"

# Resultat attendu : Access-Control-Allow-Origin: https://gbm-menuiserie.fr (pas attacker.com)
```

---

## SIM-2 : Injection SQL / XSS via formulaires

**Objectif :** Verifier que les payloads malveillants sont rejetes a la validation.

**Statut :** Execute localement (simulation Node.js)

**Payloads testes :**
- `'; DROP TABLE contacts; --` → Bloque (regex firstName)
- `' OR '1'='1` → Bloque (regex)
- `<script>alert('xss')</script>` → Bloque (regex) + DOMPurify cote rendu
- `{{constructor.constructor('alert(1)')()}}` → Bloque (regex)
- `javascript:alert(1)` → Bloque (sanitizeUrl + regex)

**Resultat :** PASS — tous les payloads bloques par la validation whitelist regex

**Test manuel (dev local) :**
1. Ouvrir le formulaire contact sur localhost:5173/contact
2. Saisir `<script>alert(1)</script>` dans le champ nom
3. Resultat attendu : champ accepte la saisie (validation au submit), mais la soumission echoue avec erreur de validation
4. Verifier dans Supabase Studio qu'aucune ligne n'a ete inseree

---

## SIM-3 : Bypass du token CSRF

**Objectif :** Verifier la robustesse de la verification CSRF.

**Statut :** Execute localement (simulation Node.js)

**Resultat :** VULNERABILITE PARTIELLE
- Un token de 32+ caracteres quelconque passe la verification de longueur
- La protection reelle repose sur le modele SPA + CORS restrictif (Same-Origin Policy navigateur)
- Un attaquant ne peut pas forger une requete cross-origin sans que le navigateur ne bloque

**Test manuel :**
```bash
# Test sans token CSRF (doit etre rejete)
curl -s -X POST \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -H "Origin: https://gbm-menuiserie.fr" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","message":"hello"}' \
  https://[REF].supabase.co/functions/v1/submit-contact
# Resultat attendu : {"error":"Missing or invalid CSRF token"}

# Test avec token forge (32 chars) - ATTENTION: passe actuellement
curl -s -X POST \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -H "Origin: https://gbm-menuiserie.fr" \
  -H "X-CSRF-Token: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","message":"hello"}' \
  https://[REF].supabase.co/functions/v1/submit-contact
# Resultat actuel : PASSE (vulnerabilite connue H-02)
```

---

## SIM-4 : Bypass du rate limiting via cold-start

**Objectif :** Verifier la persistence du rate limiting.

**Statut :** Execute localement (simulation Node.js)

**Resultat :** VULNERABILITE CONFIRMEE (M-01)
- Le cache memoire Map() est reinitialise a chaque cold-start de l'edge function
- Les Edge Functions Deno de Supabase peuvent redemarrer entre des requetes espacees
- Un attaquant patient peut envoyer des rafales (3 req/min) a chaque cold-start

**Test manuel (staging uniquement) :**
```bash
# Envoyer 3 requetes valides (doit etre bloque a la 4e)
for i in 1 2 3 4; do
  curl -s -X POST -H "Authorization: Bearer [ANON_KEY]" \
    -H "Content-Type: application/json" \
    -H "Origin: https://gbm-menuiserie.fr" \
    -H "X-CSRF-Token: $(openssl rand -hex 16)" \
    -d '{"first_name":"Test","last_name":"User","email":"test@test.com","message":"hello"}' \
    https://[REF].supabase.co/functions/v1/submit-contact
  echo "Request $i done"
  sleep 5
done
# La 4e requete doit retourner HTTP 429
```

---

## SIM-5 : Acces non autorise aux donnees (bypass RLS)

**Objectif :** Verifier que les donnees sensibles ne sont pas lisibles sans authentification.

**Statut :** Execute (simulation logique + verification politique RLS)

**Resultat :** PASS — RLS correctement configure

**Test manuel :**
```bash
# Tentative de lecture des contacts avec cle anon (doit etre vide ou erreur)
curl -s \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "apikey: [ANON_KEY]" \
  "https://[REF].supabase.co/rest/v1/contacts?select=*" \
  | head -c 200
# Resultat attendu : [] ou erreur RLS (les lignes ne doivent pas etre visibles)

# Tentative de lecture des quote_requests avec cle anon
curl -s \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "apikey: [ANON_KEY]" \
  "https://[REF].supabase.co/rest/v1/quote_requests?select=*" \
  | head -c 200
# Resultat attendu : [] (RLS bloque la lecture anonyme)
```

---

## SIM-6 : Validation des champs — depassement de limites

**Objectif :** Verifier que les payloads trop longs sont rejetes.

**Statut :** Simule (pas execute en production)

**Test staging :**
```bash
# Payload avec first_name de 10000 caracteres
LONG_NAME=$(python3 -c "print('A'*10000)")
curl -s -X POST \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -H "Origin: https://gbm-menuiserie.fr" \
  -H "X-CSRF-Token: $(openssl rand -hex 16)" \
  -d "{\"first_name\":\"$LONG_NAME\",\"last_name\":\"Test\",\"email\":\"test@test.com\",\"message\":\"hello\"}" \
  https://[REF].supabase.co/functions/v1/submit-contact
# Resultat attendu : erreur de validation (first_name trop long ou regex echec)
```

---

## SIM-7 : Exposition de variables d'environnement dans le bundle

**Objectif :** Verifier qu'aucun secret ne fuite dans le bundle JS de production.

**Statut :** Execute

**Commande :**
```bash
npm run build
grep -r "service_role\|sk_live\|sk_test\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\." dist/
# Resultat attendu : aucune correspondance

# Verifier que seule la cle anon est presente (acceptable)
grep -r "VITE_SUPABASE" dist/ | head -5
# Seul VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent apparaitre
```

**Resultat :** PASS — aucun service_role key dans le bundle

---

## SIM-8 : Presence de sourcemaps en production

**Objectif :** Verifier que les sourcemaps ne sont pas inclus dans le build de production.

**Statut :** Execute

**Commande :**
```bash
npm run build
ls dist/assets/*.map 2>/dev/null && echo "FAIL: sourcemaps presentes" || echo "PASS: pas de sourcemaps"
```

**Resultat :** PASS — sourcemaps desactivees en production (`sourcemap: mode === 'development'`)

---

## SIM-9 : console.log en production

**Objectif :** Verifier que les console.log sont supprimes dans le build de production.

**Statut :** Execute

**Commande :**
```bash
npm run build
grep -r "console\." dist/assets/index-*.js | wc -l
# Resultat attendu : 0 (supprime par Terser drop_console: true)
```

**Resultat :** PASS — Terser supprime tous les console.* en production

---

## Tests non executes (raisons)

| Test | Raison de non-execution |
|------|------------------------|
| Brute force auth Supabase Studio | Hors perimetre — authentification geree par Supabase, pas par l'application |
| Test de penetration reseau | Necessite environnement isole — risque de perturber la production |
| Fuzzing automatise des endpoints | Necessite staging dedié — risque de polluer les donnees de production |
| Test upload de fichiers malveillants | Aucun formulaire d'upload de fichiers dans l'application |
| Test escalade de privileges | Aucun systeme de roles dans l'application publique |

---

## Script de verification pre-deploiement

Ajouter dans `package.json` :

```json
"scripts": {
  "security:check": "npm audit --audit-level=high && npm run build && node scripts/security-check.js"
}
```

Fichier `scripts/security-check.js` :
```js
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const files = fs.readdirSync(path.join(distDir, 'assets'));

let issues = 0;

// Verifier absence de sourcemaps
const sourcemaps = files.filter(f => f.endsWith('.map'));
if (sourcemaps.length > 0) {
  console.error('FAIL: Sourcemaps presentes en production:', sourcemaps);
  issues++;
}

// Verifier absence de service_role key
const jsFiles = files.filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(distDir, 'assets', file), 'utf8');
  if (content.includes('service_role')) {
    console.error('FAIL: service_role key trouvee dans', file);
    issues++;
  }
});

if (issues === 0) {
  console.log('PASS: Verification securite build OK');
} else {
  process.exit(1);
}
```
