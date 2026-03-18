
"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Loader2, Database, Trash2, CreditCard, PiggyBank, Receipt as ReceiptIcon, Wallet, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetData, updateActualAmount, createCategory, deleteCategory } from "@/app/actions/budget";
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

interface BudgetItem {
    id: string;
    name: string;
    actual: number;
    estimated: number;
    month: string;
}

export default function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(months[1]); // FEB 2025
  const [data, setData] = useState<{income: BudgetItem[], expenses: BudgetItem[], debugUserId?: string}>({ income: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addingToGroup, setAddingToGroup] = useState<'EXP' | 'SUB' | 'OTH' | null>(null);
  const [newName, setNewName] = useState("");

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
    if (!newName.trim()) {
        setAddingToGroup(null);
        return;
    }
    
    const prefix = group === 'EXP' ? '' : group === 'SUB' ? '[SUB] ' : '[OTH] ';
    try {
        await createCategory({
            name: `${prefix}${newName}`,
            type: 'expense',
            month: selectedMonth.key,
            estimated_amount: 0
        });
        setNewName("");
        setAddingToGroup(null);
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

  const commitValue = async (id: string, value: number) => {
    setSavingId(id);
    try {
      await updateActualAmount(id, value);
    } finally {
      setSavingId(null);
    }
  };

  // Grouping logic
  const categorize = (items: BudgetItem[]) => {
      const res = { expenses: [] as BudgetItem[], subs: [] as BudgetItem[], others: [] as BudgetItem[] };
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

  const BudgetTable = ({ title, items, icon: Icon, group }: { title: string, items: BudgetItem[], icon: any, group: 'EXP' | 'SUB' | 'OTH' }) => {
    
    return (
      <div className="card-normal overflow-hidden mb-12 shadow-2xl border border-white/5 bg-[#0a0a0a] ring-1 ring-white/5">
          <div className="bg-white/[0.02] p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sharp bg-accent/10 flex items-center justify-center border border-accent/20">
                      <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                     <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/90">{title}</h3>
                     <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{items.length} ITENS</p>
                  </div>
              </div>
              {addingToGroup === group ? (
                  <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate(group);
                            if (e.key === 'Escape') setAddingToGroup(null);
                        }}
                        placeholder="Nome do item..."
                        className="bg-white/5 border border-white/10 rounded-sharp px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-white focus:outline-none focus:border-accent w-48"
                      />
                      <button onClick={() => handleCreate(group)} className="p-2 text-accent hover:bg-accent/10 rounded-sharp transition-all">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setAddingToGroup(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sharp transition-all">
                        <X className="w-4 h-4" />
                      </button>
                  </div>
              ) : (
                  <button 
                      onClick={() => { setAddingToGroup(group); setNewName(""); }}
                      className="bg-accent text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sharp hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
              )}
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] min-w-[500px]">
                  <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5">
                          <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Categoria</th>
                          <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Valor</th>
                          <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60">Status</th>
                          <th className="px-8 py-5 font-black uppercase tracking-[0.15em] text-[8px] text-muted-foreground opacity-60 text-right">Saving</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                      {items.map(item => (
                          <Row key={item.id} item={item} onCommit={commitValue} onDelete={handleDelete} isSaving={savingId === item.id} />
                      ))}
                      {items.length === 0 && !addingToGroup && (
                          <tr>
                              <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground/40 italic font-medium uppercase tracking-widest text-[10px]">Sem itens nesta categoria.</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 px-6 md:px-0 bg-transparent text-white antialiased">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-sm">BUDGET</h1>
          <p className="text-muted-foreground text-[10px] mt-1 font-black uppercase tracking-[0.4em] opacity-40">Financial Control Pro {selectedMonth.name}</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="bg-white/5 text-white/60 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-sharp inline-flex items-center gap-3 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
           >
             <Database className="w-3.5 h-3.5 text-accent" />
             {isSyncing ? "A SINCRONIZAR..." : "IMPORTAR DADOS"}
           </button>
        </div>
      </header>

      {/* Month Navigation */}
      <div className="flex gap-1 border-b border-white/5 pb-px overflow-x-auto no-scrollbar scroll-smooth">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={cn(
              "px-6 py-6 text-[9px] font-black uppercase tracking-[0.25em] border-b-2 transition-all whitespace-nowrap",
              selectedMonth.key === m.key 
                ? "border-accent text-white" 
                : "border-transparent text-muted-foreground hover:text-white hover:bg-white/[0.02]"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">A processar dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          <div className="xl:col-span-3 space-y-4">
              <BudgetTable title="Despesas" items={expenses} icon={ReceiptIcon} group="EXP" />
              <BudgetTable title="Subscrições" items={subs} icon={CreditCard} group="SUB" />
              <BudgetTable title="Outras Despesas" items={others} icon={PiggyBank} group="OTH" />
          </div>

          <aside className="space-y-10">
              <div className="card-normal p-12 flex flex-col gap-10 bg-[#111] border border-white/5 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[80px]"></div>
                  
                  <div className="pb-8 border-b border-white/5 space-y-3 relative z-10">
                      <p className="text-[10px] uppercase font-black opacity-40 tracking-[0.3em]">Saldo Atual</p>
                      <h2 className="text-6xl font-black tracking-tighter leading-none text-accent drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                        €{(totalIncome - totalExpAct).toFixed(2)}
                      </h2>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="opacity-40">Rendimentos</span>
                          <span className="text-lg">€{totalIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="opacity-40">Gastos Reais</span>
                          <span className="text-lg text-white">€{totalExpAct.toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex flex-col gap-4 relative z-10">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Status de Liquidez: OK</span>
                      </div>
                  </div>
              </div>

              <div className="card-normal p-8 border-white/5 bg-white/[0.01] space-y-8 shadow-xl">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Allocação do Capital</h3>
                  <div className="space-y-8">
                      <DistributionRow 
                        label="Subscrições" 
                        value={subs.reduce((a, b) => a + (b.actual || 0), 0)} 
                        total={totalExpAct} 
                      />
                      <DistributionRow 
                        label="Extras" 
                        value={others.reduce((a, b) => a + (b.actual || 0), 0)} 
                        total={totalExpAct} 
                      />
                  </div>
              </div>

              <div className="p-8 rounded-sharp bg-accent text-white flex flex-col gap-4 shadow-xl shadow-accent/20">
                  <Wallet className="w-8 h-8 opacity-40" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Dica do Especialista</h4>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80 uppercase tracking-wider">
                    Automatiza o teu futuro. Destina 20% do saldo atual diretamente para ativos antes de gastar em "Extras".
                  </p>
              </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ item, onCommit, onDelete, isSaving }: { item: BudgetItem, onCommit: (id: string, val: number) => void, onDelete: (id: string) => void, isSaving: boolean }) {
    const [localValue, setLocalValue] = useState(item.actual?.toString() || "");
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local value when item updates from outside (e.g., fetch)
    useEffect(() => {
        setLocalValue(item.actual?.toString() || "");
    }, [item.actual]);

    const handleBlur = () => {
        const val = parseFloat(localValue) || 0;
        if (val !== item.actual) {
            onCommit(item.id, val);
        }
    };

    const isPaid = (parseFloat(localValue) || 0) > 0;

    return (
        <tr className="group hover:bg-white/[0.04] transition-all duration-300">
            <td className="px-8 py-5 font-bold text-white/90">{item.name}</td>
            <td className="px-8 py-5">
                <div className="relative flex items-center max-w-[120px]">
                    <span className="absolute left-0 text-muted-foreground opacity-30 font-black text-[12px]">€</span>
                    <input 
                        ref={inputRef}
                        type="number"
                        step="0.01"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.blur()}
                        className={cn(
                            "bg-transparent pl-5 pr-2 py-2 w-full border-b border-transparent focus:border-accent/40 focus:outline-none transition-all font-black text-sm tabular-nums",
                            isPaid ? "text-accent" : "text-white/30"
                        )}
                        placeholder="0.00"
                    />
                </div>
            </td>
            <td className="px-8 py-5">
                <span className={cn(
                    "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                    isPaid ? "bg-accent/10 text-accent border border-accent/20" : "bg-white/5 text-white/20 border border-white/5"
                )}>
                    {isPaid ? "CONCLUÍDO" : "PENDENTE"}
                </span>
            </td>
            <td className="px-8 py-5 text-right relative">
                <div className="flex items-center justify-end gap-6">
                    {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    ) : (
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-700",
                            isPaid ? "bg-accent shadow-[0_0_12px_rgba(var(--accent-rgb),0.6)] scale-110" : "bg-white/5"
                        )}></div>
                    )}
                    <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-white/10 hover:text-red-500 rounded-sharp hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function DistributionRow({ label, value, total }: { label: string, value: number, total: number }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="opacity-40">{label}</span>
                <span className="text-white/90">€{value.toFixed(2)}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                      "h-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]",
                      label === "Subscrições" ? "bg-accent" : "bg-white/40"
                  )} 
                  style={{ width: `${Math.min(100, percentage)}%` }}
                ></div>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 text-right">
                {percentage.toFixed(1)}% do capital
            </div>
        </div>
    );
}
