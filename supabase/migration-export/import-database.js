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

async function executeSQL(supabase, sqlContent, filename) {
  try {
    logStep('EXEC', `Exécution de ${filename}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      // If exec_sql function doesn't exist, try direct query
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        logWarning('Fonction exec_sql non trouvée, utilisation de la méthode alternative...');
        
        // Split SQL into individual statements
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i] + ';';
          
          // Skip comments
          if (statement.trim().startsWith('--')) continue;
          
          const { error: stmtError } = await supabase.rpc('exec', {
            query: statement
          });

          if (stmtError) {
            // Try one more method - using postgrest directly
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
              method: 'POST',
              headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ query: statement })
            });

            if (!response.ok) {
              errorCount++;
              logWarning(`Statement ${i + 1}/${statements.length} échoué (peut être normal si déjà existant)`);
            } else {
              successCount++;
            }
          } else {
            successCount++;
          }
        }

        logSuccess(`${successCount}/${statements.length} statements exécutés`);
        if (errorCount > 0) {
          logWarning(`${errorCount} statements ont échoué (probablement déjà existants)`);
        }
        return true;
      }
      
      throw error;
    }

    logSuccess(`${filename} exécuté avec succès!`);
    return true;

  } catch (error) {
    logError(`Erreur lors de l'exécution de ${filename}:`);
    console.error(error);
    return false;
  }
}

async function executeSQLDirect(supabase, sqlContent, filename) {
  try {
    logStep('EXEC', `Exécution directe de ${filename}...`);
    
    // Use Supabase Management API to execute SQL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0];
    
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sqlContent })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    logSuccess(`${filename} exécuté avec succès!`);
    
    if (result.length > 0) {
      log(`  → ${result.length} résultats retournés`, 'blue');
    }
    
    return true;

  } catch (error) {
    logError(`Erreur lors de l'exécution de ${filename}:`);
    console.error(error.message);
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

  // Initialize Supabase client
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
  log('Assurez-vous que:', 'yellow');
  log('  1. Vous avez configuré le bon projet dans .env.local', 'yellow');
  log('  2. Le projet est vide ou que vous acceptez d\'écraser les données', 'yellow');
  log('\nAppuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...', 'yellow');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Execute schema
  logStep('1/2', 'Import du schéma (tables, RLS, contraintes)...');
  const schemaSuccess = await executeSQLDirect(supabase, schemaSQL, '01_schema.sql');

  if (!schemaSuccess) {
    logError('L\'import du schéma a échoué. Arrêt du script.');
    log('\nConseil: Vérifiez que le projet Supabase est accessible et que la clé service_role est correcte.', 'yellow');
    process.exit(1);
  }

  // Wait a bit for schema to settle
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Execute data
  logStep('2/2', 'Import des données (catégories, bannières, settings)...');
  const dataSuccess = await executeSQLDirect(supabase, dataSQL, '02_data.sql');

  if (!dataSuccess) {
    logWarning('L\'import des données a rencontré des erreurs.');
    log('Cela peut être normal si certaines données existent déjà.', 'yellow');
  }

  // Final verification
  logStep('VERIFY', 'Vérification de l\'import...');
  
  const checks = [
    { table: 'categories', expected: 9 },
    { table: 'homepage_banners', expected: 2 },
    { table: 'platform_settings', expected: 22 }
  ];

  let allChecksPass = true;

  for (const check of checks) {
    const { data, error } = await supabase
      .from(check.table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      logError(`Erreur vérification ${check.table}: ${error.message}`);
      allChecksPass = false;
    } else {
      const count = data?.length || 0;
      if (count >= check.expected) {
        logSuccess(`${check.table}: ${count} lignes (attendu: ${check.expected})`);
      } else {
        logWarning(`${check.table}: ${count} lignes (attendu: ${check.expected})`);
        allChecksPass = false;
      }
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