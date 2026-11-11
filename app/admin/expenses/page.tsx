"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  getPOSExpenses,
  addPOSExpense,
  getPOSExpenseTypes,
  savePOSExpenseType
} from "@/lib/pos-v2-data";
import { POSExpense, POSExpenseType } from "@/lib/pos-data";
import { TrendingDown, Plus, Search, Tag, DollarSign, Receipt, AlertCircle } from "lucide-react";

export default function ExpenseManagementPage() {
  const [activeTab, setActiveTab] = useState<"history" | "types">("history");
  const [expenses, setExpenses] = useState<POSExpense[]>([]);
  const [types, setTypes] = useState<POSExpenseType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // New Expense Entry State
  const [newExpenseModal, setNewExpenseModal] = useState(false);
  const [entryAmount, setEntryAmount] = useState<number>(0);
  const [entryTypeId, setEntryTypeId] = useState<string>("");
  const [entryMethod, setEntryMethod] = useState<string>("cash");
  const [entryPaidTo, setEntryPaidTo] = useState<string>("");
  const [entryRemarks, setEntryRemarks] = useState<string>("");

  // New Type Modal
  const [newTypeModal, setNewTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");

  const loadData = async () => {
    const [exp, typs] = await Promise.all([getPOSExpenses(), getPOSExpenseTypes()]);
    setExpenses(exp);
    setTypes(typs);
    if (typs.length > 0 && !entryTypeId) {
      setEntryTypeId(typs[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryAmount) return;
    const selectedT = types.find(t => t.id === entryTypeId);
    await addPOSExpense({
      amount: entryAmount,
      type_id: entryTypeId,
      type_name: selectedT?.name || "General Expense",
      payment_method: entryMethod,
      paid_to: entryPaidTo || "Vendor / Staff",
      remarks: entryRemarks,
    });
    setNewExpenseModal(false);
    setEntryAmount(0);
    setEntryRemarks("");
    setEntryPaidTo("");
    loadData();
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    await savePOSExpenseType({
      name: newTypeName.trim(),
      description: newTypeDesc.trim(),
      active: true,
    });
    setNewTypeModal(false);
    setNewTypeName("");
    setNewTypeDesc("");
    loadData();
  };

  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const filteredExpenses = expenses.filter(e =>
    (e.type_name && e.type_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.paid_to && e.paid_to.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.reference_no && e.reference_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Expense Management</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Module 10</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Track utilities, staff wages, vehicle allowances, and store maintenance</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setNewTypeModal(true)}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-3 rounded-xl text-xs"
          >
            <Tag className="h-4 w-4 mr-1 text-cyan-400" />
            <span>Manage Types</span>
          </Button>

          <Button
            onClick={() => setNewExpenseModal(true)}
            className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Expense</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Logged Expenses</span>
          <div className="text-2xl font-black text-rose-400 mt-1">Rs. {totalExpense.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Expense Records</span>
          <div className="text-2xl font-black text-[#fdf6e3] mt-1">{expenses.length} bills</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Configured Expense Types</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{types.length} categories</div>
        </Card>
      </div>

      {/* Tabs Switcher: History vs Types */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Expense History ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab("types")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "types"
              ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Expense Types ({types.length})
        </button>
      </div>

      {/* History View */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search history by type, reference, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
            />
          </div>

          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#383e29]/60 shadow-lg">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Reference / Date</th>
                  <th className="p-3">Expense Type</th>
                  <th className="p-3">Paid To</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-800/30">
                    <td className="p-3">
                      <span className="font-mono font-bold text-[#c87740]">{exp.reference_no}</span>
                      <span className="block text-[10px] text-zinc-500">{exp.date}</span>
                    </td>
                    <td className="p-3 font-bold text-white">{exp.type_name}</td>
                    <td className="p-3">{exp.paid_to || "-"}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 text-zinc-300 font-mono">
                        {exp.payment_method}
                      </Badge>
                    </td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">{exp.remarks || "-"}</td>
                    <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">
                      Rs. {(exp.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-500">No expense records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Types View */}
      {activeTab === "types" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {types.map((t) => (
            <Card key={t.id} className="bg-[#383e29]/70 border-zinc-800 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-extrabold text-[#fdf6e3] text-sm">{t.name}</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">Active</Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-2">{t.description || "No extra description provided."}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: New Expense Entry */}
      <Modal isOpen={newExpenseModal} onClose={() => setNewExpenseModal(false)} title="Record New Expense">
        <form onSubmit={handleCreateExpense} className="space-y-3">
          <Input
            label="Expense Amount (Rs.)"
            type="number"
            min="1"
            placeholder="e.g. 5000"
            value={entryAmount || ""}
            onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
            required
            className="text-xs font-bold text-rose-400"
          />

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Expense Category / Type</label>
            <select
              value={entryTypeId}
              onChange={(e) => setEntryTypeId(e.target.value)}
              className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Paid To / Payee"
              placeholder="e.g. LESCO Electricity"
              value={entryPaidTo}
              onChange={(e) => setEntryPaidTo(e.target.value)}
              className="text-xs"
            />
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Payment Method</label>
              <select
                value={entryMethod}
                onChange={(e) => setEntryMethod(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online / Card</option>
              </select>
            </div>
          </div>

          <Input
            label="Remarks / Description"
            placeholder="e.g. November commercial cylinder refilling..."
            value={entryRemarks}
            onChange={(e) => setEntryRemarks(e.target.value)}
            className="text-xs"
          />

          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Confirm & Save Expense Record
          </Button>
        </form>
      </Modal>

      {/* Modal: New Expense Type */}
      <Modal isOpen={newTypeModal} onClose={() => setNewTypeModal(false)} title="Create Expense Type">
        <form onSubmit={handleCreateType} className="space-y-3">
          <Input
            label="Type Name"
            placeholder="e.g. Store Rent & Lease"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            required
            className="text-xs"
          />
          <Input
            label="Description"
            placeholder="Details regarding this expense category..."
            value={newTypeDesc}
            onChange={(e) => setNewTypeDesc(e.target.value)}
            className="text-xs"
          />
          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Add Type
          </Button>
        </form>
      </Modal>
    </div>
  );
}

