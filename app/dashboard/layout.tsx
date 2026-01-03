import { DashboardNav } from "@/components/layout/DashboardNav";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto py-8 px-4 md:px-8">{children}</main>
      <Toaster />
    </div>
  );
}
