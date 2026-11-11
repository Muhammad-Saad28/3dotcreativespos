"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPOSOrders, getPOSMenuItems, getPOSCategories, POSOrder, POSMenuItem, POSCategory, formatOrderNumber } from "@/lib/pos-data";
import {
  getPOSCustomers,
  getPOSPurchases,
  getPOSPurchaseReturns,
  POSCustomer,
  POSPurchase,
  POSPurchaseReturn
} from "@/lib/pos-v2-data";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  UserCheck, 
  Clock, 
  Tag, 
  Package,
  Search
} from "lucide-react";

type ReportTab = 
  | "customer_register"
  | "purchase_history"
  | "purchase_return_history"
  | "product_purchase_history"
  | "sale_history"
  | "user_sale_history"
  | "shift_sale_history"
  | "category_sale_history"
  | "product_sale_history";

export default function ReportsSuitePage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("customer_register");
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [purchases, setPurchases] = useState<POSPurchase[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<POSPurchaseReturn[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Date filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    Promise.all([
      getPOSOrders(),
      getPOSCustomers(),
      getPOSPurchases(),
      getPOSPurchaseReturns(),
      getPOSMenuItems(),
      getPOSCategories(),
    ]).then(([ord, cust, pur, pret, items, cats]) => {
      setOrders(ord);
      setCustomers(cust);
      setPurchases(pur);
      setPurchaseReturns(pret);
      setMenuItems(items);
      setCategories(cats);
    });
  }, []);

  // Filtered orders by date
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = (o.created_at || "").split("T")[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [orders, startDate, endDate]);

  // Export CSV Helper
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Customer Register
  const customerRows = customers.map(c => [
    c.name,
    c.phone || "-",
    c.visited_count || 1,
    c.total_spent || 0,
    c.payments_collected || 0,
    c.balance || 0,
    c.active ? "Active" : "Inactive"
  ]);

  // 2. Purchase History
  const purchaseRows = purchases.map(p => [
    p.invoice_no,
    p.purchase_date,
    p.vendor_name,
    p.total_amount,
    p.paid_amount,
    p.balance_amount,
    p.payment_method
  ]);

  // 3. Purchase Return History
  const purchaseReturnRows = purchaseReturns.map(r => [
    r.return_no,
    r.return_date,
    r.purchase_invoice_no || "-",
    r.vendor_name,
    r.total_returned_amount,
    r.reason || "Defective stock"
  ]);

  // 4. Product Purchase History
  const productPurchaseRows = purchases.flatMap(p =>
    (p.items || []).map(i => [
      i.product_name,
      i.product_code || "-",
      p.purchase_date,
      p.vendor_name,
      i.quantity,
      i.unit_cost,
      i.total_cost
    ])
  );

  // 5. Sale History
  const saleRows = filteredOrders.map(o => [
    formatOrderNumber(o.order_number || o.id),
    (o.created_at || "").split("T")[0],
    o.customer_name || "Walk-in Customer",
    o.order_type,
    o.payment_method || "cash",
    o.subtotal || o.total,
    o.discount_amount || 0,
    o.total,
    o.status
  ]);

  // 6. User Sale History (by Staff / Waiter / Cashier)
  const userSalesMap: Record<string, { name: string; count: number; total: number }> = {};
  filteredOrders.forEach(o => {
    const key = o.waiter_name || "Cashier Counter";
    if (!userSalesMap[key]) userSalesMap[key] = { name: key, count: 0, total: 0 };
    userSalesMap[key].count += 1;
    userSalesMap[key].total += o.total || 0;
  });
  const userSaleRows = Object.values(userSalesMap).map(u => [
    u.name,
    u.count,
    u.total,
    Math.round(u.total / (u.count || 1))
  ]);

  // 7. Shift Sale History (Morning 06:00-15:00 vs Evening 15:00-03:00)
  const shiftMap: Record<string, { shift: string; count: number; total: number }> = {
    Morning: { shift: "Morning Shift (06:00 - 15:00)", count: 0, total: 0 },
    Evening: { shift: "Evening / Night Shift (15:00 - 03:00)", count: 0, total: 0 },
  };
  filteredOrders.forEach(o => {
    const time = new Date(o.created_at).getHours();
    const isMorning = time >= 6 && time < 15;
    const target = isMorning ? shiftMap.Morning : shiftMap.Evening;
    target.count += 1;
    target.total += o.total || 0;
  });
  const shiftSaleRows = Object.values(shiftMap).map(s => [
    s.shift,
    s.count,
    s.total,
    Math.round(s.total / (s.count || 1))
  ]);

  // 8. Category Sale History
  const categorySalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items?.forEach(i => {
      const menuItem = menuItems.find(m => m.id === i.menu_item_id);
      const catName = menuItem?.category_name || "Specialty";
      if (!categorySalesMap[catName]) categorySalesMap[catName] = { name: catName, count: 0, revenue: 0 };
      categorySalesMap[catName].count += i.quantity || 1;
      categorySalesMap[catName].revenue += (i.price || 0) * (i.quantity || 1);
    });
  });
  const categorySaleRows = Object.values(categorySalesMap).map(c => [
    c.name,
    c.count,
    c.revenue
  ]);

  // 9. Product Sale History
  const productSalesMap: Record<string, { name: string; code: string; count: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    o.items?.forEach(i => {
      const menuItem = menuItems.find(m => m.id === i.menu_item_id);
      const name = i.menu_item_name || menuItem?.name || "Product";
      const code = menuItem?.code || "-";
      if (!productSalesMap[name]) productSalesMap[name] = { name, code, count: 0, revenue: 0 };
      productSalesMap[name].count += i.quantity || 1;
      productSalesMap[name].revenue += (i.price || 0) * (i.quantity || 1);
    });
  });
  const productSaleRows = Object.values(productSalesMap).map(p => [
    p.name,
    p.code,
    p.count,
    p.revenue
  ]);

  const reportTabsConfig: Array<{ key: ReportTab; title: string; icon: any }> = [
    { key: "customer_register", title: "Customer Register", icon: UserCheck },
    { key: "purchase_history", title: "Purchase History", icon: Truck },
    { key: "purchase_return_history", title: "Purchase Return History", icon: RotateCcw },
    { key: "product_purchase_history", title: "Product Purchase History", icon: Package },
    { key: "sale_history", title: "Sale History", icon: ShoppingBag },
    { key: "user_sale_history", title: "User Sale History", icon: Users },
    { key: "shift_sale_history", title: "Shift Sale History", icon: Clock },
    { key: "category_sale_history", title: "Category Sale History", icon: Tag },
    { key: "product_sale_history", title: "Product Sale History", icon: FileText },
  ];

  const handleExportCurrent = () => {
    switch (activeTab) {
      case "customer_register":
        exportToCSV("Customer_Register", ["Name", "Phone", "Visits", "Total Spent", "Payments Collected", "Balance", "Status"], customerRows);
        break;
      case "purchase_history":
        exportToCSV("Purchase_History", ["Invoice #", "Date", "Vendor", "Total", "Paid", "Balance", "Method"], purchaseRows);
        break;
      case "purchase_return_history":
        exportToCSV("Purchase_Return_History", ["Return #", "Date", "Purchase Inv #", "Vendor", "Amount", "Reason"], purchaseReturnRows);
        break;
      case "product_purchase_history":
        exportToCSV("Product_Purchase_History", ["Product", "Code", "Date", "Vendor", "Qty", "Unit Cost", "Total Cost"], productPurchaseRows);
        break;
      case "sale_history":
        exportToCSV("Sale_History", ["Invoice #", "Date", "Customer", "Type", "Payment", "Subtotal", "Discount", "Total", "Status"], saleRows);
        break;
      case "user_sale_history":
        exportToCSV("User_Sale_History", ["User / Cashier", "Invoices Count", "Total Sales", "Avg Ticket"], userSaleRows);
        break;
      case "shift_sale_history":
        exportToCSV("Shift_Sale_History", ["Shift Period", "Orders Count", "Total Revenue", "Avg Ticket"], shiftSaleRows);
        break;
      case "category_sale_history":
        exportToCSV("Category_Sale_History", ["Category", "Units Sold", "Total Revenue"], categorySaleRows);
        break;
      case "product_sale_history":
        exportToCSV("Product_Sale_History", ["Product Name", "Code", "Units Sold", "Total Revenue"], productSaleRows);
        break;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171b13] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Reports Suite</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Module 13 (All 9 Reports)</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Historical ledger audit, product movement, shifts, users, and customer register</p>
        </div>

        {/* Global Filter & Export Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center glass-surface-card rounded-xl px-2.5 py-1 space-x-2">
            <Calendar className="h-3.5 w-3.5 text-[#c87740]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-hidden"
            />
            <span className="text-zinc-500 text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-hidden"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCurrent}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white h-9 px-3 rounded-xl text-xs flex items-center space-x-1"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl text-xs flex items-center space-x-1 shadow-md shadow-[#c87740]/20"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* 9 Reports Navigation Submenu */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 border-b border-zinc-800">
        {reportTabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/25"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Customer Register */}
      {activeTab === "customer_register" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Total Visits</th>
                <th className="p-3">Total Purchases (Rs.)</th>
                <th className="p-3">Payments Collected (Rs.)</th>
                <th className="p-3 text-right">Outstanding Balance (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {customerRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3 font-mono">{r[1]}</td>
                  <td className="p-3">{r[2]}</td>
                  <td className="p-3 font-mono text-emerald-400">Rs. {Number(r[3]).toLocaleString()}</td>
                  <td className="p-3 font-mono text-cyan-400">Rs. {Number(r[4]).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-amber-400">
                    Rs. {Number(r[5]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Purchase History */}
      {activeTab === "purchase_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Paid Amount</th>
                <th className="p-3">Balance</th>
                <th className="p-3 text-right">Total Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {purchaseRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-mono font-bold text-[#c87740]">{r[0]}</td>
                  <td className="p-3 font-mono">{r[1]}</td>
                  <td className="p-3 font-bold text-white">{r[2]}</td>
                  <td className="p-3 font-mono text-emerald-400">Rs. {Number(r[4]).toLocaleString()}</td>
                  <td className="p-3 font-mono text-rose-400">Rs. {Number(r[5]).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-[#c87740]">
                    Rs. {Number(r[3]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Purchase Return History */}
      {activeTab === "purchase_return_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Return #</th>
                <th className="p-3">Return Date</th>
                <th className="p-3">Purchase Invoice</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Reason</th>
                <th className="p-3 text-right">Refund Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {purchaseReturnRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-mono font-bold text-rose-400">{r[0]}</td>
                  <td className="p-3 font-mono">{r[1]}</td>
                  <td className="p-3 font-mono">{r[2]}</td>
                  <td className="p-3 font-bold text-white">{r[3]}</td>
                  <td className="p-3 text-zinc-400">{r[5]}</td>
                  <td className="p-3 text-right font-mono font-black text-rose-400">
                    Rs. {Number(r[4]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Product Purchase History */}
      {activeTab === "product_purchase_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Date</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Purchased Qty</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3 text-right">Total Cost (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {productPurchaseRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3 font-mono text-zinc-400">{r[1]}</td>
                  <td className="p-3 font-mono">{r[2]}</td>
                  <td className="p-3">{r[3]}</td>
                  <td className="p-3 font-bold text-white">{r[4]} units</td>
                  <td className="p-3 font-mono">Rs. {r[5]}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400">
                    Rs. {Number(r[6]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Sale History */}
      {activeTab === "sale_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Discount</th>
                <th className="p-3 text-right">Net Total (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {saleRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-mono font-bold text-[#c87740]">#{r[0]}</td>
                  <td className="p-3 font-mono">{r[1]}</td>
                  <td className="p-3 font-bold text-white">{r[2]}</td>
                  <td className="p-3 capitalize">{r[3]}</td>
                  <td className="p-3 uppercase font-mono">{r[4]}</td>
                  <td className="p-3 font-mono text-amber-400">Rs. {Number(r[6]).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400">
                    Rs. {Number(r[7]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: User Sale History */}
      {activeTab === "user_sale_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Staff / Cashier / Waiter</th>
                <th className="p-3">Invoices Processed</th>
                <th className="p-3">Average Ticket Size</th>
                <th className="p-3 text-right">Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {userSaleRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3">{r[1]} orders</td>
                  <td className="p-3 font-mono text-cyan-400">Rs. {Number(r[3]).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                    Rs. {Number(r[2]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 7: Shift Sale History */}
      {activeTab === "shift_sale_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Shift Period</th>
                <th className="p-3">Order Count</th>
                <th className="p-3">Average Shift Ticket</th>
                <th className="p-3 text-right">Total Shift Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {shiftSaleRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3">{r[1]} orders</td>
                  <td className="p-3 font-mono text-cyan-400">Rs. {Number(r[3]).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                    Rs. {Number(r[2]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 8: Category Sale History */}
      {activeTab === "category_sale_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Category Name</th>
                <th className="p-3">Total Units Sold</th>
                <th className="p-3 text-right">Revenue Generated (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {categorySaleRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3">{r[1]} units</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                    Rs. {Number(r[2]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 9: Product Sale History */}
      {activeTab === "product_sale_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Product Code</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3 text-right">Total Revenue (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {productSaleRows.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="p-3 font-bold text-white">{r[0]}</td>
                  <td className="p-3 font-mono text-zinc-400">{r[1]}</td>
                  <td className="p-3">{r[2]} units</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                    Rs. {Number(r[3]).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

