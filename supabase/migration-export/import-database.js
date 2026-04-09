#!/usr/bin/env node

/**
 * AFRILITT Database Import Script
 * Automatically imports schema and data to new Supabase project
 * 
 * Usage: node import-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function executeSQLStatements(supabase, sqlContent, filename) {
  try {
    logStep('EXEC', `Exécution de ${filename}...`);
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filter out empty lines and comments
        if (!s) return false;
        if (s.startsWith('--')) return false;
        if (s.match(/^\/\*/)) return false;
        return true;
      });

    log(`  → ${statements.length} statements à exécuter`, 'blue');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Show progress every 10 statements
      if (i % 10 === 0 && i > 0) {
        log(`  → Progression: ${i}/${statements.length} (${successCount} OK, ${errorCount} erreurs, ${skippedCount} ignorés)`, 'blue');
      }

      try {
        // Execute via Supabase client using raw SQL
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (error) {
          // Check if it's an "already exists" error - these are OK
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            skippedCount++;
          } else {
            errorCount++;
            if (errorCount <= 3) {
              logWarning(`Statement ${i + 1}: ${error.message.substring(0, 100)}`);
            }
          }
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        if (errorCount <= 3) {
          logWarning(`Statement ${i + 1} exception: ${err.message.substring(0, 100)}`);
        }
      }
    }

    log(`\n  Résultat final:`, 'cyan');
    logSuccess(`${successCount} statements exécutés avec succès`);
    if (skippedCount > 0) {
      log(`  ${skippedCount} statements ignorés (déjà existants)`, 'yellow');
    }
    if (errorCount > 0) {
      logWarning(`${errorCount} erreurs rencontrées`);
    }

    // Consider it a success if we have more successes than errors
    return successCount > errorCount;

  } catch (error) {
    logError(`Erreur fatale lors de l'exécution de ${filename}:`);
    console.error(error);
    return false;
  }
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║   AFRILITT - Script d\'Import de Base de Données         ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  // Check environment variables
  logStep('CHECK', 'Vérification des variables d\'environnement...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    logError('NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logError('SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
  }

  logSuccess('Variables d\'environnement OK');
  log(`  URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'blue');

  // Initialize Supabase client with service role
  logStep('INIT', 'Initialisation du client Supabase...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  logSuccess('Client Supabase initialisé');

  // Test connection - simplified test that doesn't require existing tables
  logStep('TEST', 'Test de connexion...');
  try {
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    // Any response means connection works, even if table doesn't exist
    if (testError && !testError.message.includes('does not exist') && !testError.code?.includes('PGRST205')) {
      logError('Impossible de se connecter à Supabase');
      console.error(testError);
      process.exit(1);
    }
  } catch (err) {
    // Connection test failed
    logError('Impossible de se connecter à Supabase');
    console.error(err);
    process.exit(1);
  }
  logSuccess('Connexion établie');

  // Read SQL files
  logStep('READ', 'Lecture des fichiers SQL...');
  
  const schemaPath = path.join(__dirname, '01_schema.sql');
  const dataPath = path.join(__dirname, '02_data.sql');

  if (!fs.existsSync(schemaPath)) {
    logError(`Fichier non trouvé: ${schemaPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(dataPath)) {
    logError(`Fichier non trouvé: ${dataPath}`);
    process.exit(1);
  }

  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  const dataSQL = fs.readFileSync(dataPath, 'utf8');

  logSuccess('Fichiers SQL chargés');
  log(`  01_schema.sql: ${(schemaSQL.length / 1024).toFixed(2)} KB`, 'blue');
  log(`  02_data.sql: ${(dataSQL.length / 1024).toFixed(2)} KB`, 'blue');

  // Confirmation prompt
  log('\n⚠️  ATTENTION: Cette opération va modifier votre base de données!', 'yellow');
  log('Méthode utilisée: Import SQL statement par statement', 'yellow');
  log('\nAssurez-vous que:', 'yellow');
  log('  1. Vous avez configuré le bon projet dans .env.local', 'yellow');
  log('  2. Le projet est vide ou que vous acceptez d\'écraser les données', 'yellow');
  log('\nAppuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...', 'yellow');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Execute schema
  logStep('1/2', 'Import du schéma (tables, RLS, contraintes)...');
  log('Note: Certaines erreurs "already exists" sont normales si vous relancez le script', 'yellow');
  
  const schemaSuccess = await executeSQLStatements(supabase, schemaSQL, '01_schema.sql');

  if (!schemaSuccess) {
    logError('L\'import du schéma a rencontré trop d\'erreurs.');
    log('\nOptions:', 'yellow');
    log('  1. Vérifiez les logs ci-dessus', 'blue');
    log('  2. Utilisez le SQL Editor dans Supabase Dashboard', 'blue');
    log('  3. Copiez/collez le contenu de 01_schema.sql manuellement', 'blue');
    log('\nConsultez MIGRATION_GUIDE.md pour l\'import manuel.', 'yellow');
    process.exit(1);
  }

  // Wait a bit for schema to settle
  log('\nAttente de 3 secondes pour stabilisation du schéma...', 'blue');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Execute data
  logStep('2/2', 'Import des données (catégories, bannières, settings)...');
  const dataSuccess = await executeSQLStatements(supabase, dataSQL, '02_data.sql');

  if (!dataSuccess) {
    logWarning('L\'import des données a rencontré des erreurs.');
    log('Cela peut être normal si certaines données existent déjà.', 'yellow');
  }

  // Wait before verification
  log('\nAttente de 2 secondes avant vérification...', 'blue');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Final verification
  logStep('VERIFY', 'Vérification de l\'import...');
  
  const checks = [
    { table: 'categories', expected: 9 },
    { table: 'homepage_banners', expected: 2 },
    { table: 'platform_settings', expected: 22 }
  ];

  let allChecksPass = true;

  for (const check of checks) {
    try {
      const { count, error } = await supabase
        .from(check.table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        logError(`Erreur vérification ${check.table}: ${error.message}`);
        allChecksPass = false;
      } else {
        if (count >= check.expected) {
          logSuccess(`${check.table}: ${count} lignes (attendu: ${check.expected})`);
        } else {
          logWarning(`${check.table}: ${count} lignes (attendu: ${check.expected})`);
          allChecksPass = false;
        }
      }
    } catch (err) {
      logError(`Exception lors de la vérification de ${check.table}: ${err.message}`);
      allChecksPass = false;
    }
  }

  // Summary
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    RÉSUMÉ DE L\'IMPORT                     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  if (allChecksPass) {
    logSuccess('🎉 Migration réussie!');
    log('\nProchaines étapes:', 'cyan');
    log('  1. Créer les utilisateurs dans Authentication → Users', 'blue');
    log('  2. Créer le bucket Storage "documents" (public)', 'blue');
    log('  3. Redémarrer le serveur: pm2 restart all', 'blue');
    log('  4. Tester l\'application: http://localhost:3000', 'blue');
    log('\nConsultez MIGRATION_GUIDE.md pour les détails.', 'yellow');
  } else {
    logWarning('⚠️  La migration s\'est terminée avec des avertissements.');
    log('\nVérifiez:', 'yellow');
    log('  1. Les logs ci-dessus pour identifier les problèmes', 'blue');
    log('  2. Que le projet Supabase est accessible', 'blue');
    log('  3. Que les clés dans .env.local sont correctes', 'blue');
    log('\n💡 Alternative: Import manuel via SQL Editor', 'cyan');
    log('  1. Ouvrez Supabase Dashboard → SQL Editor', 'blue');
    log('  2. Copiez le contenu de 01_schema.sql', 'blue');
    log('  3. Exécutez-le dans l\'éditeur', 'blue');
    log('  4. Répétez avec 02_data.sql', 'blue');
    log('\nConsultez MIGRATION_GUIDE.md pour le dépannage.', 'yellow');
  }

  log('\n');
}

// Run the script
main().catch(error => {
  logError('Erreur fatale:');
  console.error(error);
  process.exit(1);
});