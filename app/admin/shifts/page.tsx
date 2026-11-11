"use client";

import { useEffect, useState } from "react";
import { 
  getShiftHistory, 
  POSShift, 
  POSCashTransaction 
} from "@/lib/pos-data";
import { 
  Banknote, 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Filter,
  Lock,
  Unlock,
  RefreshCw,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShiftReceiptModal } from "@/components/shift-receipt-modal";

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState<POSShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed" | "variance">("all");
  const [selectedShiftForReceipt, setSelectedShiftForReceipt] = useState<POSShift | null>(null);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState<POSShift | null>(null);

  const fetchShifts = async () => {
    setLoading(true);
    const data = await getShiftHistory();
    setShifts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const filteredShifts = shifts.filter((s) => {
    const matchesSearch =
      s.cashier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shift_number.toString().includes(searchQuery) ||
      (s.variance_notes && s.variance_notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "open") return s.status === "open";
    if (statusFilter === "closed") return s.status === "closed";
    if (statusFilter === "variance") return s.variance !== null && s.variance !== 0;

    return true;
  });

  // Aggregate Metrics
  const activeDrawersCount = shifts.filter((s) => s.status === "open").length;
  const activeDrawerCash = shifts
    .filter((s) => s.status === "open")
    .reduce((sum, s) => sum + (s.summary?.expected_cash_in_drawer || s.starting_cash), 0);

  const closedShifts = shifts.filter((s) => s.status === "closed");
  const totalReconciledCash = closedShifts.reduce((sum, s) => sum + (s.closing_cash_counted || 0), 0);
  const netVariance = closedShifts.reduce((sum, s) => sum + (s.variance || 0), 0);
  const totalSafeDrops = shifts.reduce((sum, s) => sum + (s.summary?.cash_drops || 0), 0);

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#c87740]/20 border border-[#c87740]/30 flex items-center justify-center text-[#c87740]">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#fdf6e3] tracking-tight">
                Cash Shifts &amp; Drawer Reconciliation
              </h1>
              <p className="text-xs text-zinc-400">
                Audit cashier opening floats, mid-shift safe drops, petty expenses, and blind closure variances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchShifts}
            className="border-zinc-800 bg-[#171b13] text-zinc-300 hover:text-white text-xs h-9 px-3 rounded-xl shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-[#c87740]" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* KPI Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Register Drawers */}
        <Card className="bg-[#171b13] border-zinc-800 p-4 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Drawers</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Unlock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#fdf6e3] font-mono">
              Rs. {activeDrawerCash.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {activeDrawersCount} live open register{activeDrawersCount === 1 ? "" : "s"}
            </p>
          </div>
        </Card>

        {/* Card 2: Reconciled Cash Settled */}
        <Card className="bg-[#171b13] border-zinc-800 p-4 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reconciled Cash</span>
            <div className="h-8 w-8 rounded-lg bg-[#c87740]/20 text-[#c87740] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#fdf6e3] font-mono">
              Rs. {totalReconciledCash.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Across {closedShifts.length} closed shifts
            </p>
          </div>
        </Card>

        {/* Card 3: Net Reconciliation Variance */}
        <Card className="bg-[#171b13] border-zinc-800 p-4 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Variance Audit</span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              netVariance === 0 
                ? "bg-emerald-500/20 text-emerald-400" 
                : netVariance > 0 
                ? "bg-blue-500/20 text-blue-400" 
                : "bg-rose-500/20 text-rose-400"
            }`}>
              {netVariance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black font-mono ${
              netVariance === 0 ? "text-emerald-400" : netVariance > 0 ? "text-blue-400" : "text-rose-400"
            }`}>
              {netVariance > 0 ? "+" : ""}Rs. {netVariance.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {netVariance === 0 ? "Zero discrepancies" : netVariance > 0 ? "Net drawer overage" : "Net drawer shortage"}
            </p>
          </div>
        </Card>

        {/* Card 4: Safe Drops / Bank Deposits */}
        <Card className="bg-[#171b13] border-zinc-800 p-4 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Safe Drops / Transfers</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#fdf6e3] font-mono">
              Rs. {totalSafeDrops.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Safely banked from registers
            </p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#171b13] border border-zinc-800 p-3 rounded-2xl shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by cashier name, shift #, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800 text-xs h-9 rounded-xl focus:border-[#c87740]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "open", "closed", "variance"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === mode
                  ? "bg-[#c87740] text-white shadow-xs font-bold"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {mode === "all"
                ? "All Shifts"
                : mode === "open"
                ? "Open Live"
                : mode === "closed"
                ? "Closed Shifts"
                : "Discrepancies"}
            </button>
          ))}
        </div>
      </div>

      {/* Shifts Audit Table */}
      <Card className="bg-[#171b13] border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-black/40 backdrop-blur-md text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-bold">
              <tr>
                <th className="px-4 py-3.5">Shift #</th>
                <th className="px-4 py-3.5">Cashier</th>
                <th className="px-4 py-3.5">Period (Open / Close)</th>
                <th className="px-4 py-3.5">Opening Float</th>
                <th className="px-4 py-3.5">Shift Revenue</th>
                <th className="px-4 py-3.5">Safe Drops &amp; Out</th>
                <th className="px-4 py-3.5">Expected Cash</th>
                <th className="px-4 py-3.5">Counted Cash</th>
                <th className="px-4 py-3.5">Variance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-zinc-500 text-xs">
                    No shift records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift) => {
                  const isClosed = shift.status === "closed";
                  const variance = shift.variance ?? (
                    isClosed && shift.closing_cash_counted !== null
                      ? shift.closing_cash_counted - (shift.summary?.expected_cash_in_drawer || 0)
                      : null
                  );

                  return (
                    <tr
                      key={shift.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Shift Number */}
                      <td className="px-4 py-3 font-mono font-bold text-[#fdf6e3]">
                        #{shift.shift_number}
                      </td>

                      {/* Cashier */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100">{shift.cashier_name}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {shift.cashier_id.slice(0, 8)}</span>
                      </td>

                      {/* Period */}
                      <td className="px-4 py-3 space-y-0.5 text-[11px]">
                        <div className="flex items-center space-x-1 text-zinc-300">
                          <Clock className="h-3 w-3 text-[#c87740]" />
                          <span>{new Date(shift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(shift.opened_at).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>
                        </div>
                        {shift.closed_at ? (
                          <div className="text-zinc-500 text-[10px]">
                            Closed: {new Date(shift.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">Running live</span>
                        )}
                      </td>

                      {/* Opening Float */}
                      <td className="px-4 py-3 font-mono">
                        Rs. {shift.starting_cash.toLocaleString()}
                      </td>

                      {/* Total Sales */}
                      <td className="px-4 py-3 space-y-0.5">
                        <div className="font-mono font-bold text-zinc-200">
                          Rs. {shift.summary?.total_sales.toLocaleString() || 0}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Cash: Rs. {shift.summary?.cash_sales.toLocaleString()}
                        </div>
                      </td>

                      {/* Drops & Payouts */}
                      <td className="px-4 py-3 space-y-0.5">
                        <div className="text-amber-400 font-mono text-[11px]">
                          Drops: -Rs. {shift.summary?.cash_drops.toLocaleString() || 0}
                        </div>
                        {shift.summary?.cash_payouts > 0 && (
                          <div className="text-rose-400 font-mono text-[10px]">
                            Payouts: -Rs. {shift.summary.cash_payouts.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Expected Cash in Drawer */}
                      <td className="px-4 py-3 font-mono font-bold text-zinc-200">
                        Rs. {(shift.summary?.expected_cash_in_drawer || shift.expected_cash || 0).toLocaleString()}
                      </td>

                      {/* Counted Cash */}
                      <td className="px-4 py-3 font-mono font-bold">
                        {shift.closing_cash_counted !== null ? (
                          <span className="text-zinc-100">
                            Rs. {shift.closing_cash_counted.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">Uncounted</span>
                        )}
                      </td>

                      {/* Variance */}
                      <td className="px-4 py-3 font-mono font-bold whitespace-nowrap min-w-[130px]">
                        {variance === null ? (
                          <span className="text-zinc-500">—</span>
                        ) : variance === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shadow-xs">
                            Rs. 0 (Balanced)
                          </span>
                        ) : variance > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap shadow-xs">
                            +Rs. {variance.toLocaleString()} (Over)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap shadow-xs">
                            -Rs. {Math.abs(variance).toLocaleString()} (Short)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {shift.status === "open" ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            Live Open
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-bold">
                            Closed
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedShiftForDetails(shift)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Inspect Shift Movements"
                          >
                            <Eye className="h-4 w-4 text-[#c87740]" />
                          </button>
                          <button
                            onClick={() => setSelectedShiftForReceipt(shift)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Print 80mm Thermal Shift Report"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal 1: Shift Drawer Movements Details */}
      {selectedShiftForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all rounded-2xl shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-[#c87740]" />
                <h3 className="text-base font-bold text-[#fdf6e3]">
                  Shift #{selectedShiftForDetails.shift_number} Movement Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedShiftForDetails(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Cashier</span>
                <p className="font-bold text-zinc-200 mt-0.5">{selectedShiftForDetails.cashier_name}</p>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Duration</span>
                <p className="font-bold text-zinc-200 mt-0.5">
                  {new Date(selectedShiftForDetails.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {selectedShiftForDetails.closed_at ? new Date(selectedShiftForDetails.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                </p>
              </div>
            </div>

            {/* Reconciliation Highlight */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Opening Cash Float:</span>
                <span className="font-mono font-bold text-zinc-200">Rs. {selectedShiftForDetails.starting_cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">(+) Cash Inflow from Orders:</span>
                <span className="font-mono font-bold text-emerald-400">+Rs. {selectedShiftForDetails.summary?.cash_sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">(-) Total Safe Drops:</span>
                <span className="font-mono font-bold text-amber-400">-Rs. {selectedShiftForDetails.summary?.cash_drops.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">(-) Petty Cash Expenses:</span>
                <span className="font-mono font-bold text-rose-400">-Rs. {selectedShiftForDetails.summary?.cash_payouts.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm">
                <span className="text-[#fdf6e3]">Expected in Drawer:</span>
                <span className="font-mono text-[#c87740]">
                  Rs. {(selectedShiftForDetails.summary?.expected_cash_in_drawer || selectedShiftForDetails.expected_cash || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* List of Transactions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Drops, Payouts &amp; Additions Log ({selectedShiftForDetails.cash_transactions.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {selectedShiftForDetails.cash_transactions.length === 0 ? (
                  <p className="text-zinc-500 italic text-center py-4">No drawer movements in this shift.</p>
                ) : (
                  selectedShiftForDetails.cash_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-lg glass-surface-card/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200">
                          {tx.type === "drop" ? "[SAFE DROP] " : tx.type === "payout" ? "[PAYOUT] " : "[FLOAT ADD] "}
                          {tx.reason}
                        </span>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Recorded by {tx.performed_by}
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${
                        tx.type === "add_float" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {tx.type === "add_float" ? "+" : "-"}Rs. {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedShiftForDetails.variance_notes && (
              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                <span className="font-bold text-zinc-400">Cashier Remarks: </span>
                {selectedShiftForDetails.variance_notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                onClick={() => {
                  setSelectedShiftForReceipt(selectedShiftForDetails);
                  setSelectedShiftForDetails(null);
                }}
                className="bg-[#c87740] hover:bg-[#b06530] text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center space-x-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Thermal Slip</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedShiftForDetails(null)}
                className="border-zinc-800 text-zinc-400 hover:text-white text-xs h-9 px-4 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Printable 80mm Thermal Report */}
      {selectedShiftForReceipt && (
        <ShiftReceiptModal
          shift={selectedShiftForReceipt}
          isOpen={!!selectedShiftForReceipt}
          onClose={() => setSelectedShiftForReceipt(null)}
        />
      )}
    </div>
  );
}

