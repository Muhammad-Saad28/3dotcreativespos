"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getPOSCustomers, savePOSCustomer } from "@/lib/pos-v2-data";
import { POSCustomer } from "@/lib/pos-data";
import { UserCheck, Plus, Edit2, Search, Phone, Mail, MapPin, DollarSign, Receipt, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<POSCustomer> | null>(null);

  const loadData = async () => {
    const list = await getPOSCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.name) return;
    await savePOSCustomer(editingCustomer);
    setModalOpen(false);
    setEditingCustomer(null);
    loadData();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalSalesSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalVisits = customers.reduce((sum, c) => sum + (c.visited_count || 1), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Customers & Credit Register</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Module 7</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Track customer balances, visits, purchase history, and ledger payments</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/reports">
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-3 rounded-xl text-xs">
              <Receipt className="h-4 w-4 mr-1 text-[#c87740]" />
              <span>Customer Register Report</span>
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingCustomer({ name: "", phone: "", balance: 0, total_spent: 0, visited_count: 1, active: true });
              setModalOpen(true);
            }}
            className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Visited Customers</span>
          <div className="text-2xl font-black text-[#fdf6e3] mt-1">{totalVisits.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Customer Outstanding (Credit)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">Rs. {totalReceivable.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Lifetime Customer Revenue</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">Rs. {totalSalesSpent.toLocaleString()}</div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search customer by name, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => (
          <Card key={cust.id} className="bg-[#383e29]/70 border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
            <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-[#fdf6e3]">{cust.name}</CardTitle>
                  <span className="text-[11px] text-zinc-400 block">{cust.visited_count || 1} Orders / Visits</span>
                </div>
              </div>
              {cust.id === "cust_walkin" ? (
                <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/30 text-[10px]">
                  Default POS
                </Badge>
              ) : (
                <Badge className={cust.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-zinc-800 text-zinc-500 text-[10px]"}>
                  {cust.active ? "Active" : "Inactive"}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Current Balance</span>
                  <span className={`font-mono font-black text-sm ${cust.balance > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                    Rs. {(cust.balance || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Total Spent</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    Rs. {(cust.total_spent || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {cust.phone && cust.phone !== "-" && (
                <p className="text-zinc-300 flex items-center space-x-1.5">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  <span>{cust.phone}</span>
                </p>
              )}
              {cust.email && cust.email !== "-" && (
                <p className="text-zinc-300 flex items-center space-x-1.5">
                  <Mail className="h-3 w-3 text-zinc-500" />
                  <span>{cust.email}</span>
                </p>
              )}
              {cust.address && (
                <p className="text-zinc-400 text-[11px] flex items-center space-x-1.5">
                  <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </p>
              )}

              {cust.id !== "cust_walkin" && (
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCustomer(cust);
                      setModalOpen(true);
                    }}
                    className="h-7 text-xs border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    <span>Edit Ledger</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer?.id ? "Edit Customer Record" : "New Customer Record"}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Customer Name"
            placeholder="e.g. Bilal Sheikh"
            value={editingCustomer?.name || ""}
            onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
            required
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Phone Number"
              placeholder="+92 334 1113355"
              value={editingCustomer?.phone || ""}
              onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
              className="text-xs"
            />
            <Input
              label="Email Address"
              placeholder="customer@gmail.com"
              value={editingCustomer?.email || ""}
              onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
              className="text-xs"
            />
          </div>
          <Input
            label="Delivery Address / Residence"
            placeholder="e.g. House 14, Block B, Lahore"
            value={editingCustomer?.address || ""}
            onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Outstanding Credit Balance (Rs.)"
              type="number"
              placeholder="0"
              value={editingCustomer?.balance || ""}
              onChange={(e) => setEditingCustomer({ ...editingCustomer, balance: parseFloat(e.target.value) || 0 })}
              className="text-xs"
            />
            <Input
              label="Visited Count"
              type="number"
              placeholder="1"
              value={editingCustomer?.visited_count || ""}
              onChange={(e) => setEditingCustomer({ ...editingCustomer, visited_count: parseInt(e.target.value, 10) || 1 })}
              className="text-xs"
            />
          </div>
          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Save Customer Record
          </Button>
        </form>
      </Modal>
    </div>
  );
}

