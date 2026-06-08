# 🧪 TEST DU CALLBACK EBILLING

## 1️⃣ TESTER LE CODE (PROUVER QU'IL FONCTIONNE)

### Étape 1: Récupérer une référence de transaction pending

```bash
# Dans la console Supabase SQL Editor
SELECT reference, amount, document_id, user_id, client_email 
FROM ebilling_transactions 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 1;
```

Vous obtiendrez quelque chose comme: `REF-1780923725908-611`

### Étape 2: Simuler le callback eBilling

```bash
# Via cURL (remplacez REF-xxx par votre référence)
curl -X POST https://www.afrilitt.com/api/payments/ebilling/test-callback \
  -H "Content-Type: application/json" \
  -d '{"reference": "REF-1780923725908-611"}'
```

OU via Postman/Insomnia:
- URL: `https://www.afrilitt.com/api/payments/ebilling/test-callback`
- Méthode: POST
- Body (JSON): `{ "reference": "REF-1780923725908-611" }`

### Étape 3: Vérifier le résultat

Après l'appel, vérifiez dans Supabase:

```sql
-- La transaction doit être "processed"
SELECT * FROM ebilling_transactions WHERE reference = 'REF-1780923725908-611';

-- Un purchase doit exister
SELECT * FROM purchases WHERE document_id = (
  SELECT document_id FROM ebilling_transactions WHERE reference = 'REF-1780923725908-611'
);

-- Une transaction financière doit exister
SELECT * FROM transactions WHERE transaction_reference = 'REF-1780923725908-611';
```

✅ **Si tout fonctionne:** Le problème vient de la configuration eBilling (voir section 2).

---

## 2️⃣ CONFIGURER L'URL DANS eBILLING

### Accéder au portail marchand eBilling

1. Connectez-vous à: **https://staging.billing-easy.net**
2. Allez dans: **Paramètres** ou **Configuration** ou **API Settings**
3. Cherchez: **Notification URL** ou **Callback URL** ou **Webhook URL**

### Configurer l'URL

**URL à configurer:**
```
https://www.afrilitt.com/api/payments/ebilling/callback
```

⚠️ **VÉRIFICATIONS CRITIQUES:**

- [ ] L'URL est exactement celle ci-dessus (pas de faute de frappe)
- [ ] L'URL commence par `https://` (pas `http://`)
- [ ] Pas d'espace avant/après l'URL
- [ ] Le chemin est `/api/payments/ebilling/callback` (pas `/api/webhooks/ebilling`)
- [ ] Vous êtes sur le bon environnement (PROD: staging.billing-easy.net)

### Tester après configuration

1. Initiez un NOUVEAU paiement test
2. Payez sur le portail eBilling
3. Attendez 1-2 minutes
4. Vérifiez les logs PM2: `pm2 logs`
5. Vérifiez dans Supabase si la transaction est passée à "processed"

---

## 3️⃣ DEBUGGING SI ÇA NE FONCTIONNE TOUJOURS PAS

### Vérifier les logs serveur

```bash
# Sur le serveur (via SSH)
pm2 logs --lines 100

# Cherchez ces messages:
# 🔔 eBilling Callback reçu
# ✅ Transaction mise à jour: processed
# ✅✅✅ PURCHASE CRÉÉ AVEC SUCCÈS ✅✅✅
```

### Si aucun log n'apparaît

Cela signifie qu'eBilling n'envoie toujours pas le callback. Contactez le support eBilling pour vérifier:

1. Que l'URL de notification est bien configurée
2. Que leur système peut atteindre votre URL (pas de blocage réseau)
3. Qu'ils envoient bien les callbacks en mode PROD

### Vérifier manuellement l'accessibilité de l'URL

```bash
# Depuis l'extérieur (n'importe quel terminal)
curl -X POST https://www.afrilitt.com/api/payments/ebilling/callback \
  -H "Content-Type: application/json" \
  -d '{"reference": "TEST-REF"}'

# Si vous obtenez une erreur 404 ou 500, le problème vient de votre serveur
# Si vous obtenez 200 avec "Transaction introuvable", l'URL est accessible (normal)
```

---

## 📋 CHECKLIST FINALE

- [ ] Code du callback vérifié et testé (via test-callback)
- [ ] URL configurée dans le portail eBilling
- [ ] URL testée manuellement (accessible depuis l'extérieur)
- [ ] Nouveau paiement test effectué
- [ ] Logs PM2 vérifiés pour voir les callbacks
- [ ] Tables Supabase vérifiées (purchase + transactions créés)

Si après TOUT ça, le callback n'est toujours pas reçu, le problème vient 100% du côté eBilling (configuration ou bug de leur côté).