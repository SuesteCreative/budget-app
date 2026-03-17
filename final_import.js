
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";

async function runImport() {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // 1. Get the user profile (he should have logged in by now)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1);
    
    if (pError || !profiles || profiles.length === 0) {
        console.error("No user profile found. Please make sure you are logged in to the app first!");
        return;
    }
    
    const userId = profiles[0].id;
    console.log("Importing data for user:", userId);
    
    const data = require('./import_data.json');
    
    for (const [month, content] of Object.entries(data)) {
        console.log(`Processing ${month}...`);
        
        // Income
        for (const item of content.income) {
            const { data: cat } = await supabase.from('budget_categories').insert({
                user_id: userId,
                name: item.name,
                type: 'income',
                estimated_amount: item.estimated,
                month: month
            }).select().single();
            
            if (cat && item.actual > 0) {
                await supabase.from('transactions').insert({
                    user_id: userId,
                    category_id: cat.id,
                    description: `Income: ${item.name}`,
                    amount: item.actual,
                    date: `${month}-01`
                });
            }
        }
        
        // Expenses
        for (const item of content.expenses) {
            const { data: cat } = await supabase.from('budget_categories').insert({
                user_id: userId,
                name: item.name,
                type: 'expense',
                estimated_amount: item.estimated,
                month: month
            }).select().single();
            
            if (cat && item.actual > 0) {
                await supabase.from('transactions').insert({
                    user_id: userId,
                    category_id: cat.id,
                    description: item.name,
                    amount: item.actual,
                    date: item.date
                });
            }
        }
    }
    console.log("SUCCESS: All Excel data has been moved to Supabase!");
}

runImport();
