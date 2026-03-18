
"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, Loader2, CheckCircle2, TrendingUp, TrendingDown, Database, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, addTransaction, updateCategoryAmount, updateActualAmount } from "@/app/actions/budget";
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
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [data, setData] = useState<{income: any[], expenses: any[], debugUserId?: string}>({ income: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Expenses");
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await importExcelData();
      if (res.success) {
        alert("Excel data synchronised!");
        fetchBudget();
      } else {
        alert("Sync failed! Possible authentication error. Error code: " + res.error);
        console.error("Sync error detail:", res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Sync failed. Check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await getBudgetData(selectedMonth.key);
      if (res.error) {
        alert("Failed to load budget: " + res.error);
      }
      setData(res);
    } catch (e: any) {
      console.error(e);
      alert("Application error while loading budget.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth]);

  const updateLocalValue = (id: string, field: 'estimated' | 'actual', value: string, type: 'income' | 'expenses') => {
    const numericValue = parseFloat(value) || 0;
    
    setData(prev => {
      const newData = { ...prev };
      const list = type === 'income' ? newData.income : newData.expenses;
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], [field]: numericValue };
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
      console.error("Failed to save changes", e);
    } finally {
      setSavingId(null);
    }
  };

  const totalEstimateIncome = data.income.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActualIncome = data.income.reduce((acc, curr) => acc + curr.actual, 0);
  
  const totalEstimateExpense = data.expenses.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActualExpense = data.expenses.reduce((acc, curr) => acc + curr.actual, 0);

  const items = activeTab === "Income" ? data.income : data.expenses;
  const tabTotalEstimate = items.reduce((acc: number, curr: any) => acc + (curr.estimated || 0), 0);
  const tabTotalActual = items.reduce((acc: number, curr: any) => acc + (curr.actual || 0), 0);

  return (
    <div className="flex flex-col gap-8">

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interactive Budget</h1>
          <p className="text-muted-foreground text-sm">Managing your cash flow for {selectedMonth.name}. Autocalculated real-time.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex border border-border bg-muted/50 rounded-sharp p-1">
             {["Income", "Expenses", "Overview"].map((tab) => (
                <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "px-4 py-1.5 text-xs font-medium rounded-sharp transition-all",
                     tab === activeTab ? "bg-background shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                   )}
                >
                  {tab}
                </button>
             ))}
           </div>
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="bg-muted text-foreground border border-border px-4 py-2 text-xs font-semibold rounded-sharp inline-flex items-center gap-2 hover:bg-muted/80 transition-colors disabled:opacity-50"
           >
             <Database className="w-4 h-4" />
             {isSyncing ? "Syncing..." : "Sync from Excel"}
           </button>
           <button className="bg-accent text-white px-4 py-2 text-xs font-semibold rounded-sharp border border-accent hover:opacity-90 transition-opacity flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Add Category
           </button>
        </div>
      </header>

      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
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
          <p className="text-xs font-medium uppercase tracking-widest">Loading real-time data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-normal p-6 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Income</span>
              <span className="text-2xl font-semibold tracking-tight">€{(totalActualIncome || 0).toFixed(2)}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">Estimate: €{(totalEstimateIncome || 0).toFixed(2)}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-sharp",
                  (totalActualIncome || 0) >= (totalEstimateIncome || 0) ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-500"
                )}>
                  {(totalActualIncome || 0) >= (totalEstimateIncome || 0) ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                  {totalEstimateIncome > 0 ? Math.abs((((totalActualIncome || 0)/(totalEstimateIncome || 1) - 1) * 100)).toFixed(1) : "0"}%
                </span>
              </div>
            </div>
            <div className="card-normal p-6 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Expenses</span>
              <span className="text-2xl font-semibold tracking-tight">€{(totalActualExpense || 0).toFixed(2)}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">Estimate: €{(totalEstimateExpense || 0).toFixed(2)}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-sharp",
                  (totalActualExpense || 0) <= (totalEstimateExpense || 0) ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-500"
                )}>
                  {(totalActualExpense || 0) <= (totalEstimateExpense || 0) ? <TrendingDown className="w-3 h-3 inline mr-1" /> : <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {totalEstimateExpense > 0 ? Math.abs((((totalActualExpense || 0)/(totalEstimateExpense || 1) - 1) * 100)).toFixed(1) : "0"}%
                </span>
              </div>
            </div>
            <div className="card-normal p-6 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Net Cash Flow</span>
              <span className="text-2xl font-semibold tracking-tight text-accent">€{((totalActualIncome || 0) - (totalActualExpense || 0)).toFixed(2)}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">Estimated Balance: €{((totalEstimateIncome || 0) - (totalEstimateExpense || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card-normal overflow-hidden overflow-x-auto">
            <div className="border-b border-border p-4 flex items-center justify-between bg-muted/10">
               <h3 className="text-sm font-semibold">{activeTab} Tracking</h3>
               <div className="text-[10px] text-muted-foreground flex gap-4 uppercase font-bold tracking-widest">
                 <span className="text-accent flex items-center gap-1.5"><Save className="w-3 h-3"/> Click value to edit</span>
                 <span>Autosaves on leave</span>
               </div>
            </div>
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Category</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Estimated</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Actual</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Diff</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Status</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px] text-right">Saving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const isPaid = item.actual > 0;
                  const itemType = activeTab === "Income" ? 'income' : 'expenses';
                  
                  return (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {item.name}
                        {item.name === "NOS" && <span className="bg-accent/10 text-accent text-[8px] font-bold px-1.5 py-0.5 rounded-sharp uppercase">Carrier</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center group/cell">
                          <span className="absolute left-2 text-muted-foreground">€</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={item.estimated || ""}
                            onChange={(e) => updateLocalValue(item.id, 'estimated', e.target.value, itemType)}
                            onBlur={(e) => commitValue(item.id, 'estimated', parseFloat(e.target.value))}
                            className="bg-transparent pl-5 pr-2 py-1.5 w-full rounded border-b border-transparent group-hover/cell:border-muted-foreground/30 focus:border-accent focus:outline-none transition-all font-medium"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex items-center group/cell">
                          <span className="absolute left-2 text-muted-foreground">€</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={item.actual || ""}
                            onChange={(e) => updateLocalValue(item.id, 'actual', e.target.value, itemType)}
                            onBlur={(e) => commitValue(item.id, 'actual', parseFloat(e.target.value))}
                            className="bg-transparent pl-5 pr-2 py-1.5 w-full rounded border-b border-transparent group-hover/cell:border-muted-foreground/30 focus:border-accent focus:outline-none transition-all font-bold"
                          />
                        </div>
                      </td>
                      <td className={cn(
                        "px-6 py-4 font-medium",
                        itemType === 'income' 
                          ? ((item.actual || 0) >= (item.estimated || 0) ? "text-accent" : "text-red-500")
                          : ((item.actual || 0) <= (item.estimated || 0) ? "text-accent" : "text-red-500")
                      )}>
                        {itemType === 'income' 
                          ? ((item.actual || 0) - (item.estimated || 0)).toFixed(2)
                          : ((item.estimated || 0) - (item.actual || 0)).toFixed(2)
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-sharp text-[10px] font-bold inline-flex items-center gap-1.5",
                          isPaid ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground pointer-events-none opacity-50"
                        )}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : null}
                          {isPaid ? "Paid" : "Budgeted"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(savingId?.startsWith(item.id)) ? (
                          <Loader2 className="w-3 h-3 animate-spin inline text-accent" />
                        ) : (
                          <div className="w-3 h-3 bg-muted-foreground/10 rounded-full inline-block group-hover:bg-accent/20 transition-all"></div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/30 font-bold border-t-2 border-border">
                <tr>
                  <td className="px-6 py-4 uppercase tracking-widest text-[9px]">Total {activeTab}</td>
                  <td className="px-6 py-4">€{tabTotalEstimate.toFixed(2)}</td>
                  <td className="px-6 py-4">€{tabTotalActual.toFixed(2)}</td>
                  <td className={cn(
                    "px-6 py-4",
                    activeTab === 'Income' 
                      ? (tabTotalActual >= tabTotalEstimate ? "text-accent" : "text-red-500")
                      : (tabTotalActual <= tabTotalEstimate ? "text-accent" : "text-red-500")
                  )}>
                    {activeTab === 'Income'
                      ? (tabTotalActual - tabTotalEstimate).toFixed(2)
                      : (tabTotalEstimate - tabTotalActual).toFixed(2)
                    }
                  </td>
                  <td colSpan={2} className="px-6 py-4 text-right text-muted-foreground font-normal italic">
                    {activeTab === 'Expenses' && tabTotalActual > tabTotalEstimate ? "Over budget" : ""}
                    {activeTab === 'Income' && tabTotalActual < tabTotalEstimate ? "Below expectation" : ""}
                  </td>
                </tr>
              </tfoot>

            </table>
            {(activeTab === "Income" ? data.income : data.expenses).length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No data for this month. Try syncing from Excel or adding a category.
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="mt-auto pt-12 text-[8px] text-muted-foreground/50 font-mono text-center">
        Account Link: {data?.debugUserId || "Not Linked"}
      </div>
    </div>
  );
}
