"use client";

import React, { useRef } from "react";
import { POSShift } from "@/lib/pos-data";
import { Printer, X, CheckCircle2, AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShiftReceiptModalProps {
  shift: POSShift;
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftReceiptModal({ shift, isOpen, onClose }: ShiftReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !shift) return null;

  const handlePrint = () => {
    window.print();
  };

  const openedDate = new Date(shift.opened_at);
  const closedDate = shift.closed_at ? new Date(shift.closed_at) : new Date();
  const durationMs = closedDate.getTime() - openedDate.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  const variance = shift.variance !== null && shift.variance !== undefined ? shift.variance : (
    (shift.closing_cash_counted || 0) - (shift.summary?.expected_cash_in_drawer || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center space-x-2">
            <Printer className="h-4 w-4 text-[#c87740]" />
            <span className="text-xs font-bold text-[#fdf6e3] uppercase tracking-wider">
              Shift Closure Report #{shift.shift_number}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800">
          <div className="text-[11px] text-zinc-400 font-mono">
            80mm Standard Thermal Slip
          </div>
          <Button
            onClick={handlePrint}
            className="bg-[#c87740] hover:bg-[#b06530] text-white font-bold text-xs h-8 px-4 rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report (Ctrl+P)</span>
          </Button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
          <div
            ref={receiptRef}
            id="printable-shift-receipt"
            className="w-full max-w-[340px] mx-auto bg-white text-zinc-900 p-5 rounded-lg shadow-inner font-mono text-[12px] leading-relaxed border border-zinc-300"
          >
            {/* Business Logo & Header */}
            <div className="text-center pb-3 border-b border-dashed border-zinc-400 space-y-1">
              <div className="flex justify-center mb-1">
                <img src="/logo.png" alt="3Dot Creatives" className="h-10 w-10 object-contain" />
              </div>
              <h2 className="text-sm font-black tracking-tight text-zinc-900 uppercase">
                3DOT CREATIVES
              </h2>
              <p className="text-[10px] text-zinc-600 font-sans font-semibold">
                RESTAURANT &amp; POS ECOSYSTEM
              </p>
              <div className="inline-block mt-1 px-2 py-0.5 bg-zinc-200 text-zinc-800 font-bold text-[10px] uppercase rounded">
                SHIFT CLOSURE REPORT
              </div>
            </div>

            {/* Shift Metadata */}
            <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-600">Shift Number:</span>
                <span className="font-bold">#{shift.shift_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Cashier:</span>
                <span className="font-bold">{shift.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Shift Started:</span>
                <span>{openedDate.toLocaleDateString()} {openedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Shift Ended:</span>
                <span>{closedDate.toLocaleDateString()} {closedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Duration:</span>
                <span className="font-bold">{durationHours}h {durationMinutes}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Orders Processed:</span>
                <span className="font-bold">{shift.summary.order_count}</span>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[11px]">
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-800 pb-1">
                Sales Summary
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Cash Sales:</span>
                <span className="font-semibold">Rs. {shift.summary.cash_sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Credit / Debit Card:</span>
                <span className="font-semibold">Rs. {shift.summary.card_sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Online / QR Payment:</span>
                <span className="font-semibold">Rs. {shift.summary.online_sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-200 font-bold text-[12px]">
                <span>Total Gross Sales:</span>
                <span>Rs. {shift.summary.total_sales.toLocaleString()}</span>
              </div>
            </div>

            {/* Cash Drawer Movements */}
            <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[11px]">
              <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-800 pb-1">
                Cash Drawer Movement
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">(+) Starting Float:</span>
                <span className="font-semibold">Rs. {shift.summary.starting_cash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">(+) Cash Inflow (Sales):</span>
                <span className="font-semibold">Rs. {shift.summary.cash_sales.toLocaleString()}</span>
              </div>
              {shift.summary.cash_additions > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>(+) Cash Added to Float:</span>
                  <span className="font-semibold">Rs. {shift.summary.cash_additions.toLocaleString()}</span>
                </div>
              )}
              {shift.summary.cash_drops > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>(-) Safe Drops (Transferred):</span>
                  <span className="font-semibold">-Rs. {shift.summary.cash_drops.toLocaleString()}</span>
                </div>
              )}
              {shift.summary.cash_payouts > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>(-) Petty Cash Payouts:</span>
                  <span className="font-semibold">-Rs. {shift.summary.cash_payouts.toLocaleString()}</span>
                </div>
              )}
              {shift.summary.cash_refunds > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>(-) Cash Refunds:</span>
                  <span className="font-semibold">-Rs. {shift.summary.cash_refunds.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Reconciliation Audit Result */}
            <div className="py-3 border-b border-dashed border-zinc-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold text-zinc-700">
                <span>Expected Cash in Drawer:</span>
                <span>Rs. {(shift.summary.expected_cash_in_drawer || shift.expected_cash || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-zinc-900 text-[13px]">
                <span>Counted Cash (Physical):</span>
                <span>Rs. {(shift.closing_cash_counted || 0).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between font-black text-[12px] p-1.5 rounded ${
                variance === 0 
                  ? "bg-emerald-100 text-emerald-800" 
                  : variance > 0 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-rose-100 text-rose-800"
              }`}>
                <span>Discrepancy / Variance:</span>
                <span>
                  {variance > 0 ? `+Rs. ${variance.toLocaleString()} (OVER)` : variance < 0 ? `-Rs. ${Math.abs(variance).toLocaleString()} (SHORT)` : "Rs. 0 (BALANCED)"}
                </span>
              </div>
              {shift.variance_notes && (
                <div className="text-[10px] text-zinc-600 italic pt-1">
                  Note: {shift.variance_notes}
                </div>
              )}
            </div>

            {/* Individual Cash Transactions Detail */}
            {shift.cash_transactions && shift.cash_transactions.length > 0 && (
              <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1 text-[10px]">
                <div className="font-bold uppercase tracking-wider text-zinc-700 pb-0.5">
                  Drawer Drops &amp; Payouts Log
                </div>
                {shift.cash_transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between text-zinc-600">
                    <span className="truncate max-w-[190px]">
                      {tx.type === "drop" ? "[DROP]" : tx.type === "payout" ? "[PAYOUT]" : "[FLOAT]"} {tx.reason}
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {tx.type === "add_float" ? "+" : "-"}Rs. {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div className="pt-6 pb-2 space-y-6 text-[10px]">
              <div className="flex justify-between items-end">
                <div className="border-t border-zinc-400 pt-1 w-32 text-center text-zinc-600">
                  Cashier Signature
                </div>
                <div className="border-t border-zinc-400 pt-1 w-32 text-center text-zinc-600">
                  Manager Approval
                </div>
              </div>
              <div className="text-center text-[9px] text-zinc-500 pt-2 border-t border-dashed border-zinc-300">
                Generated: {new Date().toLocaleString()} • 3Dot Creatives POS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
