"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { 
  CreditCard, 
  PlusCircle, 
  Receipt,
  LogOut,
  Banknote,
  Bell,
  Menu as MenuIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingApprovalScreen } from "@/components/pending-approval-screen";
import { ShiftModal } from "@/components/shift-modal";
import { getCurrentShift, POSShift } from "@/lib/pos-data";
import { GlassySidebar } from "@/components/glassy-sidebar";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<POSShift | null>(null);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "cashier" && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getCurrentShift(user.id).then(setCurrentShift);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0E100C] text-[#D8C3A5]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#B98245] border-t-transparent" />
      </div>
    );
  }

  if (user.status === "pending" || user.status === "rejected") {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="relative min-h-screen bg-[#0E100C] text-[#F4EBDD] flex font-sans overflow-x-hidden selection:bg-[#B98245]/30 selection:text-white">
      {/* Refractive Ambient Mesh Glows: 60% Warm Cream, 30% Olive Green, 10% Rusty Gold */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-[640px] h-[640px] bg-gradient-to-br from-[#B98245]/20 via-[#59613B]/15 to-transparent rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-[#59613B]/25 via-[#303522]/30 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/4 w-[750px] h-[600px] bg-gradient-to-t from-[#B98245]/12 via-[#59613B]/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0E100C]/40 to-[#0E100C]/90" />
      </div>

      {/* Persistent Glassy Sidebar on Every Page */}
      <GlassySidebar
        user={user}
        signOut={signOut}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        unreadCount={0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Glass Header Bar */}
        <header className="shrink-0 h-16 mx-3 mt-3 px-4 sm:px-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between sticky top-3 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#D8C3A5] hover:text-white rounded-xl bg-white/[0.06] border border-white/10"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-serif italic text-[#59613B]">Terminal /</span>
              <h2 className="text-base font-serif font-bold text-[#F4EBDD] capitalize tracking-wide">
                {pathname === "/cashier/pos" ? "Front Counter Register (F1)" : pathname.split("/").pop()?.replace(/-/g, " ")}
              </h2>
            </div>
          </div>

          {/* Quick Cash Shift Indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShiftModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold glass-surface-card hover:border-[#B98245] text-[#F4EBDD] transition-all shadow-xs cursor-pointer"
              title="Manage Cash Drawer & Shift (F8)"
            >
              <Banknote className="h-4 w-4 text-[#B98245]" />
              <span className="hidden sm:inline">
                {currentShift ? `Shift #${currentShift.shift_number}` : "Open Shift"}
              </span>
              {currentShift && (
                <span className="font-mono text-[#B98245] font-black ml-1">
                  Rs. {currentShift.summary.expected_cash_in_drawer.toLocaleString()}
                </span>
              )}
            </button>

            {user.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="text-xs border-[#B98245]/30 bg-[#B98245]/10 text-[#F4EBDD] hover:bg-[#B98245]/20 hover:text-white rounded-xl shadow-xs"
              >
                Admin Suite
              </Button>
            )}
          </div>
        </header>

        {/* Sub-page Content */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto relative z-0">{children}</main>
      </div>

      {/* Shift Drawer Modal */}
      <ShiftModal
        isOpen={shiftModalOpen}
        onClose={() => {
          setShiftModalOpen(false);
          if (user) getCurrentShift(user.id).then(setCurrentShift);
        }}
        currentUser={{ id: user.id, name: user.name }}
        onShiftChange={setCurrentShift}
      />
    </div>
  );
}
