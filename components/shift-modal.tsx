"use client";

import React, { useState, useEffect } from "react";
import { 
  POSShift, 
  POSCashTransaction, 
  getCurrentShift, 
  openShift, 
  recordCashTransaction, 
  closeShift, 
  getShiftLiveSummary,
  POSShiftSummary 
} from "@/lib/pos-data";
import { 
  Banknote, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Lock, 
  Unlock, 
  History, 
  Calculator, 
  Printer, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  RefreshCw,
  PlusCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShiftReceiptModal } from "@/components/shift-receipt-modal";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string };
  onShiftChange?: (shift: POSShift | null) => void;
}

export function ShiftModal({ isOpen, onClose, currentUser, onShiftChange }: ShiftModalProps) {
  const [activeShift, setActiveShift] = useState<POSShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "drop" | "payout" | "add_float" | "close" | "log">("overview");

  // Open Shift Form
  const [startingFloatInput, setStartingFloatInput] = useState("5000");

  // Cash Action Form (Drop, Payout, Add Float)
  const [txAmount, setTxAmount] = useState("");
  const [txReason, setTxReason] = useState("");
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Blind Close Form
  const [countedCashInput, setCountedCashInput] = useState("");
  const [varianceNotesInput, setVarianceNotesInput] = useState("");
  const [reconciledShift, setReconciledShift] = useState<POSShift | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Denominations counter helper
  const [denomMode, setDenomMode] = useState(false);
  const [denoms, setDenoms] = useState<{ [key: number]: number }>({
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    1: 0,
  });

  const loadShift = async () => {
    setLoading(true);
    const shift = await getCurrentShift(currentUser.id);
    setActiveShift(shift);
    if (onShiftChange) onShiftChange(shift);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadShift();
      setActiveTab("overview");
      setReconciledShift(null);
      setTxAmount("");
      setTxReason("");
      setCountedCashInput("");
      setVarianceNotesInput("");
    }
  }, [isOpen]);

  // Update total counted from denominations
  useEffect(() => {
    if (denomMode) {
      const sum = Object.entries(denoms).reduce((acc, [denom, count]) => {
        return acc + Number(denom) * (Number(count) || 0);
      }, 0);
      setCountedCashInput(sum.toString());
    }
  }, [denoms, denomMode]);

  if (!isOpen) return null;

  // Handler: Open Shift
  const handleOpenShift = async () => {
    const floatVal = parseFloat(startingFloatInput) || 0;
    const shift = await openShift(currentUser.id, currentUser.name, floatVal);
    setActiveShift(shift);
    if (onShiftChange) onShiftChange(shift);
    setActiveTab("overview");
  };

  // Handler: Cash Drop / Payout / Add Float
  const handleRecordTransaction = async (type: "drop" | "payout" | "add_float") => {
    if (!activeShift) return;
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;
    if (!txReason.trim()) return;

    setTxSubmitting(true);
    await recordCashTransaction(activeShift.id, type, amount, txReason.trim(), currentUser.name);
    await loadShift();
    setTxSubmitting(false);
    setTxAmount("");
    setTxReason("");
    setActiveTab("overview");
  };

  // Handler: Blind Close Shift
  const handleCloseShift = async () => {
    if (!activeShift) return;
    const counted = parseFloat(countedCashInput);
    if (isNaN(counted) || counted < 0) return;

    setIsClosing(true);
    const closed = await closeShift(activeShift.id, counted, varianceNotesInput.trim() || undefined);
    setReconciledShift(closed);
    setActiveShift(null);
    if (onShiftChange) onShiftChange(null);
    setIsClosing(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
          {/* Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#c87740]/20 border border-[#c87740]/30 flex items-center justify-center text-[#c87740]">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#fdf6e3] flex items-center gap-2">
                  <span>Cash Drawer &amp; Shift Management</span>
                  {activeShift ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE SHIFT #{activeShift.shift_number}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                      DRAWER CLOSED
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400">
                  {currentUser.name} • {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Case 1: Post-reconciliation result */}
            {reconciledShift ? (
              <div className="space-y-5 text-center py-2">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#fdf6e3]">
                    Shift #{reconciledShift.shift_number} Reconciled &amp; Closed
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Cashier drawer closed and locked. All transaction metrics archived.
                  </p>
                </div>

                {/* Variance Highlight Box */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">System Expected</span>
                    <p className="text-sm font-bold text-zinc-200">
                      Rs. {reconciledShift.expected_cash?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Counted Cash</span>
                    <p className="text-sm font-bold text-zinc-200">
                      Rs. {reconciledShift.closing_cash_counted?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Reconciliation Variance</span>
                    <p className={`text-sm font-extrabold ${
                      (reconciledShift.variance || 0) === 0 
                        ? "text-emerald-400" 
                        : (reconciledShift.variance || 0) > 0 
                        ? "text-blue-400" 
                        : "text-rose-400"
                    }`}>
                      {(reconciledShift.variance || 0) > 0 ? "+" : ""}Rs. {reconciledShift.variance?.toLocaleString()}
                      {(reconciledShift.variance || 0) === 0 ? " (Balanced)" : (reconciledShift.variance || 0) > 0 ? " (Overage)" : " (Shortage)"}
                    </p>
                  </div>
                </div>

                {reconciledShift.variance_notes && (
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-left text-xs text-zinc-300">
                    <span className="font-bold text-zinc-500">Cashier Note: </span>
                    {reconciledShift.variance_notes}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-3">
                  <Button
                    onClick={() => setShowReceipt(true)}
                    className="bg-[#c87740] hover:bg-[#b06530] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Shift Thermal Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReconciledShift(null);
                      setActiveShift(null);
                    }}
                    className="border-zinc-700 text-zinc-300 hover:text-white text-xs h-10 px-4 rounded-xl"
                  >
                    Start New Shift
                  </Button>
                </div>
              </div>
            ) : !activeShift ? (
              /* Case 2: No Active Shift -> Open Shift Form */
              <div className="space-y-5 py-2">
                <div className="p-4 rounded-xl bg-[#c87740]/10 border border-[#c87740]/20 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-[#c87740] shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 space-y-1">
                    <p className="font-bold text-[#fdf6e3]">No Shift Currently Active</p>
                    <p className="text-zinc-400 leading-relaxed">
                      To start taking orders and accepting cash payments, enter the opening cash float in the cash drawer.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#fdf6e3] uppercase tracking-wider">
                    Opening Cash Float (Rs.)
                  </label>
                  <Input
                    type="number"
                    value={startingFloatInput}
                    onChange={(e) => setStartingFloatInput(e.target.value)}
                    placeholder="e.g. 5000"
                    className="bg-zinc-950 border-zinc-800 text-lg font-mono font-bold text-[#fdf6e3] h-12 rounded-xl focus:border-[#c87740]"
                  />

                  {/* Quick float amounts */}
                  <div className="flex gap-2 pt-1">
                    {[2000, 5000, 10000, 15000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setStartingFloatInput(amt.toString())}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          startingFloatInput === amt.toString()
                            ? "bg-[#c87740] text-white border-[#c87740]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Rs. {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleOpenShift}
                    className="w-full bg-[#c87740] hover:bg-[#b06530] text-white font-bold text-sm h-11 rounded-xl shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Open Shift &amp; Unlock Register</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Case 3: Shift is Active -> Navigation Tabs + Views */
              <div className="space-y-4">
                {/* Navigation Bar inside Modal */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === "overview"
                        ? "bg-[#c87740] text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Drawer Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("drop")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === "drop"
                        ? "bg-[#c87740] text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <ArrowDownCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Safe Drop</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("payout")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === "payout"
                        ? "bg-[#c87740] text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <ArrowUpCircle className="h-3.5 w-3.5 text-rose-400" />
                    <span>Petty Payout</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("add_float")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === "add_float"
                        ? "bg-[#c87740] text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Add Float</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("log")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === "log"
                        ? "bg-[#c87740] text-white shadow-xs font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Drawer Logs</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("close")}
                    className={`ml-auto px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      activeTab === "close"
                        ? "bg-rose-600 text-white shadow-xs font-bold"
                        : "text-rose-400 hover:bg-rose-500/10"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Close Shift</span>
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Live Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Opening Float</span>
                        <p className="text-base font-extrabold text-[#fdf6e3] font-mono">
                          Rs. {activeShift.summary.starting_cash.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-zinc-400">At shift start</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Cash Sales</span>
                        <p className="text-base font-extrabold text-emerald-400 font-mono">
                          +Rs. {activeShift.summary.cash_sales.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-zinc-400">{activeShift.summary.order_count} orders total</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Drops &amp; Payouts</span>
                        <p className="text-base font-extrabold text-rose-400 font-mono">
                          -Rs. {(activeShift.summary.cash_drops + activeShift.summary.cash_payouts).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-zinc-400">
                          {activeShift.cash_transactions.length} movements
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#c87740]/15 border border-[#c87740]/30 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#c87740]">Live Drawer Cash</span>
                        <p className="text-base font-black text-[#fdf6e3] font-mono">
                          Rs. {activeShift.summary.expected_cash_in_drawer.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-[#d8c3a5]">Expected in drawer</span>
                      </div>
                    </div>

                    {/* Secondary Metrics: Card / Online / Total */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-zinc-500 text-[11px]">Card Sales: </span>
                          <span className="font-bold text-zinc-200">Rs. {activeShift.summary.card_sales.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[11px]">Online/QR: </span>
                          <span className="font-bold text-zinc-200">Rs. {activeShift.summary.online_sales.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[11px]">Total Shift Sales: </span>
                          <span className="font-bold text-[#c87740]">Rs. {activeShift.summary.total_sales.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={loadShift}
                        className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center space-x-1 text-[11px]"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("drop")}
                        className="bg-zinc-950 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 text-zinc-200 h-12 rounded-xl flex items-center justify-center space-x-2 text-xs"
                      >
                        <ArrowDownCircle className="h-4 w-4 text-amber-400" />
                        <span>Safe Cash Drop</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("payout")}
                        className="bg-zinc-950 border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 text-zinc-200 h-12 rounded-xl flex items-center justify-center space-x-2 text-xs"
                      >
                        <ArrowUpCircle className="h-4 w-4 text-rose-400" />
                        <span>Petty Cash Payout</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("close")}
                        className="bg-zinc-950 border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 text-rose-400 h-12 rounded-xl flex items-center justify-center space-x-2 text-xs sm:col-span-1 col-span-2"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Close &amp; Reconcile Shift</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 2: SAFE CASH DROP */}
                {activeTab === "drop" && (
                  <div className="space-y-4 py-2">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      Transfer excess cash from register to the safe or bank deposit bag to reduce cash-at-hand liability.
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">Amount to Drop (Rs.)</label>
                        <Input
                          type="number"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          className="bg-zinc-950 border-zinc-800 font-mono font-bold text-white mt-1 h-11 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">Reason / Safe Bag Slip #</label>
                        <Input
                          type="text"
                          value={txReason}
                          onChange={(e) => setTxReason(e.target.value)}
                          placeholder="e.g. Safe deposit bag #104 / excess cash transfer"
                          className="bg-zinc-950 border-zinc-800 text-white mt-1 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleRecordTransaction("drop")}
                        disabled={txSubmitting || !txAmount || !txReason}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        {txSubmitting ? "Recording..." : "Confirm Cash Drop"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("overview")}
                        className="border-zinc-800 text-zinc-400 hover:text-white text-xs h-10 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 3: PETTY CASH PAYOUT */}
                {activeTab === "payout" && (
                  <div className="space-y-4 py-2">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                      Pay small store operational expenses (e.g. milk, ice cubes, cleaning materials, courier delivery).
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">Payout Amount (Rs.)</label>
                        <Input
                          type="number"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          placeholder="e.g. 450"
                          className="bg-zinc-950 border-zinc-800 font-mono font-bold text-white mt-1 h-11 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">Expense Purpose / Recipient</label>
                        <Input
                          type="text"
                          value={txReason}
                          onChange={(e) => setTxReason(e.target.value)}
                          placeholder="e.g. Purchased 2 ice blocks from vendor"
                          className="bg-zinc-950 border-zinc-800 text-white mt-1 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleRecordTransaction("payout")}
                        disabled={txSubmitting || !txAmount || !txReason}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        {txSubmitting ? "Recording..." : "Record Petty Payout"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("overview")}
                        className="border-zinc-800 text-zinc-400 hover:text-white text-xs h-10 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 4: ADD FLOAT */}
                {activeTab === "add_float" && (
                  <div className="space-y-4 py-2">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      Inject extra change or currency bills from the safe into the cash drawer mid-shift.
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-300">Float Amount to Add (Rs.)</label>
                        <Input
                          type="number"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          placeholder="e.g. 3000"
                          className="bg-zinc-950 border-zinc-800 font-mono font-bold text-white mt-1 h-11 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300">Reason / Denominations Added</label>
                        <Input
                          type="text"
                          value={txReason}
                          onChange={(e) => setTxReason(e.target.value)}
                          placeholder="e.g. Change bills (Rs. 100 and Rs. 50 notes)"
                          className="bg-zinc-950 border-zinc-800 text-white mt-1 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleRecordTransaction("add_float")}
                        disabled={txSubmitting || !txAmount || !txReason}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        {txSubmitting ? "Recording..." : "Add Cash to Drawer"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("overview")}
                        className="border-zinc-800 text-zinc-400 hover:text-white text-xs h-10 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 5: DRAWER LOGS */}
                {activeTab === "log" && (
                  <div className="space-y-3 py-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Recorded Drawer Movements</span>
                      <span>{activeShift.cash_transactions.length} records</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {activeShift.cash_transactions.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-xs">
                          No cash drops or payouts recorded in this shift yet.
                        </div>
                      ) : (
                        activeShift.cash_transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tx.type === "drop"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : tx.type === "payout"
                                    ? "bg-rose-500/20 text-rose-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}>
                                  {tx.type === "drop" ? "SAFE DROP" : tx.type === "payout" ? "PAYOUT" : "FLOAT ADD"}
                                </span>
                                <span className="text-zinc-200 font-semibold">{tx.reason}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500">
                                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • By {tx.performed_by}
                              </p>
                            </div>
                            <span className={`font-mono font-bold text-sm ${
                              tx.type === "add_float" ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {tx.type === "add_float" ? "+" : "-"}Rs. {tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: CLOSE SHIFT (BLIND COUNT) */}
                {activeTab === "close" && (
                  <div className="space-y-4 py-1">
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#fdf6e3]">Blind Shift Reconciliation</span>
                        <button
                          type="button"
                          onClick={() => setDenomMode(!denomMode)}
                          className="text-[11px] text-[#c87740] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Calculator className="h-3 w-3" />
                          <span>{denomMode ? "Direct Total Mode" : "Denominations Breakdown"}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Count the physical cash currently inside your cash drawer and enter it below. The expected balance will be cross-checked automatically to record any overage or shortage.
                      </p>
                    </div>

                    {denomMode ? (
                      /* Denominations Counter Grid */
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Bill Breakdown</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[5000, 1000, 500, 100, 50, 20, 10, 1].map((val) => (
                            <div key={val} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                              <span className="text-[10px] font-bold text-zinc-400">
                                {val === 1 ? "Coins" : `Rs. ${val}`}
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={denoms[val] || ""}
                                onChange={(e) => setDenoms({ ...denoms, [val]: parseInt(e.target.value, 10) || 0 })}
                                placeholder="0"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-center font-mono font-bold text-white text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <label className="text-xs font-bold text-zinc-300">
                        Total Physical Cash Counted (Rs.)
                      </label>
                      <Input
                        type="number"
                        value={countedCashInput}
                        onChange={(e) => setCountedCashInput(e.target.value)}
                        placeholder="e.g. 14500"
                        className="bg-zinc-950 border-zinc-800 font-mono font-black text-xl text-emerald-400 mt-1 h-12 rounded-xl focus:border-[#c87740]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">
                        Closing Remarks / Discrepancy Explanation (Optional)
                      </label>
                      <Input
                        type="text"
                        value={varianceNotesInput}
                        onChange={(e) => setVarianceNotesInput(e.target.value)}
                        placeholder="e.g. Minor shortage due to coin change roundings"
                        className="bg-zinc-950 border-zinc-800 text-white mt-1 h-10 rounded-xl"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleCloseShift}
                        disabled={isClosing || countedCashInput === ""}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 rounded-xl shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Lock className="h-4 w-4" />
                        <span>{isClosing ? "Reconciling..." : "Reconcile & Finalize Shift Close"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("overview")}
                        className="border-zinc-800 text-zinc-400 hover:text-white text-xs h-11 rounded-xl"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {reconciledShift && (
        <ShiftReceiptModal
          shift={reconciledShift}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
