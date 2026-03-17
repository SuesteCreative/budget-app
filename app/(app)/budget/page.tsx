
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2, CheckCircle2, TrendingUp, TrendingDown, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, addTransaction } from "@/app/actions/budget";
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

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await importExcelData();
      if (res.success) {
        alert("Excel data synchronised!");
        fetchBudget();
      } else {
        alert("Sync failed: " + res.error);
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

  const handleLogPayment = async (category: any) => {
    const amountStr = prompt(`Logging payment for ${category.name}. Amount:`, category.estimated.toString());
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;

    try {
      await addTransaction({
        category_id: category.id,
        amount: amount,
        description: `Payment: ${category.name}`,
        date: new Date().toISOString().split('T')[0]
      });
      fetchBudget(); // Refresh
    } catch (e) {
      alert("Error logging payment");
    }
  };

  const totalEstimateIncome = data.income.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActualIncome = data.income.reduce((acc, curr) => acc + curr.actual, 0);
  
  const totalEstimateExpense = data.expenses.reduce((acc, curr) => acc + curr.estimated, 0);
  const totalActualExpense = data.expenses.reduce((acc, curr) => acc + curr.actual, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Budget</h1>
          <p className="text-muted-foreground text-sm">Managing your cash flow for {selectedMonth.name}.</p>
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
          {(data.income.length === 0 && data.expenses.length === 0) && (
            <div className="card-normal p-8 bg-accent/5 border-accent/20 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-widest">No Budget Data Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  We found your Excel data in the core, but it hasn't been synced to your account yet.
                </p>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-accent text-white px-8 py-3 text-xs font-bold rounded-sharp hover:opacity-90 transition-all flex items-center gap-2"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {isSyncing ? "SYNCING..." : "SYNC EXCEL DATA NOW"}
              </button>
            </div>
          )}

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

          <div className="card-normal">
            <div className="border-b border-border p-4 flex items-center justify-between bg-muted/10">
               <h3 className="text-sm font-semibold">{activeTab} Tracking</h3>
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                 <input 
                  type="text" 
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  className="bg-background border border-border text-xs rounded-sharp pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-accent/50"
                 />
               </div>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Category</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Estimated</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Actual</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Diff</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Status</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-[9px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(activeTab === "Income" ? data.income : data.expenses).map((item) => {
                  const diff = item.estimated - item.actual;
                  const isPaid = item.actual > 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {item.name}
                        {item.name === "NOS" && <span className="bg-accent/10 text-accent text-[8px] font-bold px-1.5 py-0.5 rounded-sharp uppercase">Carrier</span>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">€{(item.estimated || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold">€{(item.actual || 0).toFixed(2)}</td>
                      <td className={cn(
                        "px-6 py-4 font-medium",
                        item.type === 'income' 
                          ? ((item.actual || 0) >= (item.estimated || 0) ? "text-accent" : "text-red-500")
                          : ((item.actual || 0) <= (item.estimated || 0) ? "text-accent" : "text-red-500")
                      )}>
                        {item.type === 'income' 
                          ? ((item.actual || 0) - (item.estimated || 0)).toFixed(2)
                          : ((item.estimated || 0) - (item.actual || 0)).toFixed(2)
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-sharp text-[10px] font-bold inline-flex items-center gap-1.5",
                          isPaid ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                        )}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : null}
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleLogPayment(item)}
                          className="text-[10px] font-bold uppercase text-accent hover:underline"
                        >
                          Log Entry
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
