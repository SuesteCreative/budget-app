
import { Sidebar } from "@/components/Sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ALLOWED_EMAIL = "pedrotovarporto@gmail.com";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use auth() first as it is faster and more reliable for simple protection
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Double check email for security
  const user = await currentUser();
  const hasAccess = user?.emailAddresses?.some(e => e.emailAddress === ALLOWED_EMAIL);
  
  if (!hasAccess) {
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
