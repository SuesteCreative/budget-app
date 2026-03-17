
"use client";

import { useState } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye,
  FileDown,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockReceipts = [
  { id: 1, name: "NOS March 2026", date: "2026-03-12", amount: "€44.90", status: "extracted", type: "Utility" },
  { id: 2, name: "Continente (Physical)", date: "2026-03-10", amount: "€125.40", status: "extracted", type: "Food" },
  { id: 3, name: "Galp Gas", date: "2026-03-08", amount: "€62.10", status: "pending", type: "Utility" },
];

export default function ReceiptsPage() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Receipts & Invoices</h1>
          <p className="text-muted-foreground text-sm">Upload your paper receipts or digital PDF invoices for auto-extraction.</p>
        </div>
        
        <button className="bg-accent text-white px-4 py-2 text-xs font-semibold rounded-sharp border border-accent hover:opacity-90 transition-opacity flex items-center gap-2">
           <Upload className="w-4 h-4" />
           Instant OCR
        </button>
      </header>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "card-normal p-12 border-dashed border-2 flex flex-col items-center justify-center gap-4 transition-all bg-muted/20 hover:bg-muted/40",
          isDragging ? "border-accent bg-accent/5" : "border-border"
        )}
      >
         <div className="w-12 h-12 bg-muted/50 rounded-sharp flex items-center justify-center border border-border">
           <Upload className="w-6 h-6 text-muted-foreground" />
         </div>
         <div className="text-center">
            <p className="text-sm font-semibold">Drop invoices here or click to upload</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">PDF, JPEG or PNG (Max 10MB)</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="card-normal overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
             <h3 className="text-sm font-semibold">Processing Queue</h3>
             <span className="text-[10px] text-muted-foreground uppercase font-bold">3 Recent Files</span>
          </div>
          
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest">Document Name</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest">Extracted Amount</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockReceipts.map((file) => (
                <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-muted/50 rounded-sharp flex items-center justify-center border border-border">
                          <FileText className="w-4 h-4 opacity-70" />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-medium">{file.name}</span>
                          <div className={cn(
                            "flex items-center gap-1.5 text-[8px] font-bold uppercase",
                            file.status === "extracted" ? "text-accent" : "text-amber-500"
                          )}>
                             {file.status === "extracted" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                             {file.status}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{file.date}</td>
                  <td className="px-6 py-4 font-semibold">{file.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 border border-border rounded-sharp bg-muted/50 text-[10px] font-medium">
                      {file.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-muted rounded-sharp border border-transparent hover:border-border transition-all">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                       </button>
                       <button className="p-2 hover:bg-muted rounded-sharp border border-transparent hover:border-border transition-all">
                          <FileDown className="w-4 h-4 text-muted-foreground" />
                       </button>
                       <button className="p-2 hover:bg-red-500/10 rounded-sharp border border-transparent hover:border-red-500/20 transition-all group">
                          <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-normal p-6 flex flex-col gap-4">
           <h3 className="text-sm font-semibold tracking-tight">OCR Statistics</h3>
           <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                 <span className="text-3xl font-bold tracking-tighter">98.2%</span>
                 <span className="text-[10px] text-muted-foreground uppercase font-bold">Extraction Accuracy</span>
              </div>
              <div className="w-24 h-12 flex items-end gap-1">
                 {[40, 60, 45, 90, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-accent/20 border-t border-accent" style={{ height: `${h}%` }} />
                 ))}
              </div>
           </div>
        </div>

        <div className="card-normal p-6 flex flex-col gap-4">
           <h3 className="text-sm font-semibold tracking-tight">Connected Accounts</h3>
           <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-sharp bg-muted/20">
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-xs font-medium">Gmail (Continente)</span>
                 </div>
                 <span className="text-[10px] text-accent font-bold uppercase cursor-pointer hover:underline">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-sharp grayscale opacity-60">
                 <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium">Apple (Subscriptions)</span>
                 </div>
                 <span className="text-[10px] text-muted-foreground font-bold uppercase cursor-pointer">Connect</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
