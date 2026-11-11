"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getPOSVendors, savePOSVendor, deletePOSVendor } from "@/lib/pos-v2-data";
import { POSVendor } from "@/lib/pos-data";
import { Truck, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, DollarSign, Receipt } from "lucide-react";
import Link from "next/link";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<POSVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Partial<POSVendor> | null>(null);

  const loadData = async () => {
    const list = await getPOSVendors();
    setVendors(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor?.name) return;
    await savePOSVendor(editingVendor);
    setModalOpen(false);
    setEditingVendor(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor record?")) {
      await deletePOSVendor(id);
      loadData();
    }
  };

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.company_name && v.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.contact_person && v.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOutstanding = vendors.reduce((sum, v) => sum + (v.balance || 0), 0);
  const totalPaid = vendors.reduce((sum, v) => sum + (v.payments_collected || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Food &amp; Kitchen Suppliers</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Procurement</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Manage raw kitchen vendors for poultry, dairy, bakery buns, produce, and takeaway packaging</p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/purchases">
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white h-9 px-3 rounded-xl text-xs">
              <Receipt className="h-4 w-4 mr-1 text-[#c87740]" />
              <span>Supply Purchase Bills</span>
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingVendor({ name: "", company_name: "", balance: 0, payments_collected: 0, active: true });
              setModalOpen(true);
            }}
            className="bg-[#c87740] hover:bg-[#b06530] text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Active Vendors</span>
          <div className="text-2xl font-black text-[#fdf6e3] mt-1">{vendors.length}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Vendor Outstanding Balance</span>
          <div className="text-2xl font-black text-rose-400 mt-1">Rs. {totalOutstanding.toLocaleString()}</div>
        </Card>
        <Card className="bg-[#383e29]/70 border-zinc-800 p-4">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Payments Settled</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">Rs. {totalPaid.toLocaleString()}</div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search vendor by name, phone, company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vendor) => (
          <Card key={vendor.id} className="bg-[#383e29]/70 border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
            <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-[#fdf6e3]">{vendor.name}</CardTitle>
                  {vendor.company_name && (
                    <span className="text-[11px] text-zinc-400 block">{vendor.company_name}</span>
                  )}
                </div>
              </div>
              <Badge className={vendor.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-zinc-800 text-zinc-500 text-[10px]"}>
                {vendor.active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Payable Balance</span>
                  <span className="font-mono font-black text-rose-400 text-sm">Rs. {(vendor.balance || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Payments Made</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">Rs. {(vendor.payments_collected || 0).toLocaleString()}</span>
                </div>
              </div>

              {vendor.contact_person && (
                <p className="text-zinc-300">
                  <span className="text-zinc-500">Contact:</span> {vendor.contact_person}
                </p>
              )}
              {vendor.phone && (
                <p className="text-zinc-300 flex items-center space-x-1.5">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  <span>{vendor.phone}</span>
                </p>
              )}
              {vendor.address && (
                <p className="text-zinc-400 text-[11px] flex items-center space-x-1.5">
                  <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </p>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingVendor(vendor);
                    setModalOpen(true);
                  }}
                  className="h-7 text-xs border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(vendor.id)}
                  className="h-7 text-xs border-zinc-700 text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingVendor?.id ? "Edit Vendor" : "New Vendor"}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Vendor / Supplier Name"
            placeholder="e.g. Lahore Fresh Farms"
            value={editingVendor?.name || ""}
            onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
            required
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Company Name"
              placeholder="e.g. Lahore Poultry & Meat Co."
              value={editingVendor?.company_name || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, company_name: e.target.value })}
              className="text-xs"
            />
            <Input
              label="Contact Person"
              placeholder="e.g. Rashid Minhas"
              value={editingVendor?.contact_person || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, contact_person: e.target.value })}
              className="text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Phone Number"
              placeholder="+92 321 4455667"
              value={editingVendor?.phone || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
              className="text-xs"
            />
            <Input
              label="Email Address"
              placeholder="sales@vendor.com"
              value={editingVendor?.email || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
              className="text-xs"
            />
          </div>
          <Input
            label="Address / Location"
            placeholder="e.g. Bismillah Scheme, GT Road, Lahore"
            value={editingVendor?.address || ""}
            onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Payable Balance (Rs.)"
              type="number"
              placeholder="0"
              value={editingVendor?.balance || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, balance: parseFloat(e.target.value) || 0 })}
              className="text-xs"
            />
            <Input
              label="Payments Settled (Rs.)"
              type="number"
              placeholder="0"
              value={editingVendor?.payments_collected || ""}
              onChange={(e) => setEditingVendor({ ...editingVendor, payments_collected: parseFloat(e.target.value) || 0 })}
              className="text-xs"
            />
          </div>
          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Save Vendor Record
          </Button>
        </form>
      </Modal>
    </div>
  );
}

