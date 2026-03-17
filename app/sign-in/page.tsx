
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: "bg-accent hover:bg-accent/90 text-sm normal-case",
          card: "bg-muted/50 border border-border shadow-none rounded-sharp",
        }
      }} />
    </div>
  );
}
