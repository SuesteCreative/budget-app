
import { Sidebar } from "@/components/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ALLOWED_EMAIL = "pedrotovarporto@gmail.com";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {
    console.error("Layout Clerk Error:", e);
    // If Clerk crashes, we should still try to render or redirect safely
  }
  
  if (!user) {
    redirect("/sign-in");
  }

  const hasAccess = user.emailAddresses.some(e => e.emailAddress === ALLOWED_EMAIL);
  
  if (!hasAccess) {
    // If you want to show a 403 instead of redirecting, you can return a div here
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
