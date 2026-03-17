
"use client";

import { ShoppingBag, TrendingUp, Calendar, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock food data
const initialFoodStats = {
  totalSpent: 425.80,
  itemsCount: 142,
  prediction: 120.50, // for the rest of the month
  recentPurchases: [
    { name: "Pão de Forma Integral", category: "Padaria", price: 1.25, supermarket: "Continente", date: "2026-03-15" },
    { name: "Peito de Frango (bulk)", category: "Talho", price: 12.40, supermarket: "Continente", date: "2026-03-15" },
    { name: "Detergente Máquina Loiça", category: "Limpeza", price: 8.50, supermarket: "Continente", date: "2026-03-15" },
    { name: "Iogurte Grego (4un)", category: "Lacticínios", price: 2.30, supermarket: "Continente", date: "2026-03-15" },
    { name: "Maçãs Gala (1.5kg)", category: "Frutas", price: 3.15, supermarket: "Continente", date: "2026-03-12" },
  ],
  topCategories: [
    { name: "Lacticínios", percentage: 25, spent: 106.45 },
    { name: "Talho", percentage: 22, spent: 93.67 },
    { name: "Frutas/Vegetais", percentage: 18, spent: 76.64 },
    { name: "Padaria", percentage: 15, spent: 63.87 },
    { name: "Higiene/Limpeza", percentage: 20, spent: 85.16 },
  ]
};

export default function FoodPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Food Expenses</h1>
          <p className="text-muted-foreground text-sm">Tracking products and spending from Continente emails.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="bg-muted text-foreground border border-border px-4 py-2 text-xs font-semibold rounded-sharp inline-flex items-center gap-2 hover:bg-muted/80 transition-colors">
             <Inbox className="w-4 h-4" />
             Fetch Emails
           </button>
           <button className="bg-accent text-white px-4 py-2 text-xs font-semibold rounded-sharp border border-accent hover:opacity-90 transition-opacity flex items-center gap-2">
             Analytics
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-normal p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Spent (Year)</span>
            <ShoppingBag className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">€{initialFoodStats.totalSpent.toFixed(2)}</span>
          <p className="text-[10px] text-muted-foreground mt-2">{initialFoodStats.itemsCount} total products purchased</p>
        </div>
        
        <div className="card-normal p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">This Month</span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">€154.20</span>
          <p className="text-[10px] text-muted-foreground mt-2">March 01 — March 17</p>
        </div>

        <div className="card-normal p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Spending Prediction</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">€{initialFoodStats.prediction.toFixed(2)}</span>
          <p className="text-[10px] text-muted-foreground mt-2">Projected for rest of month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-normal">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Category Breakdown</h3>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Top 5</span>
          </div>
          <div className="p-6 space-y-5">
            {initialFoodStats.topCategories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">€{cat.spent.toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000" 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-normal">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Products</h3>
            <button className="text-[10px] text-accent font-bold uppercase hover:underline">View All</button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-3 font-semibold text-muted-foreground">Product</th>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Price</th>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialFoodStats.recentPurchases.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-semibold">€{item.price.toFixed(2)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
