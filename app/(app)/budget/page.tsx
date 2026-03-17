
"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Mock data based on Excel structure
const initialBudgetData = {
  income: [
    { category: "Employment Income", estimate: 1236.25, actual: 1236.25 },
    { category: "Investments", estimate: 0, actual: 45.20 },
    { category: "Freelance", estimate: 400.0, actual: 350.0 },
    { category: "Part-time", estimate: 586.25, actual: 586.25 },
  ],
  expenses: [
    { category: "Rent/Mortgage", estimate: 650.0, actual: 650.0, date: "2025-01-01" },
    { category: "Groceries", estimate: 300.0, actual: 324.50, date: "2025-01-05" },
    { category: "Electricity", estimate: 60.0, actual: 0, date: "" },
    { category: "Water", estimate: 25.0, actual: 28.10, date: "2025-01-10" },
    { category: "NOS (Internet/TV)", estimate: 45.0, actual: 44.90, date: "2025-01-12", receipt: true },
    { category: "Gym", estimate: 35.0, actual: 35.0, date: "2025-01-02" },
  ]
};

export default function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState("January");

  const totalEstimateIncome = initialBudgetData.income.reduce((acc, curr) => acc + curr.estimate, 0);
  const totalActualIncome = initialBudgetData.income.reduce((acc, curr) => acc + curr.actual, 0);
  
  const totalEstimateExpense = initialBudgetData.expenses.reduce((acc, curr) => acc + curr.estimate, 0);
  const totalActualExpense = initialBudgetData.expenses.reduce((acc, curr) => acc + curr.actual, 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget 2026</h1>
          <p className="text-muted-foreground text-sm">Managing your monthly cash flow.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex border border-border bg-muted/50 rounded-sharp p-1">
             {["Income", "Expenses", "Overview"].map((tab) => (
                <button 
                  key={tab}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-sharp transition-all",
                    tab === "Expenses" ? "bg-background shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
             ))}
           </div>
           <button className="bg-accent text-white px-4 py-2 text-xs font-semibold rounded-sharp border border-accent hover:opacity-90 transition-opacity flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Add Entry
           </button>
        </div>
      </header>

      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={cn(
              "px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap",
              selectedMonth === month 
                ? "border-accent text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-normal p-6 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Income</span>
          <span className="text-2xl font-semibold tracking-tight">€{totalActualIncome.toFixed(2)}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">Estimate: €{totalEstimateIncome.toFixed(2)}</span>
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-sharp",
              totalActualIncome >= totalEstimateIncome ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-500"
            )}>
              {totalActualIncome >= totalEstimateIncome ? "+" : "-"}{Math.abs(((totalActualIncome/totalEstimateIncome - 1) * 100)).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="card-normal p-6 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Total Expenses</span>
          <span className="text-2xl font-semibold tracking-tight">€{totalActualExpense.toFixed(2)}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">Estimate: €{totalEstimateExpense.toFixed(2)}</span>
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-sharp",
              totalActualExpense <= totalEstimateExpense ? "bg-accent/10 text-accent" : "bg-red-500/10 text-red-500"
            )}>
              {totalActualExpense <= totalEstimateExpense ? "-" : "+"}{Math.abs(((totalActualExpense/totalEstimateExpense - 1) * 100)).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="card-normal p-6 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Balance</span>
          <span className="text-2xl font-semibold tracking-tight">€{(totalActualIncome - totalActualExpense).toFixed(2)}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground text-accent">Under budget</span>
          </div>
        </div>
      </div>

      <div className="card-normal">
        <div className="border-b border-border p-4 flex items-center justify-between">
           <h3 className="text-sm font-semibold">Expense Tracking</h3>
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input 
              type="text" 
              placeholder="Search expenses..." 
              className="bg-muted/50 border border-border text-xs rounded-sharp pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-accent/50"
             />
           </div>
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Estimated</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Actual</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Diff</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialBudgetData.expenses.map((expense) => {
              const diff = expense.estimate - expense.actual;
              return (
                <tr key={expense.category} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    {expense.category}
                    {expense.receipt && (
                      <span className="bg-accent/10 text-accent text-[8px] font-bold px-1.5 py-0.5 rounded-sharp">NOS</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{expense.date || "—"}</td>
                  <td className="px-6 py-4">€{expense.estimate.toFixed(2)}</td>
                  <td className="px-6 py-4">€{expense.actual.toFixed(2)}</td>
                  <td className={cn(
                    "px-6 py-4 font-medium",
                    diff < 0 ? "text-red-500" : "text-accent"
                  )}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-sharp text-[10px] font-bold inline-block",
                      expense.actual > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    )}>
                      {expense.actual > 0 ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
