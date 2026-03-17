
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sum all transactions for the current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, budget_categories!inner(*)')
    .eq('user_id', userId)
    .gte('date', `${currentMonth}-01`)
    .lte('date', `${currentMonth}-31`);

  if (error) {
    console.error("Fetch dashboard stats error:", error);
    return { spentMonth: 0, balance: 0, recent: [] };
  }

  const spentMonth = transactions
    .filter(t => t.budget_categories.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeMonth = transactions
    .filter(t => t.budget_categories.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Recent transactions
  const { data: recent } = await supabase
    .from('transactions')
    .select('*, budget_categories(name, type)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(5);

  return {
    spentMonth,
    incomeMonth,
    balance: incomeMonth - spentMonth,
    recent: recent || []
  };
}
