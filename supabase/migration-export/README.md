# Import Automatique de Base de Données AfriLitt

## 🚀 Installation et Utilisation

### Option 1: Import Automatique (Recommandé)

1. **Installer les dépendances:**
```bash
cd supabase/migration-export
npm install
```

2. **Vérifier la configuration:**
Assurez-vous que `.env.local` à la racine du projet contient:
```
NEXT_PUBLIC_SUPABASE_URL=https://pvjeufrrktatorurgstl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

3. **Lancer l'import:**
```bash
npm run import
```

Le script va:
- ✅ Vérifier la connexion
- ✅ Créer toutes les tables
- ✅ Configurer RLS
- ✅ Importer les données
- ✅ Vérifier l'intégrité

**Durée:** ~30 secondes

### Option 2: Import Manuel

Si vous préférez plus de contrôle, suivez le guide `MIGRATION_GUIDE.md`.

## 📋 Que fait le script?

### Étape 1: Schéma (01_schema.sql)
- Crée les extensions (uuid-ossp)
- Crée 10 tables principales
- Configure tous les index
- Active RLS sur toutes les tables
- Crée toutes les policies de sécurité
- Configure le trigger de création automatique de profil

### Étape 2: Données (02_data.sql)
- 9 catégories
- 2 bannières homepage
- 22 paramètres plateforme

## ⚠️ Important

**Le script NE migre PAS:**
- ❌ Les utilisateurs Auth (à créer manuellement)
- ❌ Les documents (fichiers Storage)
- ❌ Les transactions historiques

Ces éléments doivent être migrés manuellement (voir MIGRATION_GUIDE.md).

## 🐛 Dépannage

### Erreur: "SUPABASE_SERVICE_ROLE_KEY manquant"
**Solution:** Vérifiez que `.env.local` existe à la racine et contient la clé.

### Erreur: "Cannot connect to database"
**Solution:** Vérifiez que l'URL Supabase est correcte et que le projet est actif.

### Erreur: "Permission denied"
**Solution:** Assurez-vous d'utiliser la `service_role_key`, pas la `anon_key`.

### Avertissements lors de l'import
**Normal:** Si vous relancez le script, certaines tables existent déjà. Les erreurs "already exists" sont normales.

## 📊 Vérification Post-Import

Après l'import, vérifiez dans Supabase Dashboard:

1. **Table Editor:**
   - `categories` → 9 lignes
   - `homepage_banners` → 2 lignes
   - `platform_settings` → 22 lignes

2. **Authentication:**
   - Créez vos utilisateurs (admin, auteurs, etc.)

3. **Storage:**
   - Créez le bucket `documents` (public)

4. **Application:**
   - Redémarrez: `pm2 restart all`
   - Testez: `http://localhost:3000`

## 🔄 Relancer l'import

Vous pouvez relancer le script sans problème. Il va:
- Ignorer les tables existantes
- Mettre à jour les données si nécessaire
- Recréer les policies RLS

## 📚 Documentation Complète

Pour le guide complet étape par étape, consultez: `MIGRATION_GUIDE.md`