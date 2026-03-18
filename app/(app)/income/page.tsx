
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2, CheckCircle2, TrendingUp, TrendingDown, Database, Save, Trash2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, createCategory, deleteCategory, updateCategoryAmount, updateActualAmount } from "@/app/actions/budget";

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

export default function IncomePage() {
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [data, setData] = useState<{income: any[]}>({ income: [] });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await getBudgetData(selectedMonth.key);
      setData({ income: res.income || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [selectedMonth]);

  const handleAddRow = async () => {
    const name = prompt("Income Source (e.g., Salary, Freelance):");
    if (!name) return;
    
    setIsAdding(true);
    try {
        await createCategory({
            name,
            type: 'income',
            month: selectedMonth.key,
            estimated_amount: 0
        });
        fetchIncome();
    } catch (e) {
        alert("Error adding income");
    } finally {
        setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
        await deleteCategory(id);
        fetchIncome();
    } catch (e) {
        alert("Error deleting");
    }
  };

  const updateLocalValue = (id: string, field: 'estimated' | 'actual', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prev => {
      const newData = { ...prev };
      const index = newData.income.findIndex(item => item.id === id);
      if (index !== -1) {
        newData.income[index] = { ...newData.income[index], [field]: numericValue };
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
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const totalEstimate = data.income.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActual = data.income.reduce((acc, curr) => acc + curr.actual, 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income Sources</h1>
          <p className="text-muted-foreground text-sm">Track your salaries, freelance work and passive income.</p>
        </div>
        
        <button 
            onClick={handleAddRow}
            disabled={isAdding}
            className="bg-accent text-white px-6 py-2.5 text-xs font-bold rounded-sharp border border-accent hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            ADD INCOME SOURCE
        </button>
      </header>

      {/* Month Selector */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar scroll-smooth">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap",
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
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-[10px] uppercase font-bold tracking-widest">Gathering financials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <div className="card-normal overflow-hidden overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs min-w-[600px]">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Source</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Projected</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Received</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.income.map((item) => (
                                <tr key={item.id} className="group hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-2 text-muted-foreground">€</span>
                                            <input 
                                                type="number"
                                                value={item.estimated || ""}
                                                onChange={(e) => updateLocalValue(item.id, 'estimated', e.target.value)}
                                                onBlur={(e) => commitValue(item.id, 'estimated', parseFloat(e.target.value))}
                                                className="bg-transparent pl-5 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-2 text-accent">€</span>
                                            <input 
                                                type="number"
                                                value={item.actual || ""}
                                                onChange={(e) => updateLocalValue(item.id, 'actual', e.target.value)}
                                                onBlur={(e) => commitValue(item.id, 'actual', parseFloat(e.target.value))}
                                                className="bg-transparent pl-5 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all font-bold text-accent"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {savingId?.startsWith(item.id) && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500 hover:text-red-600 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted/40 font-bold border-t border-border">
                            <tr>
                                <td className="px-6 py-4 uppercase text-[9px]">Total Income</td>
                                <td className="px-6 py-4">€{totalEstimate.toFixed(2)}</td>
                                <td className="px-6 py-4 text-accent">€{totalActual.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <aside className="space-y-6">
                <div className="card-normal p-6 bg-accent text-white flex flex-col gap-4 shadow-xl">
                    <div className="w-10 h-10 bg-white/20 rounded-sharp flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Total Received</p>
                        <h3 className="text-3xl font-bold tracking-tighter">€{totalActual.toFixed(2)}</h3>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium">
                        <span className="opacity-70">Projected</span>
                        <span>€{totalEstimate.toFixed(2)}</span>
                    </div>
                </div>

                <div className="card-normal p-6 space-y-4 shadow-sm border-muted">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Insight</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Your income is the foundation of your budget. Keep it updated to ensure your net cash flow stays positive.
                    </p>
                </div>
            </aside>
        </div>
      )}
    </div>
  );
}
