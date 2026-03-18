
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";

async function checkSchema() {
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from('budget_categories').select('*').limit(1);
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log("Budget Category Columns:", Object.keys(data[0]));
    } else {
        console.log("No data found to check columns.");
    }
}

checkSchema();
