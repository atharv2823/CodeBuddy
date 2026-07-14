import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { UserAvatar } from "@/components/dashboard/user-avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <UserAvatar />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
