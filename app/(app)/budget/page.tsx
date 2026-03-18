
"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, CheckCircle2, TrendingUp, TrendingDown, Database, Trash2, CreditCard, PiggyBank, Receipt as ReceiptIcon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, updateCategoryAmount, updateActualAmount, createCategory, deleteCategory } from "@/app/actions/budget";
import { importExcelData } from "@/app/actions/import-excel";

const months = [
  { name: "Janeiro", key: "2025-01" },
  { name: "Fevereiro", key: "2025-02" },
  { name: "Março", key: "2025-03" },
  { name: "Abril", key: "2025-04" },
  { name: "Maio", key: "2025-05" },
  { name: "Junho", key: "2025-06" },
  { name: "Julho", key: "2025-07" },
  { name: "Agosto", key: "2025-08" },
  { name: "Setembro", key: "2025-09" },
  { name: "Outubro", key: "2025-10" },
  { name: "Novembro", key: "2025-11" },
  { name: "Dezembro", key: "2025-12" }
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

  const handleCreate = async (group: 'EXP' | 'SUB' | 'OTH') => {
    const label = group === 'SUB' ? 'Subscrição' : group === 'OTH' ? 'Outra Despesa' : 'Despesa';
    const name = prompt(`Nome da ${label}:`);
    if (!name) return;
    
    // We'll use prefixes internally to group them
    const prefix = group === 'EXP' ? '' : group === 'SUB' ? '[SUB] ' : '[OTH] ';
    try {
        await createCategory({
            name: `${prefix}${name}`,
            type: 'expense',
            month: selectedMonth.key,
            estimated_amount: 0
        });
        fetchBudget();
    } catch (e) {
        alert("Erro ao criar categoria");
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Tens a certeza que queres apagar?")) return;
      try {
          await deleteCategory(id);
          fetchBudget();
      } catch (e) {
          alert("Erro ao apagar");
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
      const res = { expenses: [] as any[], subs: [] as any[], others: [] as any[] };
      items.forEach(item => {
          if (item.name.startsWith('[SUB]')) {
              res.subs.push({ ...item, name: item.name.replace('[SUB] ', '') });
          } else if (item.name.startsWith('[OTH]')) {
              res.others.push({ ...item, name: item.name.replace('[OTH] ', '') });
          } else {
              res.expenses.push(item);
          }
      });
      return res;
  };

  const { expenses, subs, others } = categorize(data.expenses);
  const totalIncome = data.income.reduce((a, b) => a + (b.actual || 0), 0);
  const totalExpAct = data.expenses.reduce((a, b) => a + (b.actual || 0), 0);
  const totalExpEst = data.expenses.reduce((a, b) => a + (b.estimated || 0), 0);

  const BudgetTable = ({ title, items, icon: Icon, group }: { title: string, items: any[], icon: any, group: 'EXP' | 'SUB' | 'OTH' }) => (
    <div className="card-normal overflow-hidden mb-12 shadow-2xl border border-border/10 bg-black/40 backdrop-blur-sm">
        <div className="bg-white/5 p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sharp bg-accent/20 flex items-center justify-center border border-accent/20">
                    <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                   <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/90">{title}</h3>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{items.length} ITENS</p>
                </div>
            </div>
            <button 
                onClick={() => handleCreate(group)}
                className="bg-accent text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sharp hover:opacity-80 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
            >
                <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] min-w-[700px]">
                <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Categoria</th>
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Estimado</th>
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Real</th>
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Diff</th>
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Status</th>
                        <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60 text-right">Saving</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {items.map(item => {
                        const diff = (item.estimated || 0) - (item.actual || 0);
                        const isOver = item.actual > item.estimated && item.estimated > 0;
                        const isPaid = item.actual > 0;
                        
                        return (
                            <tr key={item.id} className="group hover:bg-white/[0.03] transition-colors relative">
                                <td className="px-8 py-4 font-bold text-white/80">{item.name}</td>
                                <td className="px-8 py-4">
                                    <div className="relative flex items-center max-w-[100px]">
                                        <span className="absolute left-0 text-muted-foreground opacity-50 text-[10px]">€</span>
                                        <input 
                                            type="number"
                                            value={item.estimated || ""}
                                            onChange={(e) => updateLocalValue(item.id, 'estimated', e.target.value)}
                                            onBlur={(e) => commitValue(item.id, 'estimated', parseFloat(e.target.value))}
                                            className="bg-transparent pl-4 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all font-semibold"
                                        />
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="relative flex items-center max-w-[100px]">
                                        <span className="absolute left-0 text-muted-foreground opacity-50 text-[10px]">€</span>
                                        <input 
                                            type="number"
                                            value={item.actual || ""}
                                            onChange={(e) => updateLocalValue(item.id, 'actual', e.target.value)}
                                            onBlur={(e) => commitValue(item.id, 'actual', parseFloat(e.target.value))}
                                            className={cn(
                                                "bg-transparent pl-4 pr-2 py-2 w-full border-b border-transparent focus:border-accent focus:outline-none transition-all font-black",
                                                isOver ? "text-red-400" : "text-accent"
                                            )}
                                        />
                                    </div>
                                </td>
                                <td className={cn(
                                    "px-8 py-4 font-bold tabular-nums text-[10px]",
                                    diff >= 0 ? "text-accent/60" : "text-red-400/60"
                                )}>
                                    {diff.toFixed(2)}
                                </td>
                                <td className="px-8 py-4 uppercase font-black text-[8px] tracking-[0.1em]">
                                    <span className={cn(
                                        "px-2 py-1 rounded-sharp",
                                        isPaid ? "bg-accent/10 text-accent" : "bg-white/5 text-muted-foreground opacity-40"
                                    )}>
                                        {isPaid ? "PAGO" : "ORÇAMENTADO"}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right relative">
                                    <div className="flex items-center justify-end gap-4">
                                        {savingId?.startsWith(item.id) ? (
                                            <Loader2 className="w-3 h-3 animate-spin text-accent" />
                                        ) : (
                                            <div className={cn(
                                                "w-2.5 h-2.5 rounded-full transition-all",
                                                isPaid ? "bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" : "bg-white/10"
                                            )}></div>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground/40 italic font-medium uppercase tracking-widest text-[10px]">Sem itens nesta categoria.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 px-6 md:px-0">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">ORÇAMENTO MENSAL</h1>
          <p className="text-muted-foreground text-sm mt-1 font-bold uppercase tracking-[0.1em] opacity-60">Planeamento detalhado para {selectedMonth.name}</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="bg-white/5 text-white/80 border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-sharp inline-flex items-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50"
           >
             <Database className="w-4 h-4 text-accent" />
             {isSyncing ? "A SINCRONIZAR..." : "SINCRONIZAR EXCEL"}
           </button>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar scroll-smooth">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap",
              selectedMonth.key === m.key 
                ? "border-accent text-white" 
                : "border-transparent text-muted-foreground hover:text-white"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8 text-muted-foreground">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">A processar dados financeiros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          <div className="xl:col-span-3">
              <BudgetTable title="Despesas" items={expenses} icon={ReceiptIcon} group="EXP" />
              <BudgetTable title="Subscrições" items={subs} icon={CreditCard} group="SUB" />
              <BudgetTable title="Outras Despesas" items={others} icon={PiggyBank} group="OTH" />
          </div>

          <aside className="space-y-10">
              <div className="card-normal p-10 flex flex-col gap-8 bg-accent border-accent text-white shadow-[0_20px_50px_rgba(var(--accent-rgb),0.3)] relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                  
                  <div className="pb-8 border-b border-white/10 space-y-2 relative z-10">
                      <p className="text-[11px] uppercase font-black opacity-60 tracking-widest">Saldo disponível</p>
                      <h2 className="text-5xl font-black tracking-tighter leading-none">€{(totalIncome - totalExpAct).toFixed(2)}</h2>
                  </div>
                  
                  <div className="space-y-5 relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="opacity-60">Rendimentos</span>
                          <span className="text-lg">€{totalIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="opacity-60">Despesas Totais</span>
                          <span className="text-lg">€{totalExpAct.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] py-5 border-t border-white/10 mt-4">
                          <span className="opacity-60">Saldo Esperado</span>
                          <span className="italic opacity-90">€{(totalIncome - totalExpEst).toFixed(2)}</span>
                      </div>
                  </div>
              </div>

              <div className="card-normal p-8 border-white/5 bg-white/[0.02] space-y-6 shadow-xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Distribuição</h3>
                  <div className="space-y-6">
                      <div className="space-y-2.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span>Subscrições</span>
                              <span className="text-white/80">€{subs.reduce((a, b) => a + (b.actual || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" 
                                style={{ width: `${Math.min(100, (subs.reduce((a, b) => a + (b.actual || 0), 0) / (totalExpAct || 1)) * 100)}%` }}
                              ></div>
                          </div>
                      </div>
                      <div className="space-y-2.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span>Outras</span>
                              <span className="text-white/80">€{others.reduce((a, b) => a + (b.actual || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white/20 transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (others.reduce((a, b) => a + (b.actual || 0), 0) / (totalExpAct || 1)) * 100)}%` }}
                              ></div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col gap-4 p-8 rounded-sharp bg-white/[0.01] border border-white/5 items-center text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                      <Wallet className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Dica de Gestão</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wider opacity-60">
                    Mantenha as suas subscrições sob controlo. Pequenos valores mensais podem somar-se a grandes quantias anuais.
                  </p>
              </div>
          </aside>
        </div>
      )}
    </div>
  );
}
