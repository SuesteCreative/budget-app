
"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import data from "../../import_data.json";

export async function importExcelData() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "CLERK_AUTH_FAILED: No user ID found." };

    const supabase = getSupabaseAdmin();

    // 1. Ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id' });
      
    if (profileError) {
      return { success: false, error: "SUPABASE_PROFILE_ERROR: " + profileError.message };
    }

    // 3. Clear old data to prevent duplication during a re-sync
    const monthsToSync = Object.keys(data);
    await supabase.from('budget_categories').delete().eq('user_id', userId).in('month', monthsToSync);
    
    // Process categories and transactions
    for (const [month, content] of Object.entries(data) as any[]) {
      
      // Process Income
      for (const item of content.income) {
        const { data: catData, error: catError } = await supabase
          .from('budget_categories')
          .insert({
            user_id: userId,
            name: item.name,
            type: 'income',
            estimated_amount: item.estimated,
            month: month
          })
          .select()
          .single();

        if (catError) continue;

        if (item.actual > 0) {
          await supabase.from('transactions').insert({
            user_id: userId,
            category_id: catData.id,
            description: `Income: ${item.name}`,
            amount: item.actual,
            date: `${month}-01`,
          });
        }
      }

      // Process Expenses
      for (const item of content.expenses) {
        const { data: catData, error: catError } = await supabase
          .from('budget_categories')
          .insert({
            user_id: userId,
            name: item.name,
            type: 'expense',
            estimated_amount: item.estimated,
            month: month
          })
          .select()
          .single();

        if (catError) continue;

        if (item.actual > 0) {
          await supabase.from('transactions').insert({
            user_id: userId,
            category_id: catData.id,
            description: item.name,
            amount: item.actual,
            date: item.date,
          });
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "CRITICAL_ACTION_ERROR: " + (error.message || "Unknown") };
  }
}
