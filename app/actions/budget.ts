
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

export async function updateCategoryAmount(id: string, amount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('budget_categories')
      .update({ estimated_amount: amount })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateActualAmount(categoryId: string, amount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // First delete existing transactions for this category (since we're overriding with a single value)
    await supabase
      .from('transactions')
      .delete()
      .eq('category_id', categoryId)
      .eq('user_id', userId);

    // Insert the single new amount
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: amount,
        description: `Manual override`,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(data: {
  name: string;
  type: string;
  month: string;
  estimated_amount: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('budget_categories')
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        estimated_amount: data.estimated_amount,
        month: data.month
      });


    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Foreign key deletes transactions automatically if cascading, 
    // but if not, let's delete them first
    await supabase.from('transactions').delete().eq('category_id', id);

    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



