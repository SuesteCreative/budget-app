
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Table, 
  Utensils, 
  BarChart3, 
  Receipt,
  Settings,
  User
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Budget", href: "/budget", icon: Table },
  { name: "Food Expenses", href: "/food", icon: Utensils },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Stats", href: "/stats", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-[260px] bg-background border-r border-border flex flex-col z-50">
      <div className="px-6 py-8 flex items-center gap-2">
        <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-background">B</span>
        </div>
        <h1 className="font-semibold text-sm tracking-tight">BUDGET.CO</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted border border-transparent",
                isActive 
                  ? "text-foreground bg-muted border-border" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border flex items-center gap-3">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-sm",
            }
          }}
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium">My Account</span>
          <span className="text-[10px] text-muted-foreground">Free Plan</span>
        </div>
      </div>
    </div>
  );
}
