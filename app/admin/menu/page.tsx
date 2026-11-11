"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { 
  getPOSMenuItems, 
  getPOSCategories, 
  getPOSInventory, 
  getPOSMenuItemIngredients, 
  addPOSMenuItemIngredient, 
  deletePOSMenuItemIngredient,
  addPOSMenuItem,
  togglePOSMenuItemAvailability,
  deletePOSMenuItem,
  POSMenuItem, 
  POSCategory, 
  POSInventoryItem, 
  POSMenuItemIngredient 
} from "@/lib/pos-data";
import { getPOSCompanies } from "@/lib/pos-v2-data";
import { POSCompany } from "@/lib/pos-data";
import { 
  Search, 
  Plus, 
  Edit2, 
  Tag, 
  Layers, 
  Trash2, 
  Barcode, 
  Download, 
  Printer, 
  Sliders, 
  CheckCircle, 
  XCircle,
  FileSpreadsheet
} from "lucide-react";

export default function AdminMenuPage() {
  const [items, setItems] = useState<POSMenuItem[]>([]);
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [companies, setCompanies] = useState<POSCompany[]>([]);
  const [inventoryList, setInventoryList] = useState<POSInventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Item State with Module 5 fields:
  // product code, barcode, cost price, sale price, box qty, box price, formula, discount
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newCostPrice, setNewCostPrice] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState("");
  const [newBoxQty, setNewBoxQty] = useState("1");
  const [newBoxPrice, setNewBoxPrice] = useState("");
  const [newFormula, setNewFormula] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Recipe Modal State
  const [recipeMenuItem, setRecipeMenuItem] = useState<POSMenuItem | null>(null);
  const [ingredients, setIngredients] = useState<POSMenuItemIngredient[]>([]);
  const [selectedInvId, setSelectedInvId] = useState("");
  const [qtyRequired, setQtyRequired] = useState("");

  // Barcode Print Modal
  const [barcodePrintItem, setBarcodePrintItem] = useState<POSMenuItem | null>(null);

  const refreshData = async () => {
    const [fetchedItems, fetchedCats, fetchedInv, fetchedComps] = await Promise.all([
      getPOSMenuItems(),
      getPOSCategories(),
      getPOSInventory(),
      getPOSCompanies(),
    ]);
    setItems(fetchedItems);
    setCategories(fetchedCats);
    setInventoryList(fetchedInv);
    setCompanies(fetchedComps);
    if (fetchedCats.length > 0 && !newCategory) {
      setNewCategory(fetchedCats[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleAvailability = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStatus = !item.available;
    setItems(items.map((i) => (i.id === id ? { ...i, available: newStatus } : i)));
    await togglePOSMenuItemAvailability(id, newStatus);
  };

  const handleAddItem = async () => {
    if (!newName || !newSalePrice) return;
    const priceNum = parseFloat(newSalePrice) || 0;
    const costNum = parseFloat(newCostPrice) || 0;
    const boxQtyNum = parseFloat(newBoxQty) || 1;
    const boxPriceNum = parseFloat(newBoxPrice) || (priceNum * boxQtyNum);
    const discNum = parseFloat(newDiscountPercent) || 0;

    await addPOSMenuItem({
      category_id: newCategory,
      name: newName,
      description: newDesc || null,
      price: priceNum,
      code: newCode || `P-${Date.now().toString().slice(-4)}`,
      barcode: newBarcode || Date.now().toString().slice(-8),
      cost_price: costNum,
      box_qty: boxQtyNum,
      box_price: boxPriceNum,
      formula: newFormula || null,
      company_id: newCompany || null,
      discount_percent: discNum,
    });

    setIsAddModalOpen(false);
    setNewName("");
    setNewCode("");
    setNewBarcode("");
    setNewCostPrice("");
    setNewSalePrice("");
    setNewBoxQty("1");
    setNewBoxPrice("");
    setNewFormula("");
    setNewDesc("");
    await refreshData();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setItems(items.filter(i => i.id !== id));
      await deletePOSMenuItem(id);
      await refreshData();
    }
  };

  const openRecipeModal = async (item: POSMenuItem) => {
    setRecipeMenuItem(item);
    const fetchedIngs = await getPOSMenuItemIngredients(item.id);
    setIngredients(fetchedIngs);
  };

  const handleAddIngredient = async () => {
    if (!recipeMenuItem || !selectedInvId || !qtyRequired) return;
    const inv = inventoryList.find(i => i.id === selectedInvId);
    if (!inv) return;

    await addPOSMenuItemIngredient({
      menu_item_id: recipeMenuItem.id,
      inventory_id: selectedInvId,
      inventory_name: inv.name,
      quantity_required: parseFloat(qtyRequired),
      unit: inv.unit,
    });

    setSelectedInvId("");
    setQtyRequired("");
    const fetchedIngs = await getPOSMenuItemIngredients(recipeMenuItem.id);
    setIngredients(fetchedIngs);
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!recipeMenuItem) return;
    await deletePOSMenuItemIngredient(id);
    const fetchedIngs = await getPOSMenuItemIngredients(recipeMenuItem.id);
    setIngredients(fetchedIngs);
  };

  // Export Product Data as CSV
  const handleExportProducts = () => {
    const headers = ["Product Code", "Barcode", "Product Name", "Category", "Cost Price", "Sale Price", "Discount %", "Box Qty", "Box Price", "Formula", "Status"];
    const rows = items.map(i => [
      i.code || "-",
      i.barcode || "-",
      i.name,
      i.category_name || "-",
      i.cost_price || 0,
      i.price,
      i.discount_percent || 0,
      i.box_qty || 1,
      i.box_price || (i.price * (i.box_qty || 1)),
      i.formula || "-",
      i.available ? "Active" : "Inactive"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Products_Catalogue_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category_name === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && item.available) ||
      (selectedStatus === "Inactive" && !item.available);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.formula && item.formula.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171b13] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Product Catalogue & Management</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Module 5</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Maintain product codes, purchase costs, sale prices, formulas, and barcode printing</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportProducts}
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-3 rounded-xl text-xs flex items-center space-x-1"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </Button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#171b13]/60 p-3 rounded-2xl border border-zinc-800">
        <div className="sm:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by code, barcode, formula, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full glass-surface-card rounded-xl px-3 h-9 text-xs text-white focus:outline-hidden"
          >
            <option value="All">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full glass-surface-card rounded-xl px-3 h-9 text-xs text-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Products Only</option>
            <option value="Inactive">Inactive / Disabled Products</option>
          </select>
        </div>
      </div>

      {/* Products Table (Retail ERP Complete View) */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#171b13]/60 shadow-lg">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Code / Barcode</th>
              <th className="p-3">Product Name & Formula</th>
              <th className="p-3">Category</th>
              <th className="p-3">Purchase Cost</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Box Qty / Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-800/30">
                <td className="p-3">
                  <span className="font-mono font-bold text-[#c87740] block">{item.code || "N/A"}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{item.barcode || "No Barcode"}</span>
                </td>
                <td className="p-3">
                  <span className="font-bold text-white block">{item.name}</span>
                  {item.formula && (
                    <span className="text-[10px] text-zinc-400 italic block">{item.formula}</span>
                  )}
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">
                    {item.category_name || "Specialty"}
                  </Badge>
                </td>
                <td className="p-3 font-mono text-zinc-400">
                  Rs. {item.cost_price || 0}
                </td>
                <td className="p-3 font-mono font-bold text-emerald-400">
                  Rs. {item.price}
                </td>
                <td className="p-3 font-mono text-[11px] text-zinc-300">
                  {item.box_qty || 1} units @ Rs. {item.box_price || (item.price * (item.box_qty || 1))}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      item.available
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                    }`}
                  >
                    {item.available ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {/* Barcode Print Action */}
                    <button
                      onClick={() => setBarcodePrintItem(item)}
                      title="Print Barcode Label"
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-[#c87740]"
                    >
                      <Barcode className="h-3.5 w-3.5 text-[#c87740]" />
                    </button>

                    {/* Recipe Mapping Action */}
                    <button
                      onClick={() => openRecipeModal(item)}
                      title="Map Ingredients"
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    </button>

                    {/* Delete Action */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete Product"
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: New Product Creation */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Product">
        <div className="space-y-3">
          <Input
            label="Product Name"
            placeholder="e.g. 3Dot Creatives Signature Burger"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="text-xs"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1">Company / Brand</label>
              <select
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full glass-surface-card rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-hidden"
              >
                <option value="">No Company Assigned</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Product Code [Alt+C]"
              placeholder="e.g. BURG-001"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="text-xs"
            />
            <Input
              label="Barcode / SKU"
              placeholder="e.g. 8964000123"
              value={newBarcode}
              onChange={(e) => setNewBarcode(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Purchase / Cost Price (Rs.)"
              type="number"
              placeholder="450"
              value={newCostPrice}
              onChange={(e) => setNewCostPrice(e.target.value)}
              className="text-xs font-mono"
            />
            <Input
              label="Selling Price (Rs.)"
              type="number"
              placeholder="750"
              value={newSalePrice}
              onChange={(e) => setNewSalePrice(e.target.value)}
              className="text-xs font-mono font-bold text-emerald-400"
            />
            <Input
              label="Sale Discount (%)"
              type="number"
              placeholder="0"
              value={newDiscountPercent}
              onChange={(e) => setNewDiscountPercent(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Box Quantity (Units)"
              type="number"
              placeholder="1"
              value={newBoxQty}
              onChange={(e) => setNewBoxQty(e.target.value)}
              className="text-xs"
            />
            <Input
              label="Box Selling Price (Rs.)"
              type="number"
              placeholder="e.g. 7500"
              value={newBoxPrice}
              onChange={(e) => setNewBoxPrice(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <Input
            label="Formula / Recipe Note"
            placeholder="e.g. 150g beef patty, double gouda, secret sauce"
            value={newFormula}
            onChange={(e) => setNewFormula(e.target.value)}
            className="text-xs"
          />

          <Input
            label="Product Description"
            placeholder="Menu catalogue brief description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="text-xs"
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddItem} className="bg-[#c87740] text-white font-bold text-xs h-9">
              Save Product Record
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Barcode Label Print View */}
      <Modal isOpen={!!barcodePrintItem} onClose={() => setBarcodePrintItem(null)} title="Print Product Barcode">
        {barcodePrintItem && (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-white text-black rounded-xl border border-zinc-300 inline-block mx-auto space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wide">3DOT CREATIVES POS</p>
              <h4 className="font-black text-sm">{barcodePrintItem.name}</h4>
              <div className="py-2 border-y border-dashed border-black">
                {/* SVG Mock Barcode Lines */}
                <div className="flex justify-center items-center space-x-1 h-12">
                  <div className="w-1 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-1.5 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-1 bg-black h-full" />
                  <div className="w-2 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-1.5 bg-black h-full" />
                  <div className="w-1 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-2 bg-black h-full" />
                </div>
                <p className="font-mono text-xs font-bold tracking-widest mt-1">
                  {barcodePrintItem.barcode || barcodePrintItem.code || "8964000123"}
                </p>
              </div>
              <p className="font-mono font-black text-sm">Rs. {barcodePrintItem.price}</p>
            </div>

            <Button
              onClick={() => window.print()}
              className="w-full bg-[#c87740] text-white font-bold h-9 text-xs flex items-center justify-center space-x-1"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sticker Label</span>
            </Button>
          </div>
        )}
      </Modal>

      {/* Recipe / Ingredients Mapping Modal */}
      <Modal isOpen={!!recipeMenuItem} onClose={() => setRecipeMenuItem(null)} title={`Recipe Mapping - ${recipeMenuItem?.name}`}>
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Link raw inventory stock required for 1 serving of <span className="font-bold text-white">{recipeMenuItem?.name}</span>. Stock is automatically deducted when orders complete.
          </p>

          {/* Current Recipe List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ingredients.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                No inventory ingredients mapped to this dish yet.
              </div>
            ) : (
              ingredients.map((ing) => (
                <div key={ing.id} className="p-2.5 rounded-xl glass-surface-card flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{ing.inventory_name}</span>
                    <span className="text-zinc-500 ml-2">({ing.quantity_required} {ing.unit} per serving)</span>
                  </div>
                  <button
                    onClick={() => handleDeleteIngredient(ing.id)}
                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Recipe Ingredient Form */}
          <div className="p-3 rounded-xl glass-surface-card space-y-3">
            <p className="text-xs font-bold text-[#c87740] uppercase">Add Ingredient to Recipe</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1 font-bold">Raw Stock Item</label>
                <select
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all rounded-lg p-2 text-xs text-zinc-100"
                >
                  <option value="">-- Select Inventory --</option>
                  {inventoryList.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1 font-bold">Qty per Serving</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.25"
                  value={qtyRequired}
                  onChange={(e) => setQtyRequired(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all rounded-lg p-2 text-xs text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
            </div>

            <Button
              size="sm"
              disabled={!selectedInvId || !qtyRequired}
              onClick={handleAddIngredient}
              className="w-full bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold text-xs"
            >
              Add Recipe Ingredient
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

