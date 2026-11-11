"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getPOSCompanies, savePOSCompany, deletePOSCompany } from "@/lib/pos-v2-data";
import { POSCompany } from "@/lib/pos-data";
import { Building2, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<POSCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<POSCompany> | null>(null);

  const loadData = async () => {
    const list = await getPOSCompanies();
    setCompanies(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany?.name) return;
    await savePOSCompany(editingCompany);
    setModalOpen(false);
    setEditingCompany(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company record?")) {
      await deletePOSCompany(id);
      loadData();
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.contact_person && c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#383e29] p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#fdf6e3]">Companies & Brands</h1>
            <Badge className="bg-[#c87740]/20 text-[#c87740] border-[#c87740]/40 font-bold text-xs">Module 4</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Manage manufacturers, brands, and parent company profiles</p>
        </div>

        <Button
          onClick={() => {
            setEditingCompany({ name: "", code: "", description: "", active: true });
            setModalOpen(true);
          }}
          className="bg-[#c87740] hover:bg-[#c87740]/90 text-white font-bold h-9 px-3 rounded-xl shadow-md shadow-[#c87740]/20 flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#383e29]/60 p-3 rounded-xl border border-zinc-800">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search company by name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-200"
          />
        </div>
        <div className="text-xs text-zinc-400 font-bold">
          Total Companies: <span className="text-[#c87740]">{companies.length}</span>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <Card key={company.id} className="bg-[#383e29]/70 border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
            <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-[#c87740]/10 text-[#c87740] border border-[#c87740]/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-[#fdf6e3]">{company.name}</CardTitle>
                  {company.code && (
                    <span className="text-[10px] font-mono font-bold text-[#c87740] bg-[#c87740]/10 px-1.5 py-0.5 rounded">
                      CODE: {company.code}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={company.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-zinc-800 text-zinc-500 text-[10px]"}>
                {company.active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 space-y-2 text-xs">
              {company.description && (
                <p className="text-zinc-400 text-xs">{company.description}</p>
              )}
              {company.contact_person && (
                <p className="text-zinc-300">
                  <span className="text-zinc-500">Contact:</span> {company.contact_person}
                </p>
              )}
              {company.phone && (
                <p className="text-zinc-300 flex items-center space-x-1.5">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  <span>{company.phone}</span>
                </p>
              )}
              {company.email && (
                <p className="text-zinc-300 flex items-center space-x-1.5">
                  <Mail className="h-3 w-3 text-zinc-500" />
                  <span>{company.email}</span>
                </p>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingCompany(company);
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
                  onClick={() => handleDelete(company.id)}
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCompany?.id ? "Edit Company" : "New Company"}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Company / Brand Name"
            placeholder="e.g. Saucify Premium Foods"
            value={editingCompany?.name || ""}
            onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
            required
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Company Code"
              placeholder="e.g. SPF"
              value={editingCompany?.code || ""}
              onChange={(e) => setEditingCompany({ ...editingCompany, code: e.target.value })}
              className="text-xs"
            />
            <Input
              label="Contact Person"
              placeholder="e.g. Shahbaz Ali"
              value={editingCompany?.contact_person || ""}
              onChange={(e) => setEditingCompany({ ...editingCompany, contact_person: e.target.value })}
              className="text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Phone Number"
              placeholder="+92 300 0000000"
              value={editingCompany?.phone || ""}
              onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
              className="text-xs"
            />
            <Input
              label="Email Address"
              placeholder="contact@company.com"
              value={editingCompany?.email || ""}
              onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
              className="text-xs"
            />
          </div>
          <Input
            label="Description"
            placeholder="Notes or business description..."
            value={editingCompany?.description || ""}
            onChange={(e) => setEditingCompany({ ...editingCompany, description: e.target.value })}
            className="text-xs"
          />
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="compActive"
              checked={editingCompany?.active ?? true}
              onChange={(e) => setEditingCompany({ ...editingCompany, active: e.target.checked })}
              className="accent-[#c87740]"
            />
            <label htmlFor="compActive" className="text-xs font-bold text-zinc-300 cursor-pointer">
              Active Status
            </label>
          </div>
          <Button type="submit" className="w-full bg-[#c87740] text-white font-bold h-9 text-xs">
            Save Company Details
          </Button>
        </form>
      </Modal>
    </div>
  );
}

