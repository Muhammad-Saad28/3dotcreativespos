"use client";

import { supabase } from "@/lib/supabase/client";
import {
  POSCompany,
  POSVendor,
  POSCustomer,
  POSIncomeType,
  POSIncome,
  POSExpenseType,
  POSExpense,
  POSPurchase,
  POSPurchaseItem,
  POSPurchaseReturn,
  POSSaleReturn,
  POSMenuItem,
} from "./pos-data";

// ----------------------------------------------------
// LOCAL STORAGE CACHE KEYS
// ----------------------------------------------------
const V2_COMPANIES_KEY = "saucify_v2_companies";
const V2_VENDORS_KEY = "saucify_v2_vendors";
const V2_CUSTOMERS_KEY = "saucify_v2_customers";
const V2_INCOME_TYPES_KEY = "saucify_v2_income_types";
const V2_INCOMES_KEY = "saucify_v2_incomes";
const V2_EXPENSE_TYPES_KEY = "saucify_v2_expense_types";
const V2_EXPENSES_KEY = "saucify_v2_expenses";
const V2_PURCHASES_KEY = "saucify_v2_purchases";
const V2_PURCHASE_RETURNS_KEY = "saucify_v2_purchase_returns";
const V2_SALE_RETURNS_KEY = "saucify_v2_sale_returns";

function getLocal<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultData;
}

function setLocal<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------
export const initialCompanies: POSCompany[] = [
  { id: "comp_1", name: "Saucify Premium Foods", code: "SPF", description: "In-house sauces, marinades, and buns", contact_person: "Shahbaz Ali", phone: "+92 300 1112233", email: "supplies@saucify.pk", active: true },
  { id: "comp_2", name: "Lahore Poultry & Meat Co.", code: "LPMC", description: "Fresh chicken breast, beef patties, wings", contact_person: "Rashid Minhas", phone: "+92 321 4455667", email: "sales@lahorepoultry.com", active: true },
  { id: "comp_3", name: "Pak Dairy & Cheese Ltd.", code: "PDCL", description: "Cheddar slices, mozzarella blend, butter", contact_person: "Tariq Mahmood", phone: "+92 333 7788990", email: "info@pakdairy.pk", active: true },
  { id: "comp_4", name: "National Beverages Corp.", code: "NBC", description: "Soft drinks, juices, mineral water", contact_person: "Kamran Akmal", phone: "+92 302 9988776", email: "orders@nationalbev.pk", active: true },
];

export const initialVendors: POSVendor[] = [
  { id: "ven_1", name: "Lahore Fresh Farms", company_name: "Lahore Poultry & Meat Co.", contact_person: "Rashid Minhas", phone: "+92 321 4455667", email: "sales@lahorepoultry.com", address: "Bismillah Scheme, GT Road, Lahore", balance: 35000, payments_collected: 120000, active: true },
  { id: "ven_2", name: "Evergreen Dairy Distributors", company_name: "Pak Dairy & Cheese Ltd.", contact_person: "Tariq Mahmood", phone: "+92 333 7788990", email: "info@pakdairy.pk", address: "Kot Lakhpat Industrial Area, Lahore", balance: 18500, payments_collected: 85000, active: true },
  { id: "ven_3", name: "Capital Beverage Supply", company_name: "National Beverages Corp.", contact_person: "Kamran Akmal", phone: "+92 302 9988776", email: "orders@nationalbev.pk", address: "Gulberg III, Lahore", balance: 8400, payments_collected: 45000, active: true },
  { id: "ven_4", name: "Master Packaging & Disposables", company_name: "Master Pack", contact_person: "Asim Rauf", phone: "+92 345 1234567", email: "asim@masterpack.com", address: "Badami Bagh, Lahore", balance: 5200, payments_collected: 28000, active: true },
];

export const initialCustomers: POSCustomer[] = [
  { id: "cust_walkin", name: "Walk-in Customer", phone: "-", email: "-", address: "Store Walk-in", balance: 0, total_spent: 0, payments_collected: 0, visited_count: 500, active: true },
  { id: "cust_1", name: "Hamza Farooq", phone: "+92 301 5551234", email: "hamza.f@gmail.com", address: "House 14, Block B, Bismillah Scheme, Lahore", balance: 1250, total_spent: 18500, payments_collected: 17250, visited_count: 12, active: true },
  { id: "cust_2", name: "Dr. Ayesha Malik", phone: "+92 322 8889911", email: "ayesha.malik@hospital.org", address: "Sui Gas Society, Lahore", balance: 0, total_spent: 34200, payments_collected: 34200, visited_count: 24, active: true },
  { id: "cust_3", name: "Bilal Sheikh", phone: "+92 334 1113355", email: "bilal.s@yahoo.com", address: "DHA Phase 5, Lahore", balance: 2400, total_spent: 14600, payments_collected: 12200, visited_count: 8, active: true },
  { id: "cust_4", name: "Zainab Raza", phone: "+92 313 7772244", email: "zainab.raza@live.com", address: "Fateh Garh, Canal Road, Lahore", balance: 0, total_spent: 9800, payments_collected: 9800, visited_count: 6, active: true },
];

export const initialIncomeTypes: POSIncomeType[] = [
  { id: "inct_1", name: "Catering & Events", description: "Advance & full booking for private parties", active: true },
  { id: "inct_2", name: "Delivery Commission / Surcharge", description: "Delivery delivery fee revenues", active: true },
  { id: "inct_3", name: "Scrap & Packaging Resale", description: "Income from oil recycling and carton resale", active: true },
  { id: "inct_4", name: "Franchise Royalty Fee", description: "Monthly brand royalty payments", active: true },
];

export const initialIncomes: POSIncome[] = [
  { id: "inc_1", type_id: "inct_1", type_name: "Catering & Events", amount: 45000, payment_method: "bank_transfer", reference_no: "CAT-2026-001", received_from: "Tech Park Annual Dinner", remarks: "50% advance for 80 pax burger meal", date: new Date().toISOString().split("T")[0] },
  { id: "inc_2", type_id: "inct_3", type_name: "Scrap & Packaging Resale", amount: 6500, payment_method: "cash", reference_no: "REC-8841", received_from: "Lahore Biofuel Collectors", remarks: "Used frying oil disposal collection", date: new Date().toISOString().split("T")[0] },
  { id: "inc_3", type_id: "inct_2", type_name: "Delivery Commission / Surcharge", amount: 12400, payment_method: "cash", reference_no: "DEL-WEEK-4", received_from: "Own Delivery Fleet", remarks: "Weekly collected delivery fees", date: new Date().toISOString().split("T")[0] },
];

export const initialExpenseTypes: POSExpenseType[] = [
  { id: "expt_1", name: "Kitchen Gas & Electricity", description: "Commercial cylinder and utility bills", active: true },
  { id: "expt_2", name: "Staff Salaries & Daily Wages", description: "Chef, helpers, riders remuneration", active: true },
  { id: "expt_3", name: "Store Rent & Maintenance", description: "Branch lease and HVAC maintenance", active: true },
  { id: "expt_4", name: "Packaging & Cleaning Supplies", description: "Boxes, greaseproof paper, detergent", active: true },
  { id: "expt_5", name: "Rider Fuel & Vehicle Allowance", description: "Daily fuel allocation for delivery fleet", active: true },
];

export const initialExpenses: POSExpense[] = [
  { id: "exp_1", type_id: "expt_1", type_name: "Kitchen Gas & Electricity", amount: 18500, payment_method: "bank_transfer", reference_no: "LESCO-99238", paid_to: "LESCO Lahore Electric", remarks: "Commercial meter electricity bill", date: new Date().toISOString().split("T")[0] },
  { id: "exp_2", type_id: "expt_5", type_name: "Rider Fuel & Vehicle Allowance", amount: 4800, payment_method: "cash", reference_no: "PET-4412", paid_to: "Delivery Fleet Riders (4)", remarks: "Weekly bike fuel stipend", date: new Date().toISOString().split("T")[0] },
  { id: "exp_3", type_id: "expt_4", type_name: "Packaging & Cleaning Supplies", amount: 9200, payment_method: "cash", reference_no: "INV-PACK-302", paid_to: "Master Packaging Lahore", remarks: "1000 Burger boxes & butter paper", date: new Date().toISOString().split("T")[0] },
];

export const initialPurchases: POSPurchase[] = [
  {
    id: "pur_1",
    invoice_no: "PUR-2026-001",
    vendor_id: "ven_1",
    vendor_name: "Lahore Fresh Farms",
    purchase_date: new Date().toISOString().split("T")[0],
    total_amount: 54000,
    paid_amount: 30000,
    balance_amount: 24000,
    payment_method: "cash",
    status: "received",
    remarks: "Fresh boneless chicken & prime beef mince batch #104",
    items: [
      { id: "pi_1", product_id: "prod_chk_breast", product_name: "Fresh Chicken Breast (kg)", product_code: "RAW-CHK-01", quantity: 60, unit_cost: 650, total_cost: 39000 },
      { id: "pi_2", product_id: "prod_beef_mince", product_name: "Prime Beef Mince (kg)", product_code: "RAW-BEEF-01", quantity: 15, unit_cost: 1000, total_cost: 15000 },
    ]
  },
  {
    id: "pur_2",
    invoice_no: "PUR-2026-002",
    vendor_id: "ven_2",
    vendor_name: "Evergreen Dairy Distributors",
    purchase_date: new Date().toISOString().split("T")[0],
    total_amount: 28500,
    paid_amount: 28500,
    balance_amount: 0,
    payment_method: "bank_transfer",
    status: "received",
    remarks: "20 cartons Cheddar Cheese Slices & Buffalo Mozzarella",
    items: [
      { id: "pi_3", product_id: "prod_cheese_slice", product_name: "Cheddar Cheese Slice Packs", product_code: "RAW-CHS-01", quantity: 30, unit_cost: 950, total_cost: 28500 }
    ]
  }
];

export const initialPurchaseReturns: POSPurchaseReturn[] = [
  {
    id: "pret_1",
    return_no: "PRET-2026-001",
    purchase_id: "pur_1",
    purchase_invoice_no: "PUR-2026-001",
    vendor_id: "ven_1",
    vendor_name: "Lahore Fresh Farms",
    return_date: new Date().toISOString().split("T")[0],
    total_returned_amount: 3250,
    refund_status: "refunded",
    reason: "5kg thawed chicken breast packaging compromised on delivery",
    items: [
      { id: "pri_1", product_id: "prod_chk_breast", product_name: "Fresh Chicken Breast (kg)", quantity: 5, unit_cost: 650, total_cost: 3250 }
    ]
  }
];

export const initialSaleReturns: POSSaleReturn[] = [
  {
    id: "sret_1",
    return_no: "SRET-2026-001",
    order_id: "ord_101",
    order_number: "0000101",
    customer_id: "cust_1",
    customer_name: "Hamza Farooq",
    return_date: new Date().toISOString().split("T")[0],
    total_refund_amount: 750,
    refund_method: "cash",
    reason: "Customer ordered mild sauce burger by mistake instead of spicy",
    items: [
      { id: "sri_1", product_id: "prod_smash_01", product_name: "Signature Saucify Burger", quantity: 1, price: 750, total: 750 }
    ]
  }
];

// ----------------------------------------------------
// COMPANIES CRUD
// ----------------------------------------------------
export async function getPOSCompanies(): Promise<POSCompany[]> {
  try {
    const { data, error } = await supabase.from("companies").select("*").order("name");
    if (!error && data && data.length > 0) return data as POSCompany[];
  } catch (e) {}
  return getLocal(V2_COMPANIES_KEY, initialCompanies);
}

export async function savePOSCompany(company: Partial<POSCompany>): Promise<POSCompany> {
  const current = await getPOSCompanies();
  let saved: POSCompany;
  if (company.id) {
    saved = { ...current.find(c => c.id === company.id)!, ...company } as POSCompany;
    const updated = current.map(c => c.id === company.id ? saved : c);
    setLocal(V2_COMPANIES_KEY, updated);
  } else {
    saved = {
      id: `comp_${Date.now()}`,
      name: company.name || "New Company",
      code: company.code || "",
      description: company.description || "",
      contact_person: company.contact_person || "",
      phone: company.phone || "",
      email: company.email || "",
      address: company.address || "",
      active: company.active ?? true,
      created_at: new Date().toISOString(),
    };
    setLocal(V2_COMPANIES_KEY, [saved, ...current]);
  }
  try {
    if (company.id && !company.id.startsWith("comp_")) {
      await supabase.from("companies").update(company).eq("id", company.id);
    } else {
      await supabase.from("companies").insert(saved);
    }
  } catch (e) {}
  return saved;
}

export async function deletePOSCompany(id: string): Promise<boolean> {
  const current = await getPOSCompanies();
  setLocal(V2_COMPANIES_KEY, current.filter(c => c.id !== id));
  try {
    await supabase.from("companies").delete().eq("id", id);
  } catch (e) {}
  return true;
}

// ----------------------------------------------------
// VENDORS CRUD
// ----------------------------------------------------
export async function getPOSVendors(): Promise<POSVendor[]> {
  try {
    const { data, error } = await supabase.from("vendors").select("*").order("name");
    if (!error && data && data.length > 0) return data as POSVendor[];
  } catch (e) {}
  return getLocal(V2_VENDORS_KEY, initialVendors);
}

export async function savePOSVendor(vendor: Partial<POSVendor>): Promise<POSVendor> {
  const current = await getPOSVendors();
  let saved: POSVendor;
  if (vendor.id) {
    saved = { ...current.find(v => v.id === vendor.id)!, ...vendor } as POSVendor;
    const updated = current.map(v => v.id === vendor.id ? saved : v);
    setLocal(V2_VENDORS_KEY, updated);
  } else {
    saved = {
      id: `ven_${Date.now()}`,
      name: vendor.name || "New Vendor",
      company_name: vendor.company_name || "",
      contact_person: vendor.contact_person || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      balance: vendor.balance || 0,
      payments_collected: vendor.payments_collected || 0,
      active: vendor.active ?? true,
      created_at: new Date().toISOString(),
    };
    setLocal(V2_VENDORS_KEY, [saved, ...current]);
  }
  try {
    if (vendor.id && !vendor.id.startsWith("ven_")) {
      await supabase.from("vendors").update(vendor).eq("id", vendor.id);
    } else {
      await supabase.from("vendors").insert(saved);
    }
  } catch (e) {}
  return saved;
}

export async function deletePOSVendor(id: string): Promise<boolean> {
  const current = await getPOSVendors();
  setLocal(V2_VENDORS_KEY, current.filter(v => v.id !== id));
  try {
    await supabase.from("vendors").delete().eq("id", id);
  } catch (e) {}
  return true;
}

// ----------------------------------------------------
// CUSTOMERS CRUD
// ----------------------------------------------------
export async function getPOSCustomers(): Promise<POSCustomer[]> {
  try {
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (!error && data && data.length > 0) return data as POSCustomer[];
  } catch (e) {}
  return getLocal(V2_CUSTOMERS_KEY, initialCustomers);
}

export async function savePOSCustomer(cust: Partial<POSCustomer>): Promise<POSCustomer> {
  const current = await getPOSCustomers();
  let saved: POSCustomer;
  if (cust.id) {
    saved = { ...current.find(c => c.id === cust.id)!, ...cust } as POSCustomer;
    const updated = current.map(c => c.id === cust.id ? saved : c);
    setLocal(V2_CUSTOMERS_KEY, updated);
  } else {
    saved = {
      id: `cust_${Date.now()}`,
      name: cust.name || "Walk-in Customer",
      phone: cust.phone || "",
      email: cust.email || "",
      address: cust.address || "",
      balance: cust.balance || 0,
      total_spent: cust.total_spent || 0,
      payments_collected: cust.payments_collected || 0,
      visited_count: cust.visited_count || 1,
      active: cust.active ?? true,
      created_at: new Date().toISOString(),
    };
    setLocal(V2_CUSTOMERS_KEY, [saved, ...current]);
  }
  try {
    if (cust.id && !cust.id.startsWith("cust_")) {
      await supabase.from("customers").update(cust).eq("id", cust.id);
    } else {
      await supabase.from("customers").insert(saved);
    }
  } catch (e) {}
  return saved;
}

// ----------------------------------------------------
// INCOME MANAGEMENT
// ----------------------------------------------------
export async function getPOSIncomeTypes(): Promise<POSIncomeType[]> {
  try {
    const { data, error } = await supabase.from("income_types").select("*").order("name");
    if (!error && data && data.length > 0) return data as POSIncomeType[];
  } catch (e) {}
  return getLocal(V2_INCOME_TYPES_KEY, initialIncomeTypes);
}

export async function savePOSIncomeType(type: Partial<POSIncomeType>): Promise<POSIncomeType> {
  const current = await getPOSIncomeTypes();
  let saved: POSIncomeType;
  if (type.id) {
    saved = { ...current.find(t => t.id === type.id)!, ...type } as POSIncomeType;
    setLocal(V2_INCOME_TYPES_KEY, current.map(t => t.id === type.id ? saved : t));
  } else {
    saved = { id: `inct_${Date.now()}`, name: type.name || "Income Type", description: type.description || "", active: type.active ?? true };
    setLocal(V2_INCOME_TYPES_KEY, [saved, ...current]);
  }
  return saved;
}

export async function getPOSIncomes(): Promise<POSIncome[]> {
  try {
    const { data, error } = await supabase.from("incomes").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as POSIncome[];
  } catch (e) {}
  return getLocal(V2_INCOMES_KEY, initialIncomes);
}

export async function addPOSIncome(income: Partial<POSIncome>): Promise<POSIncome> {
  const current = await getPOSIncomes();
  const saved: POSIncome = {
    id: `inc_${Date.now()}`,
    type_id: income.type_id || "inct_1",
    type_name: income.type_name || "General Income",
    amount: income.amount || 0,
    payment_method: income.payment_method || "cash",
    reference_no: income.reference_no || `INC-${Date.now().toString().slice(-4)}`,
    received_from: income.received_from || "General Customer",
    remarks: income.remarks || "",
    date: income.date || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  };
  setLocal(V2_INCOMES_KEY, [saved, ...current]);
  try {
    await supabase.from("incomes").insert(saved);
  } catch (e) {}
  return saved;
}

// ----------------------------------------------------
// EXPENSE MANAGEMENT
// ----------------------------------------------------
export async function getPOSExpenseTypes(): Promise<POSExpenseType[]> {
  try {
    const { data, error } = await supabase.from("expense_types").select("*").order("name");
    if (!error && data && data.length > 0) return data as POSExpenseType[];
  } catch (e) {}
  return getLocal(V2_EXPENSE_TYPES_KEY, initialExpenseTypes);
}

export async function savePOSExpenseType(type: Partial<POSExpenseType>): Promise<POSExpenseType> {
  const current = await getPOSExpenseTypes();
  let saved: POSExpenseType;
  if (type.id) {
    saved = { ...current.find(t => t.id === type.id)!, ...type } as POSExpenseType;
    setLocal(V2_EXPENSE_TYPES_KEY, current.map(t => t.id === type.id ? saved : t));
  } else {
    saved = { id: `expt_${Date.now()}`, name: type.name || "Expense Type", description: type.description || "", active: type.active ?? true };
    setLocal(V2_EXPENSE_TYPES_KEY, [saved, ...current]);
  }
  return saved;
}

export async function getPOSExpenses(): Promise<POSExpense[]> {
  try {
    const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as POSExpense[];
  } catch (e) {}
  return getLocal(V2_EXPENSES_KEY, initialExpenses);
}

export async function addPOSExpense(expense: Partial<POSExpense>): Promise<POSExpense> {
  const current = await getPOSExpenses();
  const saved: POSExpense = {
    id: `exp_${Date.now()}`,
    type_id: expense.type_id || "expt_1",
    type_name: expense.type_name || "General Expense",
    amount: expense.amount || 0,
    payment_method: expense.payment_method || "cash",
    reference_no: expense.reference_no || `EXP-${Date.now().toString().slice(-4)}`,
    paid_to: expense.paid_to || "Vendor/Staff",
    remarks: expense.remarks || "",
    date: expense.date || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  };
  setLocal(V2_EXPENSES_KEY, [saved, ...current]);
  try {
    await supabase.from("expenses").insert(saved);
  } catch (e) {}
  return saved;
}

// ----------------------------------------------------
// PURCHASING & PURCHASE RETURNS
// ----------------------------------------------------
export async function getPOSPurchases(): Promise<POSPurchase[]> {
  try {
    const { data, error } = await supabase.from("purchases").select("*, items:purchase_items(*)").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as POSPurchase[];
  } catch (e) {}
  return getLocal(V2_PURCHASES_KEY, initialPurchases);
}

export async function createPOSPurchase(purchase: Partial<POSPurchase>): Promise<POSPurchase> {
  const current = await getPOSPurchases();
  const saved: POSPurchase = {
    id: `pur_${Date.now()}`,
    invoice_no: purchase.invoice_no || `PUR-${Date.now().toString().slice(-5)}`,
    vendor_id: purchase.vendor_id,
    vendor_name: purchase.vendor_name || "Direct Supplier",
    purchase_date: purchase.purchase_date || new Date().toISOString().split("T")[0],
    total_amount: purchase.total_amount || 0,
    paid_amount: purchase.paid_amount || 0,
    balance_amount: (purchase.total_amount || 0) - (purchase.paid_amount || 0),
    payment_method: purchase.payment_method || "cash",
    status: purchase.status || "received",
    remarks: purchase.remarks || "",
    items: purchase.items || [],
    created_at: new Date().toISOString(),
  };
  setLocal(V2_PURCHASES_KEY, [saved, ...current]);

  // Update vendor balance
  if (saved.vendor_id && saved.balance_amount > 0) {
    const vendors = await getPOSVendors();
    const vIdx = vendors.findIndex(v => v.id === saved.vendor_id);
    if (vIdx >= 0) {
      vendors[vIdx].balance += saved.balance_amount;
      vendors[vIdx].payments_collected += saved.paid_amount;
      setLocal(V2_VENDORS_KEY, vendors);
    }
  }

  try {
    await supabase.from("purchases").insert(saved);
  } catch (e) {}
  return saved;
}

export async function getPOSPurchaseReturns(): Promise<POSPurchaseReturn[]> {
  try {
    const { data, error } = await supabase.from("purchase_returns").select("*, items:purchase_return_items(*)").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as POSPurchaseReturn[];
  } catch (e) {}
  return getLocal(V2_PURCHASE_RETURNS_KEY, initialPurchaseReturns);
}

export async function createPOSPurchaseReturn(pret: Partial<POSPurchaseReturn>): Promise<POSPurchaseReturn> {
  const current = await getPOSPurchaseReturns();
  const saved: POSPurchaseReturn = {
    id: `pret_${Date.now()}`,
    return_no: pret.return_no || `PRET-${Date.now().toString().slice(-5)}`,
    purchase_id: pret.purchase_id,
    purchase_invoice_no: pret.purchase_invoice_no || "",
    vendor_id: pret.vendor_id,
    vendor_name: pret.vendor_name || "Supplier",
    return_date: pret.return_date || new Date().toISOString().split("T")[0],
    total_returned_amount: pret.total_returned_amount || 0,
    refund_status: pret.refund_status || "refunded",
    reason: pret.reason || "Damaged/Rejected items",
    items: pret.items || [],
    created_at: new Date().toISOString(),
  };
  setLocal(V2_PURCHASE_RETURNS_KEY, [saved, ...current]);

  // Adjust vendor balance
  if (saved.vendor_id) {
    const vendors = await getPOSVendors();
    const vIdx = vendors.findIndex(v => v.id === saved.vendor_id);
    if (vIdx >= 0) {
      vendors[vIdx].balance = Math.max(0, vendors[vIdx].balance - saved.total_returned_amount);
      setLocal(V2_VENDORS_KEY, vendors);
    }
  }

  try {
    await supabase.from("purchase_returns").insert(saved);
  } catch (e) {}
  return saved;
}

// ----------------------------------------------------
// SALES RETURNS
// ----------------------------------------------------
export async function getPOSSaleReturns(): Promise<POSSaleReturn[]> {
  try {
    const { data, error } = await supabase.from("sale_returns").select("*, items:sale_return_items(*)").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as POSSaleReturn[];
  } catch (e) {}
  return getLocal(V2_SALE_RETURNS_KEY, initialSaleReturns);
}

export async function createPOSSaleReturn(sret: Partial<POSSaleReturn>): Promise<POSSaleReturn> {
  const current = await getPOSSaleReturns();
  const saved: POSSaleReturn = {
    id: `sret_${Date.now()}`,
    return_no: sret.return_no || `SRET-${Date.now().toString().slice(-5)}`,
    order_id: sret.order_id,
    order_number: sret.order_number || "WALKIN",
    customer_id: sret.customer_id,
    customer_name: sret.customer_name || "Walk-in Customer",
    return_date: sret.return_date || new Date().toISOString().split("T")[0],
    total_refund_amount: sret.total_refund_amount || 0,
    refund_method: sret.refund_method || "cash",
    reason: sret.reason || "Customer return request",
    items: sret.items || [],
    created_at: new Date().toISOString(),
  };
  setLocal(V2_SALE_RETURNS_KEY, [saved, ...current]);

  // If associated with a customer, deduct from spent or adjust balance
  if (saved.customer_id) {
    const customers = await getPOSCustomers();
    const cIdx = customers.findIndex(c => c.id === saved.customer_id);
    if (cIdx >= 0) {
      customers[cIdx].total_spent = Math.max(0, customers[cIdx].total_spent - saved.total_refund_amount);
      setLocal(V2_CUSTOMERS_KEY, customers);
    }
  }

  try {
    await supabase.from("sale_returns").insert(saved);
  } catch (e) {}
  return saved;
}

// ----------------------------------------------------
// HELD INVOICES MANAGEMENT
// ----------------------------------------------------
const HELD_INVOICES_KEY = "saucify_held_invoices";

export interface HeldInvoice {
  id: string;
  heldAt: string;
  customerName: string;
  customerPhone?: string;
  remarks?: string;
  mileage?: number;
  items: Array<{
    menu_item_id: string;
    name: string;
    quantity: number;
    price: number;
    box_qty?: number;
    box_price?: number;
    notes?: string;
  }>;
  subtotal: number;
  discountType: "percentage" | "flat" | "none";
  discountAmount: number;
  tax: number;
  total: number;
}

export function getHeldInvoices(): HeldInvoice[] {
  return getLocal<HeldInvoice>(HELD_INVOICES_KEY, []);
}

export function saveHeldInvoice(invoice: HeldInvoice): void {
  const current = getHeldInvoices();
  setLocal(HELD_INVOICES_KEY, [invoice, ...current]);
}

export function removeHeldInvoice(id: string): void {
  const current = getHeldInvoices();
  setLocal(HELD_INVOICES_KEY, current.filter(h => h.id !== id));
}
