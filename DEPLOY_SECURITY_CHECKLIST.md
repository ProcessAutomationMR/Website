# CHECKLIST SECURITE AVANT DEPLOIEMENT — GBM Menuiserie

A executer avant chaque mise en production. Cocher chaque point avant de deployer.

---

## 1. Code & Secrets

- [ ] Aucun secret (API key, mot de passe, token) code en dur dans le code source
- [ ] Le fichier `.env` n'est pas commite dans git (verifier avec `git status`)
- [ ] `.env.example` est a jour et ne contient pas de vraies valeurs
- [ ] La cle `SUPABASE_SERVICE_ROLE_KEY` n'est presente nulle part dans `src/`
- [ ] Aucun `console.log` / `console.error` brut dans le code source (hors logger)

```bash
# Verifications automatiques
grep -rn "service_role\|sk_live\|sk_test" src/ && echo "FAIL" || echo "PASS"
grep -rn "console\.log\|console\.warn\|console\.error" src/ | grep -v "logger\|//" | wc -l
# Resultat attendu : 0
```

---

## 2. Build de production

- [ ] `npm run build` se termine sans erreur
- [ ] Aucune sourcemap dans `dist/assets/` (`*.map`)
- [ ] Le bundle ne contient pas de `service_role`
- [ ] La minification Terser est active (`drop_console: true`)

```bash
npm run build
ls dist/assets/*.map 2>/dev/null && echo "FAIL: sourcemaps presentes" || echo "PASS"
grep -r "service_role" dist/ && echo "FAIL" || echo "PASS"
```

---

## 3. Dependances

- [ ] `npm audit --audit-level=high` ne retourne aucune vulnerabilite HIGH ou CRITICAL
- [ ] Les dependances sont a jour (au moins la derniere minor stable)

```bash
npm audit --audit-level=high
```

Note : la vulnerabilite moderate esbuild (GHSA-67mh-4wv8-2f99) est acceptable car elle ne concerne que le serveur de developpement local.

---

## 4. Base de donnees Supabase

- [ ] RLS active sur toutes les tables sensibles (`contacts`, `quote_requests`, `activity_logs`, `rate_limit_tracking`)
- [ ] Aucune politique `USING (true)` pour les operations de lecture anonyme sur les tables sensibles
- [ ] La table `contacts` n'est pas lisible par des utilisateurs anonymes

```sql
-- Verifier que les anonymes ne peuvent pas lire contacts
SELECT policyname, cmd, roles, qual FROM pg_policies
WHERE tablename = 'contacts' AND cmd = 'SELECT'
ORDER BY policyname;
-- Les roles "anon" ne doivent pas apparaitre dans une politique SELECT

-- Verifier RLS active
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('contacts', 'quote_requests', 'activity_logs')
AND schemaname = 'public';
-- rowsecurity doit etre TRUE pour chaque table
```

---

## 5. Edge Functions

- [ ] Les trois edge functions sont deployees et fonctionnelles
- [ ] Les origines localhost sont acceptables (elles n'accordent pas d'acces supplementaire en production car CORS est une protection navigateur)
- [ ] Le rate limiting est configure sur chaque fonction
- [ ] Les headers de securite (CSP, X-Frame-Options, etc.) sont inclus dans les reponses

```bash
# Tester que les fonctions repondent (remplacer [REF] et [ANON_KEY])
curl -s -o /dev/null -w "%{http_code}" \
  -X OPTIONS \
  -H "Origin: https://gbm-menuiserie.fr" \
  https://[REF].supabase.co/functions/v1/submit-contact
# Attendu : 204
```

---

## 6. Headers HTTP de la plateforme de deploiement

Configurer ces headers sur Vercel / Netlify / Cloudflare (dans `vercel.json` ou `_headers`) :

```
# vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://images.pexels.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co; media-src 'self' blob: https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" }
      ]
    }
  ]
}
```

- [ ] `X-Frame-Options: DENY` present
- [ ] `Strict-Transport-Security` present avec `max-age` >= 31536000
- [ ] `Content-Security-Policy` present et ne contient pas `unsafe-inline` pour script-src

```bash
# Verifier les headers de production
curl -s -I https://gbm-menuiserie.fr | grep -i "x-frame\|strict-transport\|content-security"
```

---

## 7. Variables d'environnement en production

- [ ] `VITE_SUPABASE_URL` configure sur la plateforme de deploiement
- [ ] `VITE_SUPABASE_ANON_KEY` configure sur la plateforme de deploiement
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configure dans Supabase Edge Functions secrets (jamais dans le frontend)

---

## 8. Verification post-deploiement

- [ ] Le formulaire contact fonctionne (tester avec une vraie soumission)
- [ ] Le formulaire devis fonctionne
- [ ] Les pages se chargent sans erreur console
- [ ] Les images Supabase Storage sont accessibles
- [ ] Verifier Supabase Dashboard → Logs → Edge Functions pour s'assurer qu'il n'y a pas d'erreurs

---

## Commande complete de verification pre-deploiement

```bash
#!/bin/bash
echo "=== SECURITY PRE-DEPLOY CHECK ==="

echo "1. Checking for hardcoded secrets..."
if grep -rn "service_role\|sk_live\|sk_test" src/ 2>/dev/null; then
  echo "FAIL: Secrets found in source code"
  exit 1
fi
echo "PASS"

echo "2. Checking for raw console statements..."
COUNT=$(grep -rn "console\.\(log\|warn\|error\)" src/ 2>/dev/null | grep -v "logger\|//" | wc -l)
if [ "$COUNT" -gt 0 ]; then
  echo "WARN: $COUNT raw console statements found (should use logger)"
fi

echo "3. Running npm audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "FAIL: High severity vulnerabilities found"
  exit 1
fi
echo "PASS"

echo "4. Building for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "FAIL: Build failed"
  exit 1
fi
echo "PASS"

echo "5. Checking for sourcemaps..."
if ls dist/assets/*.map 2>/dev/null; then
  echo "FAIL: Sourcemaps found in production build"
  exit 1
fi
echo "PASS"

echo "6. Checking bundle for secrets..."
if grep -r "service_role" dist/ 2>/dev/null; then
  echo "FAIL: service_role found in bundle"
  exit 1
fi
echo "PASS"

echo "=== ALL CHECKS PASSED ==="
```

Sauvegarder dans `scripts/pre-deploy-check.sh` et executer avec `bash scripts/pre-deploy-check.sh` avant chaque deploiement.
