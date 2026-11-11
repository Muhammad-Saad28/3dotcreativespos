"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Cpu } from "lucide-react";

export function SplashScreen() {
  const [progress, setProgress] = useState(1);
  const [stageText, setStageText] = useState("Initializing Core Engine...");
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const stages = [
      { at: 1, text: "Initializing Core Engine..." },
      { at: 20, text: "Syncing Offline Ledger & Local DB..." },
      { at: 50, text: "Calibrating Liquid-Glass Shaders..." },
      { at: 80, text: "Loading 3Dot Creatives POS Ecosystem..." },
      { at: 98, text: "Ready to launch..." },
    ];

    const startTime = performance.now();
    const duration = 2400; // 2.4s for clean, steady 1 to 100 count-up

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const rawPct = Math.min((elapsed / duration) * 100, 100);
      const integerPct = Math.max(1, Math.min(100, Math.floor(rawPct)));

      setProgress(integerPct);

      for (let i = stages.length - 1; i >= 0; i--) {
        if (integerPct >= stages[i].at) {
          setStageText(stages[i].text);
          break;
        }
      }

      if (rawPct < 100) {
        requestAnimationFrame(animate);
      } else {
        // Complete at 100%
        setProgress(100);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            setShouldRender(false);
          }, 700); // smooth fade transition into login
        }, 350);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0E100C] text-[#F4EBDD] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isDone ? "opacity-0 scale-105 pointer-events-none blur-md" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Studio Refraction Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#B98245]/20 via-[#59613B]/15 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#59613B]/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D8C3A5]/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0E100C]/40 to-[#0E100C]/90" />
      </div>

      {/* Main Glass Floating Monolith */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-4 px-6 py-8">
        
        {/* Pulsing Orbital Halo */}
        <div className="relative flex items-center justify-center mb-7">
          <div className="absolute -inset-6 rounded-[36px] border border-[#B98245]/30 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-3 rounded-[32px] border border-dashed border-[#D8C3A5]/30 animate-[spin_14s_linear_infinite_reverse]" />
          
          <div className="relative h-24 w-24 rounded-[26px] p-1.5 realistic-glass shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.7)] group">
            <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-[#F4EBDD] shadow-inner flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="3Dot Creatives"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
            </div>

            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#B98245]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#B98245]" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#B98245]" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#B98245]" />
          </div>
        </div>

        {/* Brand Wordmark & Animated Kinetic 3 Dots */}
        <div className="text-center space-y-1 mb-8">
          <div className="flex items-center justify-center space-x-1.5">
            <h1 className="text-3xl font-serif font-bold tracking-wide text-[#F4EBDD] drop-shadow-md">
              3dot<span className="text-[#B98245]">creatives</span>
            </h1>
            
            <div className="flex items-center space-x-1 pt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B98245] animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#59613B] animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8C3A5] animate-bounce" />
            </div>
          </div>

          <p className="text-[11px] font-sans font-medium text-[#D8C3A5] uppercase tracking-[0.25em]">
            Creative Studio Ecosystem
          </p>
        </div>

        {/* Loading Bar (Visibly increments 1 -> 100) */}
        <div className="w-full space-y-3 font-mono">
          <div className="relative h-2.5 w-full rounded-full bg-black/70 border border-white/15 p-0.5 shadow-inner backdrop-blur-md overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#59613B] via-[#8C6030] to-[#B98245] shadow-[0_0_12px_#B98245] transition-all duration-75 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white rounded-full shadow-[0_0_8px_white]" />
            </div>
          </div>

          {/* Status Text & 1-100 Percentage Indicator */}
          <div className="flex items-center justify-between text-[11px] text-[#D8C3A5]">
            <span className="truncate pr-2 font-medium tracking-wide flex items-center gap-1.5 font-sans">
              <Cpu className="h-3.5 w-3.5 text-[#B98245] animate-spin" />
              {stageText}
            </span>
            <span className="font-bold text-[#F4EBDD] tabular-nums font-mono text-xs">
              {progress}%
            </span>
          </div>
        </div>

        {/* Micro Footer Badge */}
        <div className="mt-8 flex items-center space-x-2 text-[10px] text-[#59613B] font-bold tracking-widest uppercase font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-[#B98245]" />
          <span>Timeless Studio Architecture</span>
        </div>
      </div>
    </div>
  );
}
