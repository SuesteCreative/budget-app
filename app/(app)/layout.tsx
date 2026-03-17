
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pl-[260px] bg-background">
        <div className="max-w-screen-xl mx-auto px-10 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
