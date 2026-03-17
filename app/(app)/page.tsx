
"use client";

import { AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Pedro.</h1>
        <p className="text-muted-foreground">Here is your financial status for March 2026.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Main Balance</span>
             <Activity className="w-4 h-4 text-accent" />
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€4,250.60</span>
             <div className="flex items-center gap-1.5 mt-2 text-accent text-xs font-semibold">
               <ArrowUpRight className="w-3.5 h-3.5" />
               <span>12.5% increase</span>
             </div>
           </div>
        </div>

        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Spent this month</span>
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€1,540.20</span>
             <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-semibold">
               <ArrowDownRight className="w-3.5 h-3.5" />
               <span>Early month spike</span>
             </div>
           </div>
        </div>

        <div className="card-normal p-8 flex flex-col gap-4">
           <div className="flex items-center justify-between text-muted-foreground">
             <span className="text-xs font-bold uppercase tracking-widest">Savings Growth</span>
           </div>
           <div className="flex flex-col">
             <span className="text-4xl font-bold tracking-tighter">€650.00</span>
             <div className="flex items-center gap-1.5 mt-2 text-accent text-xs font-semibold group-hover:translate-x-1 transition-transform cursor-pointer">
               <span>View breakdown</span>
               <ArrowUpRight className="w-3.5 h-3.5" />
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Expenses</h3>
            <div className="card-normal flex flex-col divide-y divide-border">
               {[
                 { name: "Continente", amount: "€125.40", date: "Today", category: "Food" },
                 { name: "NOS", amount: "€44.90", date: "Yesterday", category: "Utility" },
                 { name: "Apple One", amount: "€16.95", date: "Mar 15", category: "Subscription" },
                 { name: "Petrogal", amount: "€60.00", date: "Mar 14", category: "Car" },
               ].map((exp, i) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{exp.name}</span>
                      <span className="text-[10px] text-muted-foreground">{exp.category} • {exp.date}</span>
                    </div>
                    <span className="font-semibold text-sm">{exp.amount}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Upcoming Bills</h3>
            <div className="card-normal p-6 bg-amber-500/5 border-amber-500/20">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-sharp flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-tight">Utility Payment Due</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your electricity bill is estimated to be <strong>€60.00</strong> and will be debited in 4 days. 
                      Ensure you have enough balance.
                    </p>
                    <button className="mt-2 text-[10px] font-bold uppercase text-amber-500 hover:underline inline-flex items-center gap-1">
                      Check Balance <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
