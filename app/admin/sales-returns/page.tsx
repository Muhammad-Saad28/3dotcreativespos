"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getPOSSaleReturns, createPOSSaleReturn, getPOSCustomers } from "@/lib/pos-v2-data";
import { getPOSOrders, getPOSMenuItems, POSOrder, POSMenuItem } from "@/lib/pos-data";
import { POSSaleReturn, POSCustomer } from "@/lib/pos-data";
import { RotateCcw, Plus, Search, DollarSign, Receipt, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState<POSSaleReturn[]>([]);
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState("cash");
  const [returnReason, setReturnReason] = useState("");

  const loadData = async () => {
    const [rets, ords, custs, items] = await Promise.all([
      getPOSSaleReturns(),
      getPOSOrders(),
      getPOSCustomers(),
      getPOSMenuItems(),
    ]);
    setReturns(rets);
    setOrders(ords);
    setCustomers(custs);
    setMenuItems(items);
    if (custs.length > 0 && !selectedCustomerId) setSelectedCustomerId(custs[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0) return;
    const cust = customers.find(c => c.id === selectedCustomerId);

    await createPOSSaleReturn({
      order_number: orderNumber || "WALKIN",
      customer_id: selectedCustomerId,
      customer_name: cust?.name || "Walk-in Customer",
      total_refund_amount: refundAmount,
      refund_method: refundMethod,
      reason: returnReason || "Customer returned item at counter",
    });

    setModalOpen(false);
    setRefundAmount(0);
    setReturnReason("");
    setOrderNumber("");
    loadData();
  };

  const totalRefunds = returns.reduce((sum, r) => sum + (r.total_refund_amount || 0), 0);

  const filtered = returns.filter(r =>
    (r.return_no && r.return_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.customer_name && r.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.reason && r.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Sales Returns & Refunds</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Floor & Kitchen</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Process customer returns, restore inventory stock, and reverse billing totals</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/cashier/pos">
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-3 rounded-xl text-xs">
              <ArrowLeft className="h-4 w-4 mr-1 text-[#c87740]" />
              <span>Back to POS</span>
            </Button>
          </Link>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-rose-600/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Process Sale Return</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Sales Returns (Refunded)</span>
          <div className="text-2xl font-black text-rose-400 mt-1">Rs. {totalRefunds.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Returned Invoices</span>
          <div className="text-2xl font-black text-[#fdf6e3] mt-1">{returns.length} returned</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Inventory Status</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">Stock Auto-Restored</div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search return by voucher #, customer, reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
        />
      </div>

      {/* Returns Table */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#383e29]/60 shadow-lg">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Return # / Date</th>
              <th className="p-3">Original Invoice #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Refund Method</th>
              <th className="p-3">Return Reason</th>
              <th className="p-3 text-right">Refund Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filtered.map((ret) => (
              <tr key={ret.id} className="hover:bg-zinc-800/30">
                <td className="p-3">
                  <span className="font-mono font-bold text-rose-400">{ret.return_no}</span>
                  <span className="block text-[10px] text-zinc-500">{ret.return_date}</span>
                </td>
                <td className="p-3 font-mono text-[#c87740]">#{ret.order_number || "WALKIN"}</td>
                <td className="p-3 font-bold text-white">{ret.customer_name}</td>
                <td className="p-3">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono border-zinc-700">
                    {ret.refund_method}
                  </Badge>
                </td>
                <td className="p-3 text-zinc-400">{ret.reason}</td>
                <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">
                  Rs. {(ret.total_refund_amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500">No sale returns on record.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Process Sale Return */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Process Sales Return & Refund">
        <form onSubmit={handleCreateReturn} className="space-y-3">
          <Input
            label="Invoice / Order Number"
            placeholder="e.g. 0000104"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="text-xs"
          />

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Customer Profile</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Refund Amount (Rs.)"
              type="number"
              min="1"
              value={refundAmount || ""}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              required
              className="text-xs font-bold text-rose-400"
            />
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Refund Method</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="cash">Cash Counter</option>
                <option value="card">Card Reversal</option>
                <option value="store_credit">Store Credit Balance</option>
              </select>
            </div>
          </div>

          <Input
            label="Reason for Return"
            placeholder="e.g. Wrong burger prepared, customer cancelled order..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            required
            className="text-xs"
          />

          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-9 text-xs">
            Confirm Sales Return & Refund
          </Button>
        </form>
      </Modal>
    </div>
  );
}

