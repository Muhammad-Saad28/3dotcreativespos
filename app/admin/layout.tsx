"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { 
  Bell, 
  Menu as MenuIcon, 
  X,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPOSNotifications, POSNotification } from "@/lib/pos-data";
import { GlassySidebar } from "@/components/glassy-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<POSNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    getPOSNotifications().then(setNotifications);
  }, []);

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0E100C] text-[#D8C3A5]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#B98245] border-t-transparent" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative min-h-screen bg-[#0E100C] text-[#F4EBDD] flex font-sans overflow-x-hidden selection:bg-[#B98245]/30 selection:text-white">
      {/* 
        Refractive Organic Backlight Mesh - 3dotcreatives Studio Palette:
        60% Warm Cream highlights, 30% Olive Green diffusion, 10% Rusty Gold focus points over Midnight Black
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Rusty Gold Highlight Orb */}
        <div className="absolute -top-24 -left-20 w-[640px] h-[640px] bg-gradient-to-br from-[#B98245]/20 via-[#59613B]/15 to-transparent rounded-full blur-[130px]" />
        
        {/* Olive Green Mid Ground Glow */}
        <div className="absolute top-1/3 left-10 w-[550px] h-[550px] bg-gradient-to-tr from-[#59613B]/25 via-[#303522]/30 to-transparent rounded-full blur-[140px]" />

        {/* Soft Warm Cream Refraction */}
        <div className="absolute -bottom-32 left-1/4 w-[750px] h-[600px] bg-gradient-to-t from-[#B98245]/12 via-[#59613B]/10 to-transparent rounded-full blur-[150px]" />
        
        {/* Subtle Midnight Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0E100C]/40 to-[#0E100C]/90" />
      </div>

      {/* Floating Modern Frosted Glassy Sidebar */}
      <GlassySidebar
        user={user}
        signOut={signOut}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="shrink-0 h-16 mx-3 mt-3 px-4 sm:px-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between sticky top-3 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#D8C3A5] hover:text-white rounded-xl bg-white/[0.06] border border-white/10"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-serif italic text-[#59613B] tracking-wide">3dotcreatives /</span>
              <h2 className="text-base font-serif font-bold text-[#F4EBDD] capitalize tracking-wide">
                {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Realtime Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#D8C3A5] hover:text-[#F4EBDD] rounded-xl hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#B98245] ring-2 ring-[#0E100C] animate-ping" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#171A14]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-serif font-bold text-[#F4EBDD]">Studio Notifications</span>
                    <span className="text-[10px] font-mono font-semibold bg-[#B98245]/20 text-[#B98245] px-2 py-0.5 rounded-full border border-[#B98245]/30">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                        <p className="font-medium text-[#F4EBDD]">{n.message}</p>
                        <p className="text-[10px] font-mono text-[#D8C3A5]">{new Date(n.created_at).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cashier/pos")}
              className="text-xs border-[#B98245]/30 bg-[#B98245]/10 text-[#F4EBDD] hover:bg-[#B98245]/20 hover:text-white rounded-xl shadow-xs transition-all cursor-pointer font-sans"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5 text-[#B98245]" />
              Express POS
            </Button>
          </div>
        </header>

        {/* Sub-page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto relative z-0">{children}</main>
      </div>
    </div>
  );
}
