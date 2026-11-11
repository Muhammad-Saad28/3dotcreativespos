"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  getPOSPurchases,
  createPOSPurchase,
  getPOSPurchaseReturns,
  createPOSPurchaseReturn,
  getPOSVendors,
} from "@/lib/pos-v2-data";
import { getPOSMenuItems, POSMenuItem } from "@/lib/pos-data";
import { POSPurchase, POSPurchaseReturn, POSVendor, POSPurchaseItem } from "@/lib/pos-data";
import { Truck, Plus, Search, RotateCcw, Package, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "returns" | "product_history">("purchases");
  const [purchases, setPurchases] = useState<POSPurchase[]>([]);
  const [returns, setReturns] = useState<POSPurchaseReturn[]>([]);
  const [vendors, setVendors] = useState<POSVendor[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // New Purchase Modal
  const [newPurchaseModal, setNewPurchaseModal] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [purchaseRemarks, setPurchaseRemarks] = useState("");
  const [purchaseCart, setPurchaseCart] = useState<POSPurchaseItem[]>([]);

  // Item builder inside Purchase modal
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemCost, setItemCost] = useState<number>(0);

  // New Purchase Return Modal
  const [returnModal, setReturnModal] = useState(false);
  const [targetPurchaseId, setTargetPurchaseId] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnAmount, setReturnAmount] = useState<number>(0);

  const loadData = async () => {
    const [purch, rets, vends, items] = await Promise.all([
      getPOSPurchases(),
      getPOSPurchaseReturns(),
      getPOSVendors(),
      getPOSMenuItems(),
    ]);
    setPurchases(purch);
    setReturns(rets);
    setVendors(vends);
    setMenuItems(items);
    if (vends.length > 0 && !vendorId) setVendorId(vends[0].id);
    if (items.length > 0 && !selectedProductId) setSelectedProductId(items[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItemToCart = () => {
    const prod = menuItems.find(m => m.id === selectedProductId);
    if (!prod || itemQty <= 0 || itemCost <= 0) return;
    const item: POSPurchaseItem = {
      id: `pi_${Date.now()}`,
      product_id: prod.id,
      product_name: prod.name,
      product_code: prod.code || "PROD",
      quantity: itemQty,
      unit_cost: itemCost,
      total_cost: itemQty * itemCost,
    };
    setPurchaseCart(prev => [...prev, item]);
    setItemQty(1);
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseCart.length === 0) {
      alert("Please add at least one product item to the purchase invoice.");
      return;
    }
    const vend = vendors.find(v => v.id === vendorId);
    const totalCost = purchaseCart.reduce((sum, i) => sum + i.total_cost, 0);

    await createPOSPurchase({
      invoice_no: purchaseInvoiceNo || `PUR-${Date.now().toString().slice(-5)}`,
      vendor_id: vendorId,
      vendor_name: vend?.name || "Direct Vendor",
      total_amount: totalCost,
      paid_amount: paidAmount,
      balance_amount: Math.max(0, totalCost - paidAmount),
      payment_method: paymentMethod,
      status: paidAmount >= totalCost ? "received" : "partial",
      remarks: purchaseRemarks,
      items: purchaseCart,
    });

    setNewPurchaseModal(false);
    setPurchaseCart([]);
    setPaidAmount(0);
    setPurchaseRemarks("");
    loadData();
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = purchases.find(p => p.id === targetPurchaseId);
    if (!target) return;

    await createPOSPurchaseReturn({
      purchase_id: target.id,
      purchase_invoice_no: target.invoice_no,
      vendor_id: target.vendor_id,
      vendor_name: target.vendor_name,
      total_returned_amount: returnAmount || target.total_amount,
      reason: returnReason || "Defective stock rejection",
    });

    setReturnModal(false);
    setReturnReason("");
    setReturnAmount(0);
    loadData();
  };

  const totalPurchaseSum = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalReturnSum = returns.reduce((sum, r) => sum + (r.total_returned_amount || 0), 0);

  // Flattened product purchase history
  const productPurchaseHistory = purchases.flatMap(p =>
    (p.items || []).map(item => ({
      ...item,
      invoice_no: p.invoice_no,
      vendor_name: p.vendor_name,
      purchase_date: p.purchase_date,
    }))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Kitchen Supply Inward & Invoices</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Procurement</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Record goods receiving, purchase invoices, and supplier return workflows</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setReturnModal(true)}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-rose-300 hover:text-white h-9 px-3 rounded-xl text-xs"
          >
            <RotateCcw className="h-4 w-4 mr-1 text-rose-400" />
            <span>Purchase Return</span>
          </Button>

          <Button
            onClick={() => {
              setPurchaseInvoiceNo(`PUR-${Date.now().toString().slice(-5)}`);
              setNewPurchaseModal(true);
            }}
            className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Purchase</span>
          </Button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Purchases Amount</span>
          <div className="text-2xl font-black text-[#c87740] mt-1">Rs. {totalPurchaseSum.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Purchase Returns Total</span>
          <div className="text-2xl font-black text-rose-400 mt-1">Rs. {totalReturnSum.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Purchase Bills</span>
          <div className="text-2xl font-black text-[#fdf6e3] mt-1">{purchases.length} recorded</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "purchases"
              ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Purchase History ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab("returns")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "returns"
              ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Purchase Return History ({returns.length})
        </button>
        <button
          onClick={() => setActiveTab("product_history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "product_history"
              ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Product Purchase History ({productPurchaseHistory.length})
        </button>
      </div>

      {/* Purchase Invoices View */}
      {activeTab === "purchases" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#383e29]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Invoice # / Date</th>
                <th className="p-3">Vendor / Supplier</th>
                <th className="p-3">Items Included</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Paid / Balance</th>
                <th className="p-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {purchases.map((pur) => (
                <tr key={pur.id} className="hover:bg-zinc-800/30">
                  <td className="p-3">
                    <span className="font-mono font-bold text-[#c87740]">{pur.invoice_no}</span>
                    <span className="block text-[10px] text-zinc-500">{pur.purchase_date}</span>
                  </td>
                  <td className="p-3 font-bold text-white">{pur.vendor_name}</td>
                  <td className="p-3 text-zinc-300">
                    {pur.items?.map(i => `${i.product_name} (${i.quantity}x)`).join(", ") || "General Stock"}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-zinc-700">
                      {pur.payment_method}
                    </Badge>
                  </td>
                  <td className="p-3 text-[11px]">
                    <span className="text-emerald-400 font-mono">Paid: Rs. {pur.paid_amount}</span>
                    {pur.balance_amount > 0 && (
                      <span className="block text-rose-400 font-mono font-bold">Bal: Rs. {pur.balance_amount}</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-[#c87740] text-sm">
                    Rs. {(pur.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Purchase Returns View */}
      {activeTab === "returns" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#383e29]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Return # / Date</th>
                <th className="p-3">Orig. Purchase Invoice</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Reason</th>
                <th className="p-3 text-right">Refunded Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-zinc-800/30">
                  <td className="p-3">
                    <span className="font-mono font-bold text-rose-400">{ret.return_no}</span>
                    <span className="block text-[10px] text-zinc-500">{ret.return_date}</span>
                  </td>
                  <td className="p-3 font-mono text-zinc-300">{ret.purchase_invoice_no}</td>
                  <td className="p-3 font-bold text-white">{ret.vendor_name}</td>
                  <td className="p-3 text-zinc-400">{ret.reason}</td>
                  <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">
                    Rs. {(ret.total_returned_amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-zinc-500">No purchase returns on record.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Purchase History View */}
      {activeTab === "product_history" && (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#383e29]/60 shadow-lg">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product Name & Code</th>
                <th className="p-3">Purchase Date</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {productPurchaseHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30">
                  <td className="p-3">
                    <span className="font-bold text-white">{item.product_name}</span>
                    <span className="block font-mono text-[10px] text-zinc-500">{item.product_code || "N/A"}</span>
                  </td>
                  <td className="p-3 font-mono">{item.purchase_date}</td>
                  <td className="p-3 text-zinc-300">{item.vendor_name}</td>
                  <td className="p-3 font-bold text-white">{item.quantity} units</td>
                  <td className="p-3 font-mono">Rs. {item.unit_cost}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400">
                    Rs. {item.total_cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Purchase */}
      <Modal isOpen={newPurchaseModal} onClose={() => setNewPurchaseModal(false)} title="Create Purchase Bill">
        <form onSubmit={handleCreatePurchase} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Purchase Invoice #"
              value={purchaseInvoiceNo}
              onChange={(e) => setPurchaseInvoiceNo(e.target.value)}
              required
              className="text-xs"
            />
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Vendor / Supplier</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.company_name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Product Line Section */}
          <div className="p-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all rounded-xl space-y-2">
            <span className="text-xs font-bold text-zinc-300 block">Add Product Item to Bill</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <label className="text-[10px] text-zinc-400 block mb-0.5">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = menuItems.find(m => m.id === e.target.value);
                    if (p?.cost_price) setItemCost(p.cost_price);
                  }}
                  className="w-full glass-surface-card rounded-lg px-2 py-1.5 text-xs text-white focus:outline-hidden"
                >
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code || "Code"})</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="text-[10px] text-zinc-400 block mb-0.5">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(parseFloat(e.target.value) || 1)}
                  className="w-full glass-surface-card rounded-lg px-2 py-1 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-400 block mb-0.5">Cost/Unit</label>
                <input
                  type="number"
                  min="0"
                  value={itemCost}
                  onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                  className="w-full glass-surface-card rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddItemToCart}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs h-8"
                >
                  + Add
                </Button>
              </div>
            </div>

            {/* Added Items List */}
            {purchaseCart.length > 0 && (
              <div className="divide-y divide-zinc-800 pt-2 text-xs">
                {purchaseCart.map((c, idx) => (
                  <div key={idx} className="py-1 flex items-center justify-between">
                    <span>{c.product_name} ({c.quantity}x @ Rs. {c.unit_cost})</span>
                    <span className="font-mono font-bold text-emerald-400">Rs. {c.total_cost}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-bold">
                  <span>Grand Total Cost:</span>
                  <span className="text-[#c87740]">Rs. {purchaseCart.reduce((sum, i) => sum + i.total_cost, 0)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Amount Paid Upfront (Rs.)"
              type="number"
              value={paidAmount || ""}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="text-xs"
            />
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Save Purchase & Update Stock
          </Button>
        </form>
      </Modal>

      {/* Modal: Purchase Return */}
      <Modal isOpen={returnModal} onClose={() => setReturnModal(false)} title="Record Purchase Return">
        <form onSubmit={handleCreateReturn} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Select Purchase Invoice to Return</label>
            <select
              value={targetPurchaseId}
              onChange={(e) => {
                setTargetPurchaseId(e.target.value);
                const p = purchases.find(x => x.id === e.target.value);
                if (p) setReturnAmount(p.total_amount);
              }}
              className="w-full glass-surface-card rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
              required
            >
              <option value="">Select Invoice...</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>{p.invoice_no} — {p.vendor_name} (Rs. {p.total_amount})</option>
              ))}
            </select>
          </div>

          <Input
            label="Refund / Returned Amount (Rs.)"
            type="number"
            value={returnAmount || ""}
            onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
            required
            className="text-xs font-bold text-rose-400"
          />

          <Input
            label="Return Reason"
            placeholder="e.g. Broken vacuum seal, expired ingredients..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            required
            className="text-xs"
          />

          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-9 text-xs">
            Submit Purchase Return & Adjust Vendor Balance
          </Button>
        </form>
      </Modal>
    </div>
  );
}

