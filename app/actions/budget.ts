
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function getBudgetData(month: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch categories for the specific month
  const { data: categories, error: catError } = await supabase
    .from('budget_categories')
    .select('*, transactions(*)')
    .eq('user_id', userId)
    .eq('month', month);

  if (catError) {
    console.error("Fetch budget error:", catError);
    return { income: [], expenses: [] };
  }

  const income = categories
    .filter(c => c.type === 'income')
    .map(c => ({
      id: c.id,
      name: c.name,
      estimated: c.estimated_amount,
      actual: c.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
    }));

  const expenses = categories
    .filter(c => c.type === 'expense')
    .map(c => ({
      id: c.id,
      name: c.name,
      estimated: c.estimated_amount,
      actual: c.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
      transactions: c.transactions || []
    }));

  return { income, expenses };
}

export async function addTransaction(data: {
  category_id: string;
  amount: number;
  description: string;
  date: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      category_id: data.category_id,
      amount: data.amount,
      description: data.description,
      date: data.date
    });

  if (error) throw error;
  return { success: true };
}
