
"use client";

import { BarChart3, TrendingUp, Wallet, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const yearStats = [
  { month: "Jan", budget: 1800, actual: 1750 },
  { month: "Feb", budget: 1800, actual: 1820 },
  { month: "Mar", budget: 1800, actual: 1200 },
];

export default function StatsPage() {
  const maxVal = Math.max(...yearStats.map(s => Math.max(s.budget, s.actual)));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stats & Analytics</h1>
          <p className="text-muted-foreground text-sm">Visualizing your financial performance across the year.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Saving Rate", value: "24%", icon: Wallet, trend: "+2.1%" },
          { label: "Food Ratio", value: "18%", icon: ShoppingCart, trend: "-0.5%" },
          { label: "Total Saved", value: "€3,450", icon: TrendingUp, trend: "Growth" },
          { label: "Monthly Avg", value: "€1,820", icon: BarChart3, trend: "Stable" },
        ].map((stat, i) => (
          <div key={i} className="card-normal p-6 flex flex-col gap-1">
             <div className="flex items-center justify-between mb-2">
               <stat.icon className="w-4 h-4 text-accent" />
               <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded-sharp">{stat.trend}</span>
             </div>
             <span className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</span>
             <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-normal p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Budget vs Actual</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <div className="w-2 h-2 bg-muted rounded-full" /> Budget
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent uppercase">
                <div className="w-2 h-2 bg-accent rounded-full" /> Actual
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between h-48 gap-4 px-2">
            {yearStats.map((stat) => (
              <div key={stat.month} className="flex-1 flex flex-col gap-4 items-center">
                 <div className="w-full flex justify-center gap-2 items-end h-full">
                    <div 
                      className="w-4 bg-muted border border-border transition-all duration-700" 
                      style={{ height: `${(stat.budget / maxVal) * 100}%` }}
                    />
                    <div 
                      className="w-4 bg-accent transition-all duration-700" 
                      style={{ height: `${(stat.actual / maxVal) * 100}%` }}
                    />
                 </div>
                 <span className="text-[10px] font-bold uppercase text-muted-foreground">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-normal p-6">
          <h3 className="text-sm font-semibold tracking-tight mb-6">Financial Health</h3>
          <div className="space-y-6">
             {[
               { name: "Emergency Fund", target: 5000, current: 3200, color: "bg-accent" },
               { name: "Investment Portfolio", target: 10000, current: 4500, color: "bg-blue-500" },
               { name: "Travel Fund", target: 2000, current: 1800, color: "bg-orange-500" },
             ].map((goal) => (
               <div key={goal.name} className="space-y-2">
                 <div className="flex justify-between text-xs font-semibold">
                   <span>{goal.name}</span>
                   <span className="text-muted-foreground">€{goal.current} / €{goal.target}</span>
                 </div>
                 <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border">
                    <div 
                      className={cn("h-full transition-all duration-1000", goal.color)} 
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
