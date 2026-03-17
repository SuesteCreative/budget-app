
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.CLERK_SECRET_KEY; // Wait, I should use the service role key or anon key?
// I have SUPABASE_SERVICE_ROLE_KEY? Let me check .env.local again.

async function checkUsers() {
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }
    console.log('Profiles found:', data);
}

checkUsers();
