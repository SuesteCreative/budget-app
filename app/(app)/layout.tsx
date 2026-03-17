import { Sidebar } from "@/components/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ALLOWED_EMAIL = "pedrotovarporto@gmail.com";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses.some(e => e.emailAddress === ALLOWED_EMAIL)) {
    redirect("/sign-in");
  }

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
