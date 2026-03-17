
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";

const data = require('./import_data.json');

async function forceMigrateAll() {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: profiles } = await supabase.from('profiles').select('id');
    
    if (!profiles || profiles.length === 0) {
        console.error("NO PROFILES FOUND IN DB! User must log in first.");
        return;
    }

    for (const p of profiles) {
        const userId = p.id;
        console.log("Forcing migration for actual user ID found in DB:", userId);

        const months = Object.keys(data);
        await supabase.from('budget_categories').delete().eq('user_id', userId).in('month', months);

        for (const [month, content] of Object.entries(data)) {
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
    }
    console.log("SUCCESS: Forced migration for all active users.");
}

forceMigrateAll();
