
"use server";

import { auth } from "@clerk/nextjs/server";
import { getAdminClient } from "@/lib/supabase-admin";
import data from "../../import_data.json";

export async function importExcelData() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "CLERK_AUTH_FAILED: No user ID found." };

    const supabase = await getAdminClient();

    // 1. Ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id' });
      
    if (profileError) {
      return { success: false, error: "SUPABASE_PROFILE_ERROR: " + profileError.message };
    }

    // 2. Clear old data for these months to avoid duplicates (CLEAN SYNC)
    // We only clear for Jan/Feb 2025
    const monthsToSync = Object.keys(data);
    
    // Process categories and transactions
    for (const [month, content] of Object.entries(data)) {
      
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
