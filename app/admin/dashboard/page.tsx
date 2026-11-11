"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getPOSOrders, 
  getPOSInventory, 
  POSOrder, 
  POSInventoryItem,
  formatOrderNumber 
} from "@/lib/pos-data";
import {
  getPOSCustomers,
  getPOSVendors,
  getPOSPurchases,
  getPOSSaleReturns,
  getPOSPurchaseReturns,
  POSCustomer,
  POSVendor,
  POSPurchase,
  POSSaleReturn,
  POSPurchaseReturn
} from "@/lib/pos-v2-data";
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Truck, 
  Receipt, 
  RotateCcw, 
  ArrowUpRight, 
  RefreshCw,
  Search,
  CheckCircle2,
  Package
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { AnimatedNumber } from "@/components/ui/animated-number";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [inventory, setInventory] = useState<POSInventoryItem[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [vendors, setVendors] = useState<POSVendor[]>([]);
  const [purchases, setPurchases] = useState<POSPurchase[]>([]);
  const [saleReturns, setSaleReturns] = useState<POSSaleReturn[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<POSPurchaseReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(todayStr);

  const loadAllData = async () => {
    setIsLoading(true);
    const [fetchedOrders, fetchedInv, fetchedCust, fetchedVend, fetchedPurch, fetchedSRet, fetchedPRet] = await Promise.all([
      getPOSOrders(),
      getPOSInventory(),
      getPOSCustomers(),
      getPOSVendors(),
      getPOSPurchases(),
      getPOSSaleReturns(),
      getPOSPurchaseReturns(),
    ]);

    setOrders(fetchedOrders);
    setInventory(fetchedInv);
    setCustomers(fetchedCust);
    setVendors(fetchedVend);
    setPurchases(fetchedPurch);
    setSaleReturns(fetchedSRet);
    setPurchaseReturns(fetchedPRet);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered calculations based on Date Range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = (o.created_at || "").split("T")[0];
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });
  }, [orders, startDate, endDate]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const pDate = p.purchase_date;
      if (startDate && pDate < startDate) return false;
      if (endDate && pDate > endDate) return false;
      return true;
    });
  }, [purchases, startDate, endDate]);

  const filteredSaleReturns = useMemo(() => {
    return saleReturns.filter(r => {
      const rDate = r.return_date;
      if (startDate && rDate < startDate) return false;
      if (endDate && rDate > endDate) return false;
      return true;
    });
  }, [saleReturns, startDate, endDate]);

  // Key Figures
  const totalSalesAmount = filteredOrders
    .filter(o => o.status !== "cancelled" && o.status !== "rejected")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalPurchaseAmount = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const salesReturnAmount = filteredSaleReturns.reduce((sum, r) => sum + (r.total_refund_amount || 0), 0);

  const visitedCustomerCount = customers.reduce((sum, c) => sum + (c.visited_count || 1), 0);
  const customerOutstandingBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const customerPaymentsCollected = customers.reduce((sum, c) => sum + (c.payments_collected || 0), 0);

  const vendorOutstandingBalance = vendors.reduce((sum, v) => sum + (v.balance || 0), 0);
  const vendorPaymentsCollected = vendors.reduce((sum, v) => sum + (v.payments_collected || 0), 0);

  // Top Selling Products Aggregation
  const topSelling = useMemo(() => {
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.menu_item_name || "Special Item";
        if (!itemCounts[key]) {
          itemCounts[key] = { name: key, count: 0, revenue: 0 };
        }
        itemCounts[key].count += item.quantity || 1;
        itemCounts[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredOrders]);

  // Low stock and negative stock items
  const lowStockItems = inventory.filter(i => (i.quantity ?? 0) <= (i.min_threshold ?? 10));

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-6 text-[#F4EBDD] font-sans">
      {/* Top Banner & Date Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-surface-card p-5 rounded-[24px] shadow-2xl relative overflow-hidden">
        {/* Subtle accent light streak */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D8C3A5]/30 to-transparent" />
        
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4EBDD] tracking-wide">Studio Management &amp; POS Dashboard</h1>
            <Badge className="bg-[#B98245]/20 text-[#B98245] border-[#B98245]/40 font-mono text-[10px] font-bold shadow-xs">V2 STUDIO</Badge>
          </div>
          <p className="text-xs text-[#D8C3A5] mt-1 font-sans">Real-time studio revenue, purchasing ledgers, active sessions &amp; inventory</p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-3 py-2 space-x-2 backdrop-blur-md shadow-inner">
            <Calendar className="h-4 w-4 text-[#c87740]" />
            <span className="text-[11px] font-bold text-zinc-400">From:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-hidden font-medium cursor-pointer"
            />
          </div>

          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-3 py-2 space-x-2 backdrop-blur-md shadow-inner">
            <Calendar className="h-4 w-4 text-[#c87740]" />
            <span className="text-[11px] font-bold text-zinc-400">To:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-hidden font-medium cursor-pointer"
            />
          </div>

          <Button 
            size="sm" 
            onClick={loadAllData}
            className="bg-gradient-to-r from-[#c87740] to-[#b0622f] hover:from-[#d9854d] hover:to-[#c87740] text-white font-bold h-9 px-4 rounded-xl flex items-center space-x-1.5 shadow-[0_4px_16px_rgba(200,119,64,0.4)] border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Apply</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              setStartDate(d.toISOString().split("T")[0]);
              setEndDate(todayStr);
            }}
            className="border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white h-9 px-3.5 rounded-xl text-xs backdrop-blur-md transition-all cursor-pointer"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* 8 Primary Financial & Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visited Customer Count */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Visited Customers</CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-xs">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#fdf6e3]">
              <AnimatedNumber value={visitedCustomerCount} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Walk-in & registered accounts</p>
          </CardContent>
        </Card>

        {/* Total Sales Amount */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Sales</CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400">
              <AnimatedNumber value={totalSalesAmount} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{filteredOrders.length} Completed / Active Invoices</p>
          </CardContent>
        </Card>

        {/* Total Purchase Amount */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Purchases</CardTitle>
            <div className="p-2.5 rounded-xl bg-[#c87740]/10 text-[#c87740] border border-[#c87740]/20 shadow-xs">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#c87740]">
              <AnimatedNumber value={totalPurchaseAmount} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{filteredPurchases.length} Purchase Bills in period</p>
          </CardContent>
        </Card>

        {/* Sales Return Amount */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sales Return</CardTitle>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xs">
              <RotateCcw className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-400">
              <AnimatedNumber value={salesReturnAmount} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{filteredSaleReturns.length} Invoices refunded</p>
          </CardContent>
        </Card>

        {/* Customer Outstanding Balance */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cust. Outstanding Balance</CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-400">
              <AnimatedNumber value={customerOutstandingBalance} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Pending receivable from clients</p>
          </CardContent>
        </Card>

        {/* Customer Payments Collected */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cust. Payments Collected</CardTitle>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-xs">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-cyan-400">
              <AnimatedNumber value={customerPaymentsCollected} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Total revenue collected to date</p>
          </CardContent>
        </Card>

        {/* Vendor Outstanding Balance */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vendor Outstanding</CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-xs">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-400">
              <AnimatedNumber value={vendorOutstandingBalance} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Payable balance to suppliers</p>
          </CardContent>
        </Card>

        {/* Payments Collected from / Paid to Vendors */}
        <Card className="glass-surface-card rounded-[22px] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vendor Payments Cleared</CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-400">
              <AnimatedNumber value={vendorPaymentsCollected} prefix="Rs. " />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Settled invoices with vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* 3 Action Sections: Recent Invoices, Top-Selling Products, Low-Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices List */}
        <Card className="glass-surface-card rounded-[24px] border-white/10 shadow-xl lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <CardTitle className="text-sm font-bold text-[#fdf6e3] flex items-center space-x-2">
                <Receipt className="h-4 w-4 text-[#c87740]" />
                <span>Recent Invoices</span>
              </CardTitle>
              <p className="text-[11px] text-zinc-400">Latest transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#c87740] hover:underline font-bold">
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-3 space-y-2.5">
            {filteredOrders.slice(0, 6).map((order) => (
              <div 
                key={order.id} 
                className="p-2.5 rounded-xl p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#c87740]">#{formatOrderNumber(order.order_number || order.id)}</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 border-zinc-700 text-zinc-300">
                      {order.order_type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{order.customer_name || "Walk-in Customer"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">Rs. {(order.total || 0).toLocaleString()}</div>
                  <span className={`text-[10px] font-bold capitalize ${
                    order.status === "completed" ? "text-emerald-500" :
                    order.status === "cancelled" ? "text-rose-500" : "text-amber-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-6 text-zinc-500 text-xs">No invoices in selected date range</div>
            )}
          </CardContent>
        </Card>

        {/* Top-Selling Products List */}
        <Card className="glass-surface-card rounded-[24px] border-white/10 shadow-xl lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <CardTitle className="text-sm font-bold text-[#fdf6e3] flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Top-Selling Products</span>
              </CardTitle>
              <p className="text-[11px] text-zinc-400">Best performers by volume</p>
            </div>
            <Link href="/admin/reports" className="text-xs text-[#c87740] hover:underline font-bold">
              Full Report
            </Link>
          </CardHeader>
          <CardContent className="pt-3 space-y-2.5">
            {topSelling.map((item, idx) => (
              <div 
                key={item.name} 
                className="p-2.5 rounded-xl p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#fdf6e3]">{item.name}</p>
                    <p className="text-[10px] text-zinc-400">{item.count} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#c87740]">Rs. {item.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {topSelling.length === 0 && (
              <div className="text-center py-6 text-zinc-500 text-xs">No product sales in selected date range</div>
            )}
          </CardContent>
        </Card>

        {/* Low-Stock Products List */}
        <Card className="glass-surface-card rounded-[24px] border-white/10 shadow-xl lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <CardTitle className="text-sm font-bold text-[#fdf6e3] flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Low-Stock Inventory</span>
              </CardTitle>
              <p className="text-[11px] text-zinc-400">Below threshold alerts</p>
            </div>
            <Link href="/admin/inventory" className="text-xs text-[#c87740] hover:underline font-bold">
              Manage Stock (F3)
            </Link>
          </CardHeader>
          <CardContent className="pt-3 space-y-2.5">
            {lowStockItems.slice(0, 6).map((inv) => (
              <div 
                key={inv.id} 
                className="p-2.5 rounded-xl bg-zinc-900 border border-rose-500/20 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#fdf6e3]">{inv.name}</p>
                    <p className="text-[10px] text-zinc-400">Min Threshold: {inv.min_threshold} {inv.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-xs">
                    {inv.quantity} {inv.unit}
                  </Badge>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-6 text-emerald-400 text-xs flex items-center justify-center space-x-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>All inventory items are adequately stocked!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


