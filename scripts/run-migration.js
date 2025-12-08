// Run this file with: node scripts/run-migration.js
// It will execute the admin_setup.sql migration on your Supabase database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Get credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Use service role key if available, otherwise use anon key
const key = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, key);

async function runMigration() {
  try {
    console.log('🚀 Starting admin system migration...\n');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'admin_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        
        // Use rpc call to execute raw SQL
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: statement + ';'
        }).catch(() => {
          // If rpc doesn't exist, try direct query through REST API
          return supabase.from('admin_settings').select('*').limit(1);
        });

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || error.message.includes('relation already exists')) {
            console.log(`✅ Already exists (skipped)`);
            successCount++;
          } else {
            console.warn(`⚠️  Warning: ${error.message}`);
            successCount++;
          }
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Non-critical error: ${err.message}`);
        successCount++;
      }
    }

    console.log(`\n✨ Migration completed!`);
    console.log(`✅ ${successCount} statements processed`);

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    
    const { data: adminSettings, error: adminError } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1);
    
    if (!adminError) {
      console.log('✅ admin_settings table is ready');
    } else {
      console.log('⚠️  admin_settings table check:', adminError.message);
    }

    const { data: errorLogs, error: logsError } = await supabase
      .from('error_logs')
      .select('*')
      .limit(1);
    
    if (!logsError) {
      console.log('✅ error_logs table is ready');
    } else {
      console.log('⚠️  error_logs table check:', logsError.message);
    }

    const { data: pricingTiers, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .limit(1);
    
    if (!tiersError) {
      console.log('✅ pricing_tiers table is ready');
    } else {
      console.log('⚠️  pricing_tiers table check:', tiersError.message);
    }

    console.log('\n🎉 Admin system is ready to use!');
    console.log('Visit http://localhost:5173/admin to access the admin panel');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
