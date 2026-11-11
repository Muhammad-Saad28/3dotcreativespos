"use client";

import React, { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Banknote,
  RotateCcw,
  Truck,
  Boxes,
  BookOpen,
  Building2,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sparkles,
  Command,
  Bell,
  Dot,
  CreditCard,
  PlusCircle,
  History
} from "lucide-react";

interface GlassySidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  signOut: () => Promise<void>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  unreadCount?: number;
}

export function GlassySidebar({
  user,
  signOut,
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  unreadCount = 0,
}: GlassySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const isCashier = user.role === "cashier";

  // Cashier Role Dedicated Operational Items (Focused, clean, no admin bloat)
  const cashierNavItems = [
    { name: "Counter POS Register", href: "/cashier/pos", icon: PlusCircle, badge: "F1", badgeColor: "bg-[#B98245]" },
    { name: "Order Desk & Queue", href: "/cashier/dashboard", icon: CreditCard, badge: "LIVE", badgeColor: "bg-[#59613B]" },
    { name: "Settled Bills History", href: "/cashier/history", icon: Receipt, badge: null },
    { name: "Cash Shifts & Drawer", href: "/admin/shifts", icon: Banknote, badge: "F8", badgeColor: "bg-[#8C6030]" },
  ];

  // Admin Role Navigation Hubs (Comprehensive management suite)
  const floorAndService = [
    { name: "Live Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: "LIVE", badgeColor: "bg-[#59613B]" },
    { name: "Counter POS Terminal", href: "/cashier/pos", icon: Receipt, badge: "POS", badgeColor: "bg-[#B98245]" },
    { name: "Dining Floor & Tables", href: "/admin/orders", icon: ShoppingBag, badge: unreadCount > 0 ? String(unreadCount) : null, badgeColor: "bg-[#B98245]" },
    { name: "Cash Shifts & Drawer", href: "/admin/shifts", icon: Banknote, badge: "FLOAT", badgeColor: "bg-[#8C6030]" },
  ];

  const kitchenAndRecipes = [
    { name: "Raw Kitchen Ingredients", href: "/admin/inventory", icon: Boxes, dot: "#10b981" },
    { name: "Recipes & Menu Catalog", href: "/admin/menu", icon: BookOpen, dot: "#B98245" },
  ];

  const foodSupplyAndProcurement = [
    { name: "Food & Kitchen Suppliers", href: "/admin/vendors", icon: Truck, dot: "#f59e0b" },
    { name: "Supply Purchase Bills", href: "/admin/purchases", icon: Truck, dot: "#3b82f6" },
    { name: "Sales Returns & Refunds", href: "/admin/sales-returns", icon: RotateCcw, dot: "#ec4899" },
  ];

  const financeAndReports = [
    { name: "Revenue & Income", href: "/admin/income", icon: TrendingUp },
    { name: "Operating Expenses", href: "/admin/expenses", icon: TrendingDown },
    { name: "Customers & Accounts", href: "/admin/customers", icon: UserCheck },
    { name: "Reports Suite", href: "/admin/reports", icon: BarChart3 },
    { name: "Staff & Role Access", href: "/admin/staff", icon: Users },
    { name: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  // Filter lists for quick search
  const filteredCashier = useMemo(() => {
    if (!searchQuery.trim()) return cashierNavItems;
    const q = searchQuery.toLowerCase();
    return cashierNavItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredFloor = useMemo(() => {
    if (!searchQuery.trim()) return floorAndService;
    const q = searchQuery.toLowerCase();
    return floorAndService.filter((i) => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredKitchen = useMemo(() => {
    if (!searchQuery.trim()) return kitchenAndRecipes;
    const q = searchQuery.toLowerCase();
    return kitchenAndRecipes.filter((i) => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredSupply = useMemo(() => {
    if (!searchQuery.trim()) return foodSupplyAndProcurement;
    const q = searchQuery.toLowerCase();
    return foodSupplyAndProcurement.filter((i) => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredFinance = useMemo(() => {
    if (!searchQuery.trim()) return financeAndReports;
    const q = searchQuery.toLowerCase();
    return financeAndReports.filter((i) => i.name.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating Glass Sidebar Wrapper */}
      <aside
        className={`fixed md:sticky top-0 md:top-3.5 left-0 md:left-3.5 z-50 h-screen md:h-[calc(100vh-1.75rem)] my-0 md:my-3.5 ml-0 md:ml-3.5 shrink-0 flex flex-col transition-all duration-300 ease-spring ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-[82px]" : "w-[285px]"}`}
      >
        {/* Realistic Frosted Glass Toggle Pill Button on outer perimeter */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3.5 top-7 h-7 w-7 rounded-full bg-white/95 text-zinc-900 hover:bg-white hover:scale-110 active:scale-95 items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)] border border-white/60 cursor-pointer transition-all duration-200 z-30"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>

        {/* The Realistic Curved Glass Body */}
        <div className="realistic-glass relative flex-1 flex flex-col rounded-[32px] overflow-hidden text-[#F4EBDD]">
          
          {/* Internal Liquid Lens Highlight / Specular Reflection Gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.12] via-white/[0.03] to-transparent" />
          <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 bg-gradient-to-br from-[#B98245]/20 via-[#59613B]/10 to-transparent rounded-full blur-2xl" />
          
          {/* Header Brand Section */}
          <div className="shrink-0 p-4 pb-3 flex items-center justify-between relative z-10">
            <div
              onClick={() => handleNavigate(isCashier ? "/cashier/pos" : "/admin/dashboard")}
              className={`flex items-center space-x-3.5 cursor-pointer group select-none transition-all ${
                collapsed ? "justify-center w-full" : ""
              }`}
            >
              {/* Brand Logo Image from public/logo.jpeg */}
              <div className="relative h-11 w-11 rounded-[16px] overflow-hidden p-0.5 shadow-[0_6px_20px_rgba(185,130,69,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] flex items-center justify-center shrink-0 border border-white/40 bg-[#F4EBDD] group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(185,130,69,0.6)] transition-all duration-300">
                <img
                  src="/logo.jpeg"
                  alt="3Dot Creatives Logo"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif font-bold text-lg text-[#F4EBDD] leading-tight drop-shadow-sm">
                      3dot<span className="text-[#B98245]">creatives</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#D8C3A5] font-semibold tracking-wider uppercase">
                    {isCashier ? "Cashier Terminal" : "Management Suite"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Realistic Frosted Search Capsule */}
          {!collapsed && (
            <div className="px-3.5 py-1.5 shrink-0 relative z-10">
              <div className="relative flex items-center group font-sans">
                <Search className="absolute left-3.5 h-3.5 w-3.5 text-[#D8C3A5]/60 group-hover:text-[#F4EBDD] transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages"
                  className="w-full pl-9 pr-9 py-2 rounded-2xl text-xs bg-white/[0.05] hover:bg-white/[0.09] focus:bg-white/[0.12] text-[#F4EBDD] placeholder-[#D8C3A5]/60 border border-white/10 hover:border-white/20 focus:border-[#B98245]/40 focus:outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                />
                <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#D8C3A5] bg-black/50 rounded-md border border-white/15 pointer-events-none flex items-center shadow-xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}

          {/* Scrollable Nav Sections */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-none text-xs relative z-10 font-sans">
            
            {/* ─── CASHIER VIEW ONLY ─── */}
            {isCashier ? (
              <div className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#D8C3A5] uppercase flex items-center justify-between">
                    <span>Counter Terminal</span>
                    <span className="text-[9px] text-[#B98245] font-bold">Front-of-House</span>
                  </div>
                )}
                {filteredCashier.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      title={collapsed ? item.name : undefined}
                      className={`group w-full relative flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out transform active:scale-[0.98] ${
                        isActive
                          ? "realistic-glass-item text-white font-semibold"
                          : "text-[#D8C3A5] hover:text-[#F4EBDD] realistic-glass-hover border border-transparent"
                      } ${collapsed ? "justify-center px-0" : "space-x-3"}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${isActive ? "text-[#B98245] drop-shadow-[0_0_8px_rgba(185,130,69,0.6)]" : "text-[#D8C3A5] group-hover:text-white"}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate transition-colors duration-200 group-hover:text-white drop-shadow-xs">{item.name}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105 ${
                                item.badgeColor || "bg-[#303522]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ─── ADMIN VIEW: FULL STUDIO & MANAGEMENT HUBS ─── */
              <>
                {/* Hub 1: Restaurant Floor & Live Service */}
                <div className="space-y-1">
                  {!collapsed && (
                    <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#D8C3A5] uppercase flex items-center justify-between">
                      <span>Floor &amp; Service</span>
                      <span className="text-[9px] text-[#B98245] font-bold">Front-of-House</span>
                    </div>
                  )}
                  {filteredFloor.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        title={collapsed ? item.name : undefined}
                        className={`group w-full relative flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out transform active:scale-[0.98] ${
                          isActive
                            ? "realistic-glass-item text-white font-semibold"
                            : "text-[#D8C3A5] hover:text-[#F4EBDD] realistic-glass-hover border border-transparent"
                        } ${collapsed ? "justify-center px-0" : "space-x-3"}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${isActive ? "text-[#B98245] drop-shadow-[0_0_8px_rgba(185,130,69,0.6)]" : "text-[#D8C3A5] group-hover:text-white"}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate transition-colors duration-200 group-hover:text-white drop-shadow-xs">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105 ${
                                  item.badgeColor || "bg-[#303522]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hub 2: Kitchen & Recipe Stock */}
                <div className="space-y-1">
                  {!collapsed && (
                    <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#D8C3A5] uppercase flex items-center justify-between">
                      <span>Kitchen &amp; Recipes</span>
                      <span className="text-[9px] text-[#59613B] font-bold">Inventory</span>
                    </div>
                  )}
                  {filteredKitchen.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        title={collapsed ? item.name : undefined}
                        className={`group w-full flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out transform active:scale-[0.98] ${
                          isActive
                            ? "realistic-glass-item text-white font-semibold"
                            : "text-[#D8C3A5] hover:text-[#F4EBDD] realistic-glass-hover border border-transparent"
                        } ${collapsed ? "justify-center px-0" : "space-x-3"}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${isActive ? "text-[#B98245] drop-shadow-[0_0_8px_rgba(185,130,69,0.6)]" : "text-[#D8C3A5] group-hover:text-white"}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate transition-colors duration-200 group-hover:text-white drop-shadow-xs">{item.name}</span>
                            {item.dot && (
                              <span
                                className="h-2 w-2 rounded-full shrink-0 group-hover:scale-125 transition-transform duration-200"
                                style={{ backgroundColor: item.dot, boxShadow: `0 0 6px ${item.dot}` }}
                              />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hub 3: Food Supply & Procurement */}
                <div className="space-y-1">
                  {!collapsed && (
                    <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#D8C3A5] uppercase flex items-center justify-between">
                      <span>Supply &amp; Vendors</span>
                      <span className="text-[9px] text-[#B98245] font-bold">Procurement</span>
                    </div>
                  )}
                  {filteredSupply.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        title={collapsed ? item.name : undefined}
                        className={`group w-full flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out transform active:scale-[0.98] ${
                          isActive
                            ? "realistic-glass-item text-white font-semibold"
                            : "text-[#D8C3A5] hover:text-[#F4EBDD] realistic-glass-hover border border-transparent"
                        } ${collapsed ? "justify-center px-0" : "space-x-3"}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${isActive ? "text-[#B98245] drop-shadow-[0_0_8px_rgba(185,130,69,0.6)]" : "text-[#D8C3A5] group-hover:text-white"}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate transition-colors duration-200 group-hover:text-white drop-shadow-xs">{item.name}</span>
                            {item.dot && (
                              <span
                                className="h-2 w-2 rounded-full shrink-0 group-hover:scale-125 transition-transform duration-200"
                                style={{ backgroundColor: item.dot, boxShadow: `0 0 6px ${item.dot}` }}
                              />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hub 4: Financials & Admin HQ */}
                <div className="space-y-1">
                  {!collapsed && (
                    <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#D8C3A5] uppercase flex items-center justify-between">
                      <span>Finance &amp; HQ</span>
                      <span className="text-[9px] text-[#59613B] font-bold">Ledger</span>
                    </div>
                  )}
                  {filteredFinance.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigate(item.href)}
                        title={collapsed ? item.name : undefined}
                        className={`group w-full flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all duration-200 ease-out transform active:scale-[0.98] ${
                          isActive
                            ? "realistic-glass-item text-white font-semibold"
                            : "text-[#D8C3A5] hover:text-[#F4EBDD] realistic-glass-hover border border-transparent"
                        } ${collapsed ? "justify-center px-0" : "space-x-3"}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-115 ${isActive ? "text-[#B98245] drop-shadow-[0_0_8px_rgba(185,130,69,0.6)]" : "text-[#D8C3A5] group-hover:text-white"}`} />
                        {!collapsed && <span className="flex-1 text-left truncate transition-colors duration-200 group-hover:text-white drop-shadow-xs">{item.name}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Controls: User Profile Badge */}
          <div className="shrink-0 p-3 pt-2.5 border-t border-white/10 space-y-2 bg-black/40 backdrop-blur-xl relative z-10 font-sans">
            {/* User Profile Card */}
            <div
              className={`flex items-center p-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/25 border border-white/15 transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] ${
                collapsed ? "justify-center" : "space-x-2.5"
              }`}
            >
              {/* User Avatar with Glowing Online Dot */}
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#59613B] via-[#8C6030] to-[#B98245] flex items-center justify-center text-xs font-bold text-[#F4EBDD] border border-white/40 shadow-sm font-serif">
                  {user.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0E100C] shadow-[0_0_8px_#10b981]" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F4EBDD] truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#D8C3A5] truncate">
                    {user.email}
                  </p>
                </div>
              )}

              {!collapsed && (
                <button
                  onClick={() => signOut().then(() => router.push("/login"))}
                  title="Sign out"
                  className="p-1.5 rounded-xl text-[#D8C3A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
