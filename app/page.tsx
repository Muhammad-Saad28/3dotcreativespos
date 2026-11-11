"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user.role === "kitchen") {
        router.replace("/kitchen/dashboard");
      } else if (user.role === "cashier") {
        router.replace("/cashier/dashboard");
      } else if (user.role === "rider") {
        router.replace("/rider/dashboard");
      } else {
        router.replace("/waiter/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-2xl bg-[#fdf6e3] p-2.5 shadow-2xl border border-[#d8c3a5]/40 flex items-center justify-center ring-4 ring-[#c87740]/20">
          <img src="/logo.png" alt="3Dot Creatives Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-[#fdf6e3]">3dot<span className="text-[#c87740]">creatives</span> POS</h1>
          <p className="text-xs text-[#d8c3a5] font-bold tracking-widest uppercase">Point of Sale & Management</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-[#c87740] font-semibold pt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading system environment...</span>
        </div>
      </div>
    </div>
  );
}
