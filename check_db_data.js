
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkData() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: categories, error: catError } = await supabase.from('budget_categories').select('count', { count: 'exact' });
    const { data: transactions, error: transError } = await supabase.from('transactions').select('count', { count: 'exact' });
    
    console.log('Categories count:', categories?.[0]?.count || 0);
    console.log('Transactions count:', transactions?.[0]?.count || 0);
    
    const { data: sampleCat } = await supabase.from('budget_categories').select('*').limit(5);
    console.log('Sample categories:', sampleCat);
}

checkData();
