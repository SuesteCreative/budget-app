
"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function getBudgetData(month: string) {
  try {
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      return { income: [], expenses: [], error: "No authenticated user found." };
    }

    const { data: categories, error: catError } = await supabase
      .from('budget_categories')
      .select('*, transactions(*)')
      .eq('user_id', userId)
      .eq('month', month);

    if (catError) {
      return { income: [], expenses: [], error: catError.message };
    }

    const income = (categories || [])
      .filter((c: any) => c.type === 'income')
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        estimated: c.estimated_amount,
        actual: c.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
      }));

    const expenses = (categories || [])
      .filter((c: any) => c.type === 'expense')
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        estimated: c.estimated_amount,
        actual: c.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
        transactions: c.transactions || []
      }));

    return { income, expenses, debugUserId: userId };
  } catch (error: any) {
    return { 
      income: [], 
      expenses: [], 
      error: error.message || "Unknown server error" 
    };
  }
}

export async function addTransaction(data: {
  category_id: string;
  amount: number;
  description: string;
  date: string;
}) {
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
