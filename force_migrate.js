
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";
const userId = "user_3B4xLvCPwht5sF7Ra7hamSMmoer";

const data = require('./import_data.json');

async function forceMigrate() {
    const supabase = createClient(supabaseUrl, serviceKey);
    console.log("Starting FORCE migration for user:", userId);

    // 1. Cleanup existing data for Jan/Feb/2025
    const months = Object.keys(data);
    const { error: delError } = await supabase.from('budget_categories').delete().eq('user_id', userId).in('month', months);
    if (delError) console.error("Del Error:", delError);

    for (const [month, content] of Object.entries(data)) {
        console.log(`Processing ${month}...`);
        
        // Income
        for (const item of content.income) {
            const { data: cat, error: catErr } = await supabase.from('budget_categories').insert({
                user_id: userId,
                name: item.name,
                type: 'income',
                estimated_amount: item.estimated,
                month: month
            }).select().single();
            
            if (catErr) {
                console.error(`Cat Err (${item.name}):`, catErr);
                continue;
            }

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
            const { data: cat, error: catErr } = await supabase.from('budget_categories').insert({
                user_id: userId,
                name: item.name,
                type: 'expense',
                estimated_amount: item.estimated,
                month: month
            }).select().single();
            
            if (catErr) {
                 console.error(`Cat Err (${item.name}):`, catErr);
                 continue;
            }

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
    console.log("SUCCESS: Migration complete.");
}

forceMigrate();
