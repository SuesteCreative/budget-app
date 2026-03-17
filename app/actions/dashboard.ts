
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function getDashboardStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch balance
    const { data: categories } = await supabase
      .from('budget_categories')
      .select('*, transactions(*)')
      .eq('user_id', userId);

    const balance = (categories || []).reduce((acc: number, cat: any) => {
      const catTotal = (cat.transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0);
      return cat.type === 'income' ? acc + catTotal : acc - catTotal;
    }, 0);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthCats = (categories || []).filter((c: any) => c.month === currentMonth);
    
    const spentMonth = monthCats
      .filter((c: any) => c.type === 'expense')
      .reduce((acc: number, cat: any) => acc + (cat.transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0), 0);

    const incomeMonth = monthCats
      .filter((c: any) => c.type === 'income')
      .reduce((acc: number, cat: any) => acc + (cat.transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0), 0);

    const { data: recent } = await supabase
      .from('transactions')
      .select('*, budget_categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    return {
      balance,
      spentMonth,
      incomeMonth,
      recent: recent || []
    };
  } catch (error) {
    return {
      balance: 0,
      spentMonth: 0,
      incomeMonth: 0,
      recent: []
    };
  }
}
