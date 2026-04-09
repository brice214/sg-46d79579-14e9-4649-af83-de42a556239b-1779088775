# Guide de Migration AfriLitt - Nouveau Projet Supabase

## 📋 Vue d'ensemble

Ce guide vous accompagne pour migrer complètement AfriLitt de l'ancien projet Supabase vers votre nouveau projet **pvjeufrrktatorurgstl**.

**Durée estimée:** 30-45 minutes  
**Niveau de difficulté:** Intermédiaire  
**Prérequis:** Accès au tableau de bord Supabase

---

## ✅ Checklist de Migration

- [ ] **Étape 1:** Exécuter le schéma de base
- [ ] **Étape 2:** Configurer Storage
- [ ] **Étape 3:** Créer les utilisateurs
- [ ] **Étape 4:** Importer les données
- [ ] **Étape 5:** Migrer les fichiers
- [ ] **Étape 6:** Tester l'application
- [ ] **Étape 7:** Basculer en production

---

## 🚀 Étape 1: Exécuter le Schéma de Base

### 1.1 Accéder au SQL Editor

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez le projet **afrilitt** (pvjeufrrktatorurgstl)
3. Allez dans **SQL Editor** (icône base de données à gauche)

### 1.2 Exécuter le script de schéma

1. Cliquez sur **+ New query**
2. Copiez TOUT le contenu du fichier `01_schema.sql`
3. Collez dans l'éditeur SQL
4. Cliquez sur **Run** (ou Ctrl+Enter)

**✅ Vérification:**
- Le script doit s'exécuter sans erreur
- Vous verrez "Success. No rows returned" ou similaire
- Allez dans **Table Editor** - vous devriez voir toutes les tables

---

## 📦 Étape 2: Configurer Storage

### 2.1 Créer le bucket "documents"

1. Allez dans **Storage** (à gauche)
2. Cliquez sur **Create bucket**
3. Nom: `documents`
4. **Public bucket:** ✅ Coché (important!)
5. Cliquez sur **Create bucket**

### 2.2 Créer les dossiers

Dans le bucket `documents`, créez la structure:
```
documents/
├── pdfs/
├── covers/
└── previews/
```

**Comment:**
1. Sélectionnez le bucket `documents`
2. Cliquez sur **Create folder**
3. Créez chaque dossier

---

## 👥 Étape 3: Créer les Utilisateurs

### 3.1 Créer le compte Admin

1. Allez dans **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Remplissez:
   - Email: `admin@afrilitt.com`
   - Password: `[créez un mot de passe sécurisé]`
   - ✅ **Auto Confirm User** (important!)
4. Cliquez sur **Create user**
5. **IMPORTANT:** Copiez l'UUID généré (vous en aurez besoin)

### 3.2 Mettre à jour le profil Admin

1. Allez dans **SQL Editor**
2. Exécutez cette requête (remplacez `NOUVEAU_UUID_ADMIN` par l'UUID copié):

```sql
-- Remplacez NOUVEAU_UUID_ADMIN par l'UUID réel
UPDATE public.profiles 
SET role = 'admin',
    full_name = 'Administrateur AfriLitt'
WHERE id = 'NOUVEAU_UUID_ADMIN';
```

### 3.3 Créer les autres utilisateurs (optionnel)

Répétez le processus pour:
- **Auteur:** bantoo1reseau@gmail.com (role: 'author')
- **Lecteur:** goodchoice.gabon@gmail.com (role: 'visitor')

---

## 📊 Étape 4: Importer les Données

### 4.1 Exécuter le script de données

1. Allez dans **SQL Editor**
2. Cliquez sur **+ New query**
3. Copiez TOUT le contenu de `02_data.sql`
4. Collez dans l'éditeur
5. Cliquez sur **Run**

**✅ Vérification:**
- Allez dans **Table Editor** → `categories` : 9 catégories
- `homepage_banners` : 2 bannières
- `platform_settings` : 22 paramètres

---

## 📁 Étape 5: Migrer les Fichiers (Pour les Documents Existants)

**Note:** Cette étape est nécessaire si vous voulez conserver les 2 documents existants.

### 5.1 Télécharger les fichiers de l'ancien projet

**Fichiers à récupérer:**
1. PDF: `E-Billing Integration Guide v5.3.pdf`
2. Cover 1: Image de couverture document 1
3. Cover 2: Image de couverture document 2

### 5.2 Uploader dans le nouveau Storage

1. Allez dans **Storage** → bucket `documents`
2. Créez les dossiers utilisateur dans `pdfs/` et `covers/`:
   - `pdfs/[author_id]/`
   - `covers/[author_id]/`
3. Uploadez les fichiers dans les bons dossiers

### 5.3 Mettre à jour les URLs des documents

1. Récupérez les nouvelles URLs depuis Storage
2. Exécutez dans SQL Editor:

```sql
-- Document 1
UPDATE public.documents 
SET file_url = 'https://pvjeufrrktatorurgstl.supabase.co/storage/v1/object/public/documents/pdfs/...',
    cover_image_url = 'https://pvjeufrrktatorurgstl.supabase.co/storage/v1/object/public/documents/covers/...'
WHERE id = 'dcf3e626-2165-4326-8e92-adf8e6736ee2';

-- Document 2
UPDATE public.documents 
SET file_url = 'https://pvjeufrrktatorurgstl.supabase.co/storage/v1/object/public/documents/pdfs/...',
    cover_image_url = 'https://pvjeufrrktatorurgstl.supabase.co/storage/v1/object/public/documents/covers/...'
WHERE id = 'cc315a3d-f70b-44fa-8e15-1c72cf63ec77';
```

---

## 🧪 Étape 6: Tester l'Application

### 6.1 Variables d'environnement

Les clés ont déjà été mises à jour dans `.env.local`:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### 6.2 Redémarrer le serveur

```bash
# Dans le terminal Softgen
pm2 restart all
```

### 6.3 Tests à effectuer

**Test 1: Page d'accueil**
- ✅ Bannières visibles
- ✅ Catégories affichées
- ✅ Pas d'erreurs console

**Test 2: Connexion Admin**
- ✅ Connexion avec admin@afrilitt.com
- ✅ Accès au dashboard admin
- ✅ Voir les statistiques

**Test 3: Catalogue**
- ✅ Voir les catégories
- ✅ Navigation fonctionnelle

**Test 4: Upload de document (si auteur créé)**
- ✅ Formulaire accessible
- ✅ Upload réussi
- ✅ Fichier visible dans Storage

---

## 🎯 Étape 7: Bascule Production

### 7.1 Configuration eBilling (Important!)

Si vous utilisez eBilling en production, mettez à jour:

```sql
UPDATE public.platform_settings 
SET value = '"PROD"' 
WHERE key = 'ebilling_mode';

-- Vérifiez aussi vos credentials eBilling
SELECT * FROM public.platform_settings 
WHERE category = 'payment' AND key LIKE 'ebilling%';
```

### 7.2 Configuration Email

1. Allez dans **Authentication** → **Email Templates**
2. Personnalisez les templates si nécessaire
3. Configurez SMTP (optionnel) dans **Settings** → **Auth**

### 7.3 Désactiver l'ancien projet (après confirmation)

**⚠️ NE FAITES CECI QU'APRÈS AVOIR TOUT TESTÉ!**

1. Gardez l'ancien projet en pause pendant 7 jours
2. Si tout fonctionne parfaitement, vous pouvez le supprimer
3. **Recommandé:** Faire un export SQL final de l'ancien projet avant suppression

---

## 📝 Notes Importantes

### Différences clés entre ancien et nouveau projet:

1. **UUIDs différents:** Les IDs utilisateurs sont nouveaux
2. **Storage URLs:** Toutes les URLs pointent vers le nouveau projet
3. **Auth:** Les mots de passe doivent être réinitialisés (envoyez des emails de reset)

### Sauvegardes

Tous les scripts de migration sont dans:
```
supabase/migration-export/
├── 01_schema.sql         # Schéma complet
├── 02_data.sql           # Données
└── MIGRATION_GUIDE.md    # Ce guide
```

### Rollback (en cas de problème)

Si vous devez revenir en arrière:
1. Gardez l'ancien `.env.local` (backup)
2. Restaurez les anciennes variables
3. Redémarrez le serveur

---

## ✅ Checklist Post-Migration

- [ ] Tous les tests passent
- [ ] Admin peut se connecter
- [ ] Catégories visibles
- [ ] Settings correctement configurés
- [ ] Storage fonctionne (upload test)
- [ ] Paiements testés (mode LAB)
- [ ] Ancien projet mis en pause
- [ ] Documentation mise à jour

---

## 🆘 Dépannage

### Problème: "Invalid JWT"
**Solution:** Vérifiez que les clés dans `.env.local` correspondent exactement au nouveau projet.

### Problème: "Storage bucket not found"
**Solution:** Créez le bucket `documents` en mode public.

### Problème: "User not found"
**Solution:** Vérifiez que les utilisateurs sont créés dans Auth et confirmés.

### Problème: "Permission denied"
**Solution:** Vérifiez les policies RLS - elles devraient être créées par 01_schema.sql.

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs Supabase (Logs & Analytics)
2. Consultez la console navigateur (F12)
3. Vérifiez que toutes les étapes ont été suivies

**La migration est maintenant complète! 🎉**