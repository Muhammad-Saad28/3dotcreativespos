"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  UtensilsCrossed,
  Store,
  Building2,
  Receipt,
  Boxes,
  Truck,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const [portal, setPortal] = useState<"restaurant" | "admin">("restaurant");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("cashier@3dotcreatives.agency");
  const [password, setPassword] = useState("cashier123");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, register } = useAuth();

  const handlePortalChange = (selectedPortal: "restaurant" | "admin") => {
    setPortal(selectedPortal);
    setError(null);
    setSuccess(null);
    if (selectedPortal === "restaurant") {
      setEmail("cashier@3dotcreatives.agency");
      setPassword("cashier123");
    } else {
      setEmail("admin@3dotcreatives.agency");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const targetRole = portal === "admin" ? "admin" : "cashier";

    try {
      if (mode === "register") {
        if (!name) {
          setError("Please enter your full name");
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, password, targetRole);
        if (res.isPending) {
          setSuccess(`Registration submitted for ${name}! Account status is PENDING admin approval.`);
          setPassword("");
          setIsLoading(false);
          return;
        }
        setSuccess("Account registered successfully! Redirecting...");
        setTimeout(() => {
          if (res.role === "admin") router.push("/admin/dashboard");
          else router.push("/cashier/pos");
        }, 800);
      } else {
        const res = await signIn(email, password, targetRole);
        if (res.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/cashier/pos");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your portal selection and login details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E100C] text-[#F4EBDD] p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Refraction Lighting Mesh (Creative Studio Palette) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Rusty Gold Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#B98245]/20 via-[#59613B]/15 to-transparent rounded-full blur-[140px]" />
        
        {/* Soft Olive Glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#59613B]/20 rounded-full blur-[130px]" />

        {/* Midnight Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0E100C]/40 to-[#0E100C]/90" />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          {/* Logo Container with Refractive Glass Rim */}
          <div className="h-16 w-16 rounded-[20px] p-1 realistic-glass shadow-[0_12px_32px_rgba(185,130,69,0.35)] flex items-center justify-center mb-1">
            <div className="w-full h-full rounded-[16px] overflow-hidden bg-[#F4EBDD] flex items-center justify-center">
              <img src="/logo.jpeg" alt="3Dot Creatives" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide text-[#F4EBDD]">
            3dot<span className="text-[#B98245]">creatives</span> POS
          </h1>
          <p className="text-xs font-mono text-[#D8C3A5] uppercase tracking-[0.25em]">
            Hospitality &amp; Restaurant Suite
          </p>
        </div>

        {/* Niche Portal Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 glass-surface-card rounded-2xl border-white/10 shadow-2xl">
          {/* Option 1: Restaurant Front Counter */}
          <button
            type="button"
            onClick={() => handlePortalChange("restaurant")}
            className={`flex flex-col items-center text-center p-3 rounded-xl transition-all cursor-pointer ${
              portal === "restaurant"
                ? "bg-[#B98245] text-[#0E100C] shadow-lg shadow-[#B98245]/30 font-bold"
                : "text-[#D8C3A5] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Restaurant POS</span>
            </div>
            <span className={`text-[10px] mt-0.5 ${portal === "restaurant" ? "text-[#0E100C]/90 font-semibold" : "text-[#D8C3A5]/70"}`}>
              Counter, Tables &amp; Kitchen
            </span>
          </button>

          {/* Option 2: Business Management & HQ */}
          <button
            type="button"
            onClick={() => handlePortalChange("admin")}
            className={`flex flex-col items-center text-center p-3 rounded-xl transition-all cursor-pointer ${
              portal === "admin"
                ? "bg-[#B98245] text-[#0E100C] shadow-lg shadow-[#B98245]/30 font-bold"
                : "text-[#D8C3A5] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Business &amp; Supply HQ</span>
            </div>
            <span className={`text-[10px] mt-0.5 ${portal === "admin" ? "text-[#0E100C]/90 font-semibold" : "text-[#D8C3A5]/70"}`}>
              Vendors, Ledger &amp; Audits
            </span>
          </button>
        </div>

        {/* Niche Scope Descriptor Card */}
        <div className="p-4 rounded-2xl glass-surface-card border-white/10 text-xs shadow-xl space-y-2">
          <div className="flex items-center justify-between font-bold text-[#F4EBDD] pb-2.5 border-b border-white/10">
            <span className="flex items-center space-x-1.5 text-[#B98245] font-serif font-bold tracking-wide text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{portal === "restaurant" ? "Front-of-House Restaurant Mode" : "Back-Office Management & Supply Mode"}</span>
            </span>
            <span className="text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded-full border border-white/15 text-[#D8C3A5]">
              {portal === "restaurant" ? "Fast Terminal" : "ERP & Accounting"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#D8C3A5]">
            {portal === "restaurant" ? (
              <>
                <div className="flex items-center space-x-1.5">
                  <Receipt className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Express POS &amp; Billing</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Store className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Floor Tables &amp; Dine-In</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Cash Drawer &amp; Shifts [F8]</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Kitchen Ticket Dispatch</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Food &amp; Kitchen Suppliers</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Boxes className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Recipe Depletion &amp; Raw Stock</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Income, Expenses &amp; Ledger</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#B98245]" />
                  <span>Shift Audits &amp; Variances</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Authentication Form Card */}
        <div className="glass-surface-card rounded-[28px] p-6 sm:p-8 shadow-2xl border-white/10">
          {/* Mode Switcher (Sign In vs Register / Request Access) */}
          <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 mb-5 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "login" ? "bg-[#B98245] text-[#0E100C] shadow-md" : "text-[#D8C3A5] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "register" ? "bg-[#B98245] text-[#0E100C] shadow-md" : "text-[#D8C3A5] hover:text-white"
              }`}
            >
              Request Access
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
              <span className="font-bold">Error: </span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#D8C3A5] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D8C3A5]/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "register"}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4EBDD] placeholder:text-[#D8C3A5]/40 focus:outline-none focus:border-[#B98245] transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#D8C3A5] mb-1.5">
                {portal === "restaurant" ? "Cashier Account / Email" : "Admin ID / Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D8C3A5]/60" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={portal === "restaurant" ? "cashier@3dotcreatives.agency" : "admin@3dotcreatives.agency"}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4EBDD] placeholder:text-[#D8C3A5]/40 focus:outline-none focus:border-[#B98245] transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#D8C3A5] mb-1.5">
                Security Password / Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D8C3A5]/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4EBDD] placeholder:text-[#D8C3A5]/40 focus:outline-none focus:border-[#B98245] transition-all shadow-inner"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#B98245] to-[#8C6030] hover:from-[#d49852] hover:to-[#B98245] text-[#0E100C] font-bold text-sm rounded-xl shadow-lg shadow-[#B98245]/30 flex items-center justify-center space-x-2 mt-2 transition-all cursor-pointer font-sans"
            >
              <span>
                {isLoading
                  ? "Verifying Session..."
                  : mode === "register"
                  ? `Register for ${portal === "restaurant" ? "Restaurant Counter" : "Business HQ"}`
                  : `Enter ${portal === "restaurant" ? "Restaurant POS Counter" : "Business HQ Dashboard"}`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Pre-fill Link */}
          <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#D8C3A5] font-sans">
            <span>Quick Fill Credentials:</span>
            <button
              type="button"
              onClick={() => {
                if (portal === "restaurant") {
                  setEmail("cashier@3dotcreatives.agency");
                  setPassword("cashier123");
                } else {
                  setEmail("admin@3dotcreatives.agency");
                  setPassword("admin123");
                }
              }}
              className="text-[#B98245] hover:text-[#d49852] underline font-bold cursor-pointer"
            >
              Load Default {portal === "restaurant" ? "Cashier" : "Admin"} Login
            </button>
          </div>
        </div>

        <p className="text-center text-xs font-mono text-[#D8C3A5]/60">
          3Dot Creatives Hospitality POS &bull; Enterprise Restaurant Suite
        </p>
      </div>
    </div>
  );
}
