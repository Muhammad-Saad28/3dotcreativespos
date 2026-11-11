"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/use-auth";
import { 
  getPOSMenuItems, 
  getPOSCategories, 
  getPOSTables, 
  createPOSOrder, 
  isPizzaItem,
  hasSmallPizzaSize,
  getPizzaSizes,
  PizzaSizeOption,
  POSMenuItem, 
  POSCategory, 
  POSTable,
  getMenuItemPortionAvailability
} from "@/lib/pos-data";
import {
  getPOSCustomers,
  savePOSCustomer,
  getHeldInvoices,
  saveHeldInvoice,
  removeHeldInvoice,
  HeldInvoice,
  POSCustomer
} from "@/lib/pos-v2-data";
import { playOrderNotificationSound } from "@/lib/sound";
import { PizzaSizeModal } from "@/components/pizza-size-modal";
import { ShiftModal } from "@/components/shift-modal";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard, 
  ShoppingBag, 
  Truck, 
  User, 
  CheckCircle2, 
  ArrowLeft,
  Utensils,
  Barcode,
  PauseCircle,
  FolderOpen,
  Printer,
  RotateCcw,
  Sliders,
  DollarSign,
  Package,
  Layers,
  Gauge,
  Banknote,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  item: POSMenuItem;
  quantity: number;
  discountPercent: number;
  size?: string;
  notes?: string;
}

export default function CashierPOSRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [tables, setTables] = useState<POSTable[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);

  // Order Context
  const [orderType, setOrderType] = useState<"takeaway" | "dine_in" | "delivery">("takeaway");
  const [selectedTableNum, setSelectedTableNum] = useState<number>(1);
  const [isWalkIn, setIsWalkIn] = useState<boolean>(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("cust_walkin");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [mileage, setMileage] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  // Product Selection & Barcode
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Billing & Calculations
  const [globalDiscountType, setGlobalDiscountType] = useState<"percentage" | "fixed">("fixed");
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [autoPrint, setAutoPrint] = useState<boolean>(true);

  // Modals & Panels
  const [pizzaModalItem, setPizzaModalItem] = useState<POSMenuItem | null>(null);
  const [heldInvoicesModal, setHeldInvoicesModal] = useState(false);
  const [heldList, setHeldList] = useState<HeldInvoice[]>([]);
  const [settingsModal, setSettingsModal] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Input refs for operational keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const amountPaidInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const refreshCore = async () => {
    const [c, m, t, custs] = await Promise.all([
      getPOSCategories(),
      getPOSMenuItems(),
      getPOSTables(),
      getPOSCustomers(),
    ]);
    setCategories(c);
    setMenuItems(m);
    setTables(t);
    setCustomers(custs);
    setHeldList(getHeldInvoices());
  };

  useEffect(() => {
    refreshCore();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("orderType") || params.get("type");
      const tableParam = params.get("table");
      if (typeParam === "dine_in" || typeParam === "takeaway" || typeParam === "delivery") {
        setOrderType(typeParam as any);
      }
      if (tableParam) {
        const num = parseInt(tableParam, 10);
        if (num >= 1 && num <= 6) {
          setSelectedTableNum(num);
          setOrderType("dine_in");
        }
      }
    }
  }, []);

  // Global Keyboard Shortcuts (F1, F3, Alt+P, Alt+C, Alt+D, Alt+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 -> Focus / Stay on Sale screen
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // F3 -> Navigate to Stock/Inventory
      if (e.key === "F3") {
        e.preventDefault();
        router.push("/admin/inventory");
      }
      // F8 -> Shift Management & Drawer Reconciliation
      if (e.key === "F8") {
        e.preventDefault();
        setShiftModalOpen(true);
      }
      // Alt + P -> Product Entry Search
      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Alt + C -> Product Code / Barcode Entry
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      // Alt + D -> Discount Entry
      if (e.altKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        discountInputRef.current?.focus();
      }
      // Alt + E -> Enter Amount / Payment Field
      if (e.altKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        amountPaidInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Handle Barcode/Product Code direct enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const query = barcodeInput.trim().toLowerCase();
    const matched = menuItems.find(
      (m) =>
        m.barcode?.toLowerCase() === query ||
        m.code?.toLowerCase() === query ||
        m.name.toLowerCase() === query
    );
    if (matched) {
      handleItemClick(matched);
      setBarcodeInput("");
    } else {
      alert(`No product matching code / barcode "${barcodeInput}" found.`);
    }
  };

  const handleItemClick = (item: POSMenuItem) => {
    const avail = getMenuItemPortionAvailability(item.id);
    if (!avail.isAvailable) {
      alert(`⚠️ Recipe Inventory Alert:\n\nCannot add "${item.name}" because kitchen raw ingredient "${avail.limitingIngredient}" is depleted (0 left).\n\nPlease replenish kitchen stock in Inventory (F3).`);
      return;
    }
    if (isPizzaItem(item)) {
      setPizzaModalItem(item);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: POSMenuItem, sizeOption?: PizzaSizeOption) => {
    setCart((prev) => {
      const cartKey = sizeOption ? `${item.id}_${sizeOption.size}` : item.id;
      const existing = prev.find((c) => c.id === cartKey);
      if (existing) {
        return prev.map((c) => (c.id === cartKey ? { ...c, quantity: c.quantity + 1 } : c));
      }

      const itemRecord: POSMenuItem = sizeOption
        ? {
            ...item,
            name: `${item.name} (${sizeOption.size})`,
            price: sizeOption.price,
          }
        : item;

      return [
        ...prev,
        {
          id: cartKey,
          item: itemRecord,
          quantity: 1,
          discountPercent: item.discount_percent || 0,
          size: sizeOption?.size,
          notes: sizeOption ? `Size: ${sizeOption.size}` : undefined,
        },
      ];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === cartId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemDiscount = (cartId: string, disc: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, discountPercent: Math.max(0, Math.min(100, disc)) } : c))
    );
  };

  const updateItemNotes = (cartId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.id === cartId ? { ...c, notes: notes.trim() || undefined } : c))
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartId));
  };

  // Calculations
  const calculateLineTotal = (c: CartItem) => {
    const rawTotal = c.item.price * c.quantity;
    const discount = (rawTotal * (c.discountPercent || 0)) / 100;
    return Math.max(0, rawTotal - discount);
  };

  const totalItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = cart.reduce((sum, c) => sum + calculateLineTotal(c), 0);

  const calculatedGlobalDiscount =
    globalDiscountType === "percentage"
      ? (subtotal * globalDiscountValue) / 100
      : Math.min(subtotal, globalDiscountValue);

  const amountAfterDiscount = Math.max(0, subtotal - calculatedGlobalDiscount);
  const taxAmount = (amountAfterDiscount * taxPercent) / 100;
  const payableAmount = amountAfterDiscount + taxAmount;
  const remainingBalance = Math.max(0, payableAmount - (amountPaid || 0));
  const changeDue = Math.max(0, (amountPaid || 0) - payableAmount);

  // Customer Toggle
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (id === "cust_walkin") {
      setIsWalkIn(true);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
    } else {
      setIsWalkIn(false);
      const c = customers.find((x) => x.id === id);
      if (c) {
        setCustomerName(c.name);
        setCustomerPhone(c.phone || "");
        if (c.address) setDeliveryAddress(c.address);
      }
    }
  };

  // Hold Invoice
  const handleHoldInvoice = () => {
    if (cart.length === 0) return;
    const held: HeldInvoice = {
      id: `hold_${Date.now()}`,
      heldAt: new Date().toLocaleTimeString(),
      customerName: customerName || "Walk-in Customer",
      customerPhone,
      remarks,
      mileage,
      items: cart.map((c) => ({
        menu_item_id: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
        box_qty: c.boxQuantity,
        box_price: c.boxPrice,
        notes: c.notes,
      })),
      subtotal,
      discountType: globalDiscountType,
      discountAmount: calculatedGlobalDiscount,
      tax: taxAmount,
      total: payableAmount,
    };
    saveHeldInvoice(held);
    setHeldList(getHeldInvoices());
    setCart([]);
    setAmountPaid(0);
    setRemarks("");
    alert("Invoice put ON HOLD. You can retrieve it anytime from Held Invoices.");
  };

  // Retrieve Invoice
  const handleRetrieveInvoice = (held: HeldInvoice) => {
    const reconstituted: CartItem[] = held.items.map((i) => {
      const original = menuItems.find((m) => m.id === i.menu_item_id) || {
        id: i.menu_item_id,
        name: i.name,
        price: i.price,
        category_id: null,
        description: null,
        image: null,
        available: true,
        featured: false,
      };
      return {
        id: i.menu_item_id,
        item: original,
        quantity: i.quantity,
        discountPercent: 0,
        notes: i.notes,
      };
    });

    setCart(reconstituted);
    setCustomerName(held.customerName);
    if (held.customerPhone) setCustomerPhone(held.customerPhone);
    if (held.remarks) setRemarks(held.remarks);
    if (held.mileage) setMileage(held.mileage);
    removeHeldInvoice(held.id);
    setHeldList(getHeldInvoices());
    setHeldInvoicesModal(false);
  };

  // Quick Add Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const saved = await savePOSCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
    });
    setCustomers((prev) => [saved, ...prev]);
    setSelectedCustomerId(saved.id);
    setCustomerName(saved.name);
    setCustomerPhone(saved.phone || "");
    setIsWalkIn(false);
    setNewCustName("");
    setNewCustPhone("");
    setCustomerModal(false);
  };

  // Place / Finalize Sale
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const targetTable = tables.find((t) => t.table_number === selectedTableNum) || {
      id: `t${selectedTableNum}`,
      table_number: selectedTableNum,
    };

    const newOrder = await createPOSOrder({
      table_id: orderType === "dine_in" ? targetTable.id : null,
      table_number: orderType === "dine_in" ? selectedTableNum : null,
      waiter_id: user?.id || "10000000-0000-0000-0000-000000000005",
      waiter_name: user?.name || "Cashier Counter",
      order_type: orderType,
      customer_name: customerName || "Walk-in Customer",
      customer_phone: customerPhone || null,
      delivery_address: orderType === "delivery" ? deliveryAddress : null,
      notes: remarks || null,
      subtotal,
      discount_amount: calculatedGlobalDiscount,
      discount_type: globalDiscountType === "percentage" ? "percentage" : "flat",
      tax: taxAmount,
      total: payableAmount,
      payment_method: paymentMethod,
      items: cart.map((c) => ({
        menu_item_id: c.item.id.includes("_") ? c.item.id.split("_")[0] : c.item.id,
        menu_item_name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
        notes: c.notes || null,
      })),
      mileage,
      received_amount: amountPaid || payableAmount,
      change_due: changeDue,
    });

    playOrderNotificationSound("new_order");
    setIsSubmitting(false);

    if (autoPrint) {
      window.print();
    }

    router.push("/cashier/dashboard");
  };

  const filteredItems = menuItems.filter((i) => {
    const matchesCat = selectedCategory === "All" || i.category_name === selectedCategory;
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.code && i.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (i.barcode && i.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch && i.available;
  });

  return (
    <div className="space-y-4 font-sans text-zinc-100">
      {/* Top Banner with Operational Hotkeys Guide */}
      <div className="glass-surface-card border-white/10 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/cashier/dashboard">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1 text-[#c87740]" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <div className="border-l border-zinc-700 pl-3">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-[#fdf6e3]">Restaurant Front Counter POS</h1>
              <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 text-[10px] font-bold">RESTAURANT</Badge>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Pill Bar */}
        <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">Shortcuts:</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">F1</kbd> Sale</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">F3</kbd> Stock</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">F8</kbd> Shift</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">Alt+P</kbd> Product</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">Alt+C</kbd> Barcode</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">Alt+D</kbd> Discount</span>
          <span><kbd className="bg-zinc-800 text-[#c87740] px-1 py-0.5 rounded font-bold">Alt+E</kbd> Payment</span>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center space-x-2">
          {/* Shift & Drawer Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShiftModalOpen(true)}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-[#c87740] hover:text-white h-8 text-xs relative"
          >
            <Banknote className="h-3.5 w-3.5 mr-1 text-[#c87740]" />
            <span>Shift &amp; Drawer</span>
            <kbd className="ml-1 text-[9px] bg-zinc-800 text-[#c87740] px-1 py-0.2 rounded font-mono font-bold">F8</kbd>
          </Button>

          {/* Held Invoices */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHeldInvoicesModal(true)}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white h-8 text-xs relative"
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1 text-amber-400" />
            <span>Held ({heldList.length})</span>
          </Button>

          {/* Sales Returns Link */}
          <Link href="/admin/sales-returns">
            <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white h-8 text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-rose-400" />
              <span>Sales Returns</span>
            </Button>
          </Link>

          {/* Quick Settings */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSettingsModal(true)}
            className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white h-8 text-xs"
          >
            <Sliders className="h-3.5 w-3.5 mr-1 text-[#c87740]" />
            <span>Sales Settings</span>
          </Button>
        </div>
      </div>

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Product Entry & Catalogue */}
        <div className="lg:col-span-7 space-y-3">
          {/* Product Code / Barcode Rapid Input & Name Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 glass-surface-card p-3 rounded-2xl border-white/10 shadow-sm">
            {/* Barcode Quick Entry */}
            <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c87740]" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Barcode / Code [Alt+C]"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#c87740]"
              />
            </form>

            {/* Product Name Search */}
            <div className="sm:col-span-7 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products by name / formula [Alt+P]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#c87740]"
              />
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 glass-surface-card p-2 rounded-2xl border-white/10">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/25"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === c.name
                    ? "bg-[#c87740] text-white shadow-md shadow-[#c87740]/25"
                    : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[64vh] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isPizza = isPizzaItem(item);
              const portionInfo = getMenuItemPortionAvailability(item.id);
              const isOutOfStock = !portionInfo.isAvailable;
              const isLowStock = portionInfo.portionsAvailable <= 5;
              const stock = item.stock_quantity ?? 100;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group cursor-pointer rounded-xl glass-surface-card/70 border p-2.5 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${
                    isOutOfStock
                      ? "opacity-60 border-rose-900/50 hover:border-rose-700 bg-rose-950/10"
                      : "border-zinc-800 hover:border-[#c87740] hover:glass-surface-card"
                  }`}
                >
                  <div>
                    <div className="h-20 w-full bg-zinc-950 rounded-lg overflow-hidden mb-1.5 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      {item.code && (
                        <span className="absolute top-1 left-1 font-mono text-[9px] font-bold bg-black/80 px-1 py-0.5 rounded text-[#c87740]">
                          {item.code}
                        </span>
                      )}
                      {isOutOfStock ? (
                        <span className="absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900/90 text-amber-200">
                          {portionInfo.portionsAvailable} left
                        </span>
                      ) : (
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-emerald-400">
                          Stock: {stock}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-[#fdf6e3] line-clamp-1">{item.name}</h4>
                    {isOutOfStock ? (
                      <p className="text-[9px] text-rose-400 font-medium truncate">Depleted: {portionInfo.limitingIngredient}</p>
                    ) : item.formula ? (
                      <p className="text-[10px] text-zinc-400 italic line-clamp-1">{item.formula}</p>
                    ) : null}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-xs text-[#c87740]">
                        {isPizza ? `Rs. ${getPizzaSizes(item)[0]?.price || item.price}` : `Rs. ${item.price}`}
                      </span>
                      {item.box_price ? (
                        <span className="block text-[9px] text-zinc-400">Box: Rs. {item.box_price}</span>
                      ) : null}
                    </div>
                    <div className="h-5 w-5 rounded-md bg-[#c87740]/20 text-[#c87740] flex items-center justify-center group-hover:bg-[#c87740] group-hover:text-white transition-colors">
                      <Plus className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Billing Invoice Terminal */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="glass-surface-card border-zinc-800 p-4 space-y-3 shadow-xl">
            {/* Header: Mode & Actions */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setOrderType("takeaway")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    orderType === "takeaway" ? "bg-[#c87740] text-white" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Takeaway
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("dine_in")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    orderType === "dine_in" ? "bg-[#c87740] text-white" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Dine-In
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    orderType === "delivery" ? "bg-[#c87740] text-white" : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  Delivery
                </button>
              </div>

              {/* Hold Action */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleHoldInvoice}
                disabled={cart.length === 0}
                className="h-7 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 px-2"
              >
                <PauseCircle className="h-3.5 w-3.5 mr-1" />
                <span>Hold</span>
              </Button>
            </div>

            {/* Customer Selection / Walk-in Option */}
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <User className="h-3.5 w-3.5 text-[#c87740]" />
                  <span className="font-bold text-zinc-300">Customer Details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={isWalkIn}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsWalkIn(checked);
                        if (checked) {
                          setSelectedCustomerId("cust_walkin");
                          setCustomerName("Walk-in Customer");
                          setCustomerPhone("");
                        }
                      }}
                      className="accent-[#c87740] rounded"
                    />
                    <span>Walk-In</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomerModal(true)}
                    className="text-[11px] text-[#c87740] hover:underline font-bold"
                  >
                    + New
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.balance > 0 ? `(Bal: Rs. ${c.balance})` : ""}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-hidden"
                />
              </div>

              {orderType === "delivery" && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Delivery Address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="sm:col-span-8 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-hidden"
                  />
                  <div className="sm:col-span-4 flex items-center bg-zinc-900 border border-zinc-700 rounded-lg px-2">
                    <Gauge className="h-3 w-3 text-zinc-400 mr-1" />
                    <input
                      type="number"
                      placeholder="Mileage (km)"
                      value={mileage || ""}
                      onChange={(e) => setMileage(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Invoice Items Table */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <div className="max-h-52 overflow-y-auto divide-y divide-zinc-800/80">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    Cart empty. Search item or scan barcode to add.
                  </div>
                ) : (
                  cart.map((c) => {
                    const lineTotal = calculateLineTotal(c);
                    return (
                      <div key={c.id} className="p-2 space-y-1 hover:bg-zinc-900/60 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-[#fdf6e3] truncate block">{c.item.name}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-zinc-400">
                              <span>Rs. {c.item.price} each</span>
                              {c.size && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#c87740]/20 text-[#c87740] border border-[#c87740]/30">
                                  {c.size}
                                </span>
                              )}
                              {c.notes ? (
                                <span 
                                  onClick={() => {
                                    const note = prompt(`Kitchen instructions for "${c.item.name}":`, c.notes);
                                    if (note !== null) updateItemNotes(c.id, note);
                                  }}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate max-w-[130px] cursor-pointer"
                                  title="Click to edit cooking instruction"
                                >
                                  📝 {c.notes}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = prompt(`Kitchen cooking note for "${c.item.name}" (e.g. Extra spicy, No mayo, Well done):`);
                                    if (note !== null) updateItemNotes(c.id, note);
                                  }}
                                  className="text-[9px] text-amber-400/90 hover:text-amber-300 hover:underline flex items-center gap-0.5"
                                >
                                  <span>+ Note</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Line Total */}
                          <span className="font-mono font-bold text-xs text-emerald-400">
                            Rs. {lineTotal}
                          </span>
                        </div>

                        {/* Quantity & Item Discount Controls */}
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateQuantity(c.id, -1)}
                              className="h-5 w-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="w-6 text-center font-bold text-white text-xs">{c.quantity}</span>
                            <button
                              onClick={() => updateQuantity(c.id, 1)}
                              className="h-5 w-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-zinc-400">Disc%:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={c.discountPercent || 0}
                                onChange={(e) => updateItemDiscount(c.id, parseFloat(e.target.value) || 0)}
                                className="w-10 bg-zinc-900 border border-zinc-700 rounded px-1 py-0.5 text-[10px] text-right font-mono text-white"
                              />
                            </div>

                            <button
                              onClick={() => removeFromCart(c.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calculations & Discount Fields */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
              {/* Total Quantities & Subtotal */}
              <div className="flex justify-between text-zinc-400">
                <span>Total Items / Qty:</span>
                <span className="text-white font-bold">{totalItemCount} units</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Amount:</span>
                <span className="text-white font-bold">Rs. {subtotal}</span>
              </div>

              {/* Global Discount Input [Alt+D] */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <div className="flex items-center space-x-1">
                  <span className="text-zinc-400">Discount [Alt+D]:</span>
                  <select
                    value={globalDiscountType}
                    onChange={(e) => setGlobalDiscountType(e.target.value as any)}
                    className="bg-zinc-900 text-zinc-300 text-[10px] rounded px-1 py-0.5 border border-zinc-700"
                  >
                    <option value="fixed">Rs.</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                <input
                  ref={discountInputRef}
                  type="number"
                  min="0"
                  value={globalDiscountValue || ""}
                  onChange={(e) => setGlobalDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-xs text-white"
                />
              </div>

              {/* Tax Input */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tax (%):</span>
                <input
                  type="number"
                  min="0"
                  value={taxPercent || ""}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right text-xs text-white"
                />
              </div>

              {/* Net Payable Amount */}
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline font-sans">
                <span className="font-extrabold text-[#fdf6e3] text-sm">PAYABLE AMOUNT:</span>
                <span className="text-lg font-black text-[#c87740] font-mono">Rs. {payableAmount}</span>
              </div>

              {/* Amount Paid [Alt+E] & Change Due / Remaining Balance */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-0.5">Amount Paid [Alt+E]:</label>
                  <input
                    ref={amountPaidInputRef}
                    type="number"
                    min="0"
                    value={amountPaid || ""}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    placeholder="Rs. Paid"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-bold text-emerald-400"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">
                    {changeDue > 0 ? "Change Due:" : "Balance Due:"}
                  </span>
                  <span className={`text-xs font-black ${changeDue > 0 ? "text-cyan-400" : "text-amber-400"}`}>
                    Rs. {changeDue > 0 ? changeDue : remainingBalance}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks / Invoice Notes */}
            <input
              type="text"
              placeholder="Invoice remarks / note..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden"
            />

            {/* Auto Print Option Checkbox */}
            <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="accent-[#c87740] rounded"
                />
                <span>Auto-print receipt on checkout</span>
              </label>
              <Printer className="h-3.5 w-3.5 text-zinc-500" />
            </div>

            {/* Final Place Order / Checkout Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full h-11 bg-[#c87740] hover:bg-[#c87740]/90 text-white font-black text-xs rounded-xl shadow-lg shadow-[#c87740]/25 flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "PROCESSING INVOICE..." : "FINALIZE & PRINT INVOICE"}</span>
            </Button>
          </Card>
        </div>
      </div>

      {/* Held Invoices Modal */}
      <Modal isOpen={heldInvoicesModal} onClose={() => setHeldInvoicesModal(false)} title="Held Invoices Register">
        <div className="space-y-3">
          {heldList.length === 0 ? (
            <p className="text-center py-6 text-zinc-500 text-xs">No held invoices currently on file.</p>
          ) : (
            heldList.map((held) => (
              <div key={held.id} className="p-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#fdf6e3]">{held.customerName}</p>
                  <p className="text-[10px] text-zinc-400">Held at: {held.heldAt} • {held.items.length} Items</p>
                  <p className="text-xs font-bold text-[#c87740] mt-0.5">Rs. {held.total}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleRetrieveInvoice(held)}
                    className="bg-[#c87740] text-white font-bold text-xs h-8"
                  >
                    Retrieve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      removeHeldInvoice(held.id);
                      setHeldList(getHeldInvoices());
                    }}
                    className="border-zinc-700 text-rose-400 h-8"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Quick Customer Add Modal */}
      <Modal isOpen={customerModal} onClose={() => setCustomerModal(false)} title="Add New Customer">
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <Input
            label="Customer Name"
            placeholder="e.g. Tariq Mehmood"
            value={newCustName}
            onChange={(e) => setNewCustName(e.target.value)}
            required
            className="text-xs"
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +92 300 1234567"
            value={newCustPhone}
            onChange={(e) => setNewCustPhone(e.target.value)}
            className="text-xs"
          />
          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold text-xs h-9">
            Save & Select Customer
          </Button>
        </form>
      </Modal>

      {/* Restaurant POS Settings Modal */}
      <Modal isOpen={settingsModal} onClose={() => setSettingsModal(false)} title="Restaurant Terminal Preferences">
        <div className="space-y-3 text-xs text-zinc-300">
          <p className="text-zinc-400 text-xs">Configure front-desk printing preferences and kitchen order firing.</p>
          <div className="p-3 bg-zinc-900 rounded-xl space-y-2.5 border border-zinc-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Auto-Print Kitchen Order Ticket (KOT)</span>
              <input type="checkbox" defaultChecked className="accent-[#c87740]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Auto-Print Customer Thermal Receipt</span>
              <input type="checkbox" defaultChecked className="accent-[#c87740]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Sound Chime on New Orders</span>
              <input type="checkbox" defaultChecked className="accent-[#c87740]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Always Prompt Table for Dine-In</span>
              <input type="checkbox" defaultChecked className="accent-[#c87740]" />
            </label>
          </div>
          <Button onClick={() => setSettingsModal(false)} className="w-full bg-[#c87740] hover:bg-[#b06530] text-white font-bold h-9 rounded-xl">
            Save Preferences
          </Button>
        </div>
      </Modal>

      {/* Pizza Size Selection Modal */}
      <PizzaSizeModal
        isOpen={!!pizzaModalItem}
        onClose={() => setPizzaModalItem(null)}
        item={pizzaModalItem}
        onSelectSize={(item, sizeOption) => addToCart(item, sizeOption)}
      />

      {/* Cash Drawer & Shift Modal */}
      <ShiftModal
        isOpen={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        currentUser={{ id: user?.id || "cashier", name: user?.name || "Cashier Counter" }}
      />
    </div>
  );
}


