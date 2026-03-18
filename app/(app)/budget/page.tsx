
"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, CheckCircle2, TrendingUp, TrendingDown, Database, Trash2, CreditCard, PiggyBank, Receipt as ReceiptIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, updateCategoryAmount, updateActualAmount, createCategory, deleteCategory } from "@/app/actions/budget";
import { importExcelData } from "@/app/actions/import-excel";

const months = [
  { name: "January", key: "2025-01" },
  { name: "February", key: "2025-02" },
  { name: "March", key: "2025-03" },
  { name: "April", key: "2025-04" },
  { name: "May", key: "2025-05" },
  { name: "June", key: "2025-06" },
  { name: "July", key: "2025-07" },
  { name: "August", key: "2025-08" },
  { name: "September", key: "2025-09" },
  { name: "October", key: "2025-10" },
  { name: "November", key: "2025-11" },
  { name: "December", key: "2025-12" }
];

export default function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(months[1]); // FEB 2025
  const [data, setData] = useState<{income: any[], expenses: any[], debugUserId?: string}>({ income: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await getBudgetData(selectedMonth.key);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await importExcelData();
      if (res.success) fetchBudget();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreate = async (group: 'EXP' | 'SUB' | 'SAV') => {
    const label = group === 'SUB' ? 'Subscription' : group === 'SAV' ? 'Saving' : 'Expense';
    const name = prompt(`Enter ${label} Name:`);
    if (!name) return;
    
    const prefix = group === 'EXP' ? '' : `[${group}] `;
    try {
        await createCategory({
            name: `${prefix}${name}`,
            type: 'expense',
            month: selectedMonth.key,
            estimated_amount: 0
        });
        fetchBudget();
    } catch (e) {
        alert("Error creating category");
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure?")) return;
      try {
          await deleteCategory(id);
          fetchBudget();
      } catch (e) {
          alert("Error deleting");
      }
  };

  const updateLocalValue = (id: string, field: 'estimated' | 'actual', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prev => {
      const newData = { ...prev };
      const index = newData.expenses.findIndex(item => item.id === id);
      if (index !== -1) {
        newData.expenses[index] = { ...newData.expenses[index], [field]: numericValue };
      }
      return newData;
    });
  };

  const commitValue = async (id: string, field: 'estimated' | 'actual', value: number) => {
    setSavingId(`${id}-${field}`);
    try {
      if (field === 'estimated') {
        await updateCategoryAmount(id, value);
      } else {
        await updateActualAmount(id, value);
      }
    } finally {
      setSavingId(null);
    }
  };

  const categorize = (items: any[]) => {
      const res = { expenses: [] as any[], subs: [] as any[], savings: [] as any[] };
      items.forEach(item => {
          if (item.name.startsWith('[SUB]')) {
              res.subs.push({ ...item, name: item.name.replace('[SUB] ', '') });
          } else if (item.name.startsWith('[SAV]')) {
              res.savings.push({ ...item, name: item.name.replace('[SAV] ', '') });
          } else {
              res.expenses.push(item);
          }
      });
      return res;
  };

  const { expenses, subs, savings } = categorize(data.expenses);
  const totalIncome = data.income.reduce((a, b) => a + (b.actual || 0), 0);
  const totalExpAct = data.expenses.reduce((a, b) => a + (b.actual || 0), 0);
  const totalExpEst = data.expenses.reduce((a, b) => a + (b.estimated || 0), 0);

  const BudgetTable = ({ title, items, icon: Icon, group }: { title: string, items: any[], icon: any, group: 'EXP' | 'SUB' | 'SAV' }) => (
    <div className="card-normal overflow-hidden mb-12 shadow-sm border border-border/50 bg-white">
        <div className="bg-muted/5 p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sharp bg-background flex items-center justify-center border border-border shadow-sm">
                    <Icon className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-bold text-sm tracking-tight">{title}</h3>
            </div>
            <button 
                onClick={() => handleCreate(group)}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-70 transition-opacity flex items-center gap-1.5"
            >
                <Plus className="w-3 h-3" /> ADD ITEM
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                    <tr className="bg-muted/5 border-b border-border">
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground w-1/3">Description</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Estimated</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Actual</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {items.map(item => (
                        <tr key={item.id} className="group hover:bg-muted/5 transition-colors">
                            <td className="px-6 py-4 font-semibold">{item.name}</td>
                            <td className="px-6 py-4">
                                <div className="relative flex items-center max-w-[120px]">
                                    <span className="absolute left-2 text-muted-foreground">€</span>
                                    <input 
                                        type="number"
                                        value={item.estimated || ""}
                                        onChange={(e) => updateLocalValue(item.id, 'estimated', e.target.value)}
                                        onBlur={(e) => commitValue(item.id, 'estimated', parseFloat(e.target.value))}
                                        className="bg-transparent pl-5 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all font-medium"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="relative flex items-center max-w-[120px]">
                                    <span className="absolute left-2 text-muted-foreground">€</span>
                                    <input 
                                        type="number"
                                        value={item.actual || ""}
                                        onChange={(e) => updateLocalValue(item.id, 'actual', e.target.value)}
                                        onBlur={(e) => commitValue(item.id, 'actual', parseFloat(e.target.value))}
                                        className="bg-transparent pl-5 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all font-bold"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    {savingId?.startsWith(item.id) && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 text-red-500 rounded-sharp hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic opacity-50">No items in this category.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Monthly Budget</h1>
          <p className="text-muted-foreground text-sm mt-1">Strategic financial planning for {selectedMonth.name}.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="bg-muted text-foreground border border-border px-5 py-2.5 text-xs font-bold rounded-sharp inline-flex items-center gap-2 hover:bg-muted/80 transition-colors disabled:opacity-50 shadow-sm"
           >
             <Database className="w-4 h-4" />
             {isSyncing ? "SYNCING..." : "SYNC FROM EXCEL"}
           </button>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar scroll-smooth">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-5 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
              selectedMonth.key === m.key 
                ? "border-accent text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3">
              <BudgetTable title="Regular Expenses" items={expenses} icon={ReceiptIcon} group="EXP" />
              <BudgetTable title="Monthly Subscriptions" items={subs} icon={CreditCard} group="SUB" />
              <BudgetTable title="Long-term Savings" items={savings} icon={PiggyBank} group="SAV" />
          </div>

          <aside className="space-y-8">
              <div className="card-normal p-8 flex flex-col gap-6 bg-accent border-accent text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                  
                  <div className="pb-6 border-b border-white/10 space-y-1 relative z-10">
                      <p className="text-[10px] uppercase font-black opacity-60 tracking-wider">Remaining Balance</p>
                      <h2 className="text-4xl font-extrabold tracking-tighter">€{(totalIncome - totalExpAct).toFixed(2)}</h2>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between text-xs font-medium">
                          <span className="opacity-70">Monthly Income</span>
                          <span className="font-bold">€{totalIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                          <span className="opacity-70">Total Expenses</span>
                          <span className="font-bold">€{totalExpAct.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium py-3 border-t border-white/10 mt-2">
                          <span className="opacity-70 text-[10px] uppercase font-bold tracking-widest">Expected Balance</span>
                          <span className="font-bold opacity-100 italic">€{(totalIncome - totalExpEst).toFixed(2)}</span>
                      </div>
                  </div>
              </div>

              <div className="card-normal p-6 border-muted bg-muted/5 space-y-5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allocation Overview</h3>
                  <div className="space-y-4">
                      <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                              <span>SUBSCRIPTIONS</span>
                              <span>€{subs.reduce((a, b) => a + (b.actual || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (subs.reduce((a, b) => a + (b.actual || 0), 0) / (totalExpAct || 1)) * 100)}%` }}
                              ></div>
                          </div>
                      </div>
                      <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                              <span>SAVINGS</span>
                              <span>€{savings.reduce((a, b) => a + (b.actual || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (savings.reduce((a, b) => a + (b.actual || 0), 0) / (totalExpAct || 1)) * 100)}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
              </div>
          </aside>
        </div>
      )}
    </div>
  );
}
