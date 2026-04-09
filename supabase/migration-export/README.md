# Import de Base de Données AfriLitt

## 🚀 Méthode Recommandée : SQL Editor (5 minutes)

### Étape 1 : Accéder au SQL Editor

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/pvjeufrrktatorurgstl
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Cliquez sur **+ New Query**

### Étape 2 : Importer le schéma (01_schema.sql)

1. Dans votre éditeur de code, ouvrez `supabase/migration-export/01_schema.sql`
2. **Sélectionnez tout** (Ctrl+A / Cmd+A) et **copiez** (Ctrl+C / Cmd+C)
3. Retournez dans le SQL Editor de Supabase
4. **Collez** le contenu (Ctrl+V / Cmd+V)
5. Cliquez sur **Run** (bouton vert en bas à droite)
6. ✅ Attendez ~10-15 secondes jusqu'à voir "Success"

### Étape 3 : Importer les données (02_data.sql)

1. Dans le SQL Editor, cliquez sur **+ New Query** (nouvelle requête)
2. Dans votre éditeur de code, ouvrez `supabase/migration-export/02_data.sql`
3. **Sélectionnez tout** et **copiez**
4. Retournez dans le SQL Editor
5. **Collez** le contenu
6. Cliquez sur **Run**
7. ✅ Attendez ~5 secondes jusqu'à voir "Success"

### Étape 4 : Vérifier l'import

Dans Supabase Dashboard, allez dans **Table Editor** :
- `categories` → devrait avoir **9 lignes**
- `homepage_banners` → devrait avoir **2 lignes**
- `platform_settings` → devrait avoir **22 lignes**

## ✅ Migration Terminée !

### Prochaines étapes importantes

#### 1. Créer les utilisateurs (Authentication)

Allez dans **Authentication → Users** et créez :

**Admin :**
- Email : `admin@afrilitt.com`
- Mot de passe : (votre choix)
- Après création, trouvez l'UUID de l'utilisateur
- Allez dans **Table Editor → profiles**
- Trouvez la ligne correspondante et changez `role` en `admin`

**Auteur :**
- Email : `bantoo1reseau@gmail.com`
- Mot de passe : (votre choix)
- Role : `author` (dans la table profiles)

**Lecteur :**
- Email : `goodchoice.gabon@gmail.com`
- Mot de passe : (votre choix)
- Role : `user` (par défaut)

#### 2. Créer le bucket Storage

Allez dans **Storage** :
1. Cliquez sur **Create a new bucket**
2. Nom : `documents`
3. **Public bucket** : ✅ Cochez cette case
4. Créez le bucket

Ensuite, dans le bucket `documents`, créez ces dossiers :
- `pdfs/` - Documents PDF complets
- `covers/` - Images de couverture
- `previews/` - Aperçus PDF (premières pages)

#### 3. Redémarrer l'application

```bash
pm2 restart all
```

#### 4. Tester l'application

Ouvrez http://localhost:3000 et vérifiez :
- ✅ Page d'accueil s'affiche
- ✅ Catégories visibles
- ✅ Connexion fonctionne
- ✅ Dashboard accessible

## 🔧 Dépannage

### Erreur "relation does not exist"
**Solution :** Vérifiez que vous avez bien exécuté `01_schema.sql` AVANT `02_data.sql`

### Erreur "duplicate key value"
**Solution :** Normal si vous relancez l'import. Les données existent déjà.

### Pas de données dans les tables
**Solution :** 
1. Vérifiez que `02_data.sql` s'est exécuté sans erreur
2. Vérifiez RLS : allez dans **Authentication → Policies** et vérifiez que les policies existent

### L'application ne se connecte pas à la base
**Solution :** 
1. Vérifiez que `.env.local` contient les bonnes clés
2. Redémarrez le serveur : `pm2 restart all`

## 📚 Documentation Complète

Pour le guide détaillé avec toutes les explications, consultez : `MIGRATION_GUIDE.md`

## 🎯 Résumé

✅ **Ce qui a été migré :**
- 10 tables avec toutes les contraintes
- Toutes les policies RLS
- 9 catégories
- 2 bannières homepage
- 22 paramètres plateforme

❌ **Ce qui doit être fait manuellement :**
- Créer les utilisateurs dans Authentication
- Créer le bucket Storage `documents`
- Migrer les fichiers documents (si applicable)

---

**Temps total estimé :** 10-15 minutes (import + configuration)