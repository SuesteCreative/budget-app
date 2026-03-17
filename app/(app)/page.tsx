
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Database, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { importExcelData } from "@/app/actions/import-excel";
import { getDashboardStats } from "@/app/actions/dashboard";

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await importExcelData();
      if (res.success) {
        alert("Excel data imported successfully!");
        fetchStats();
      }
    } catch (e) {
      console.error(e);
      alert("Error importing data.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
         <Loader2 className="w-10 h-10 animate-spin text-accent" />
         <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Synchronizing financial state</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Overview.</h1>
          <p className="text-muted-foreground">Real-time status of your accounts and budget.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-muted text-foreground border border-border px-4 py-2 text-xs font-semibold rounded-sharp inline-flex items-center gap-2 hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {isSyncing ? "Syncing..." : "Sync from Excel"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Net Balance</span>
             <Activity className="w-4 h-4 text-accent" />
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€{(stats?.balance || 0).toFixed(2)}</span>
             <div className="flex items-center gap-1.5 mt-2 text-accent text-xs font-semibold">
               <ArrowUpRight className="w-3.5 h-3.5" />
               <span>Calculated from active month</span>
             </div>
           </div>
        </div>

        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Spent this month</span>
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€{(stats?.spentMonth || 0).toFixed(2)}</span>
             <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-semibold">
               <ArrowDownRight className="w-3.5 h-3.5" />
               <span>Total expenses logged</span>
             </div>
           </div>
        </div>

        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Total Income</span>
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€{(stats?.incomeMonth || 0).toFixed(2)}</span>
             <div className="flex items-center gap-1.5 mt-2 text-accent text-xs font-semibold">
               <span>March 2026</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
            <div className="card-normal flex flex-col divide-y divide-border">
               {stats?.recent.length > 0 ? stats.recent.map((exp: any, i: number) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{exp.description}</span>
                      <span className="text-[10px] text-muted-foreground">{exp.budget_categories?.name} • {exp.date}</span>
                    </div>
                    <span className={cn(
                      "font-semibold text-sm",
                      exp.budget_categories?.type === 'income' ? "text-accent" : ""
                    )}>
                      €{(exp.amount || 0).toFixed(2)}
                    </span>
                 </div>
               )) : (
                 <div className="p-8 text-center text-xs text-muted-foreground">No recent transactions. Sync or add one in the Budget tab.</div>
               )}
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Action Needed</h3>
            <div className="card-normal p-6 bg-amber-500/5 border-amber-500/20">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-sharp flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-tight">Sync your Data</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your budget is currently using default values. Click the <strong>Sync from Excel</strong> button in the top right to import your categories and estimates from your spreadsheet.
                    </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
