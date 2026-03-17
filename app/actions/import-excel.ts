
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import data from "../../import_data.json";

export async function importExcelData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("Starting import for user:", userId);

  // 1. Ensure profile exists
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id' });
    
  if (profileError) {
    console.error("Profile sync error:", profileError);
    return { success: false, error: "Failed to sync profile" };
  }

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

      if (catError) {
        console.error("Income category error:", catError);
        continue;
      }

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

      if (catError) {
        console.error("Expense category error:", catError);
        continue;
      }

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
}
