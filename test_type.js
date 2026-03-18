
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";

async function testInsert() {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    const userId = profiles[0].id;
    
    const { data, error } = await supabase.from('budget_categories').insert({
        user_id: userId,
        name: 'Test Sub',
        type: 'subscription',
        estimated_amount: 10,
        month: '2025-01'
    }).select();
    
    if (error) {
        console.error("Column Type Test Failed:", error.message);
    } else {
        console.log("Column Type Test Success:", data);
        // Clean up
        await supabase.from('budget_categories').delete().eq('id', data[0].id);
    }
}

testInsert();
