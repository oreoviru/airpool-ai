'use client';

import React from 'react';
import { Plane, Zap, Users, ShieldCheck, ArrowRight, TrendingDown, Sparkles, Navigation } from 'lucide-react';

interface HeroBannerProps {
  onQuickDemoSelect?: (airport: string, zoneId: string) => void;
}

export default function HeroBanner({ onQuickDemoSelect }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800/60">
      {/* Decorative gradient glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Telemetry pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-mono text-emerald-400 shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide uppercase">Flight-Aware Matching Active</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">8+ Seeded Travelers In Pool</span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Same airport. Same direction.{' '}
            <span className="text-gradient-emerald-cyan block sm:inline">
              One smarter ride.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Stop riding solo in airport traffic. AirPool AI synchronously matches arriving passengers heading down the same urban corridor, cutting fares by up to <strong className="text-emerald-400">45%</strong> with zero awkward stops.
          </p>

          {/* Key Value Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="glass-panel p-3.5 rounded-xl text-center border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xl sm:text-2xl">
                <TrendingDown className="w-5 h-5" />
                42%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">Avg Fare Savings</div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl text-center border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-bold text-xl sm:text-2xl">
                <Navigation className="w-5 h-5" />
                &lt; 12m
              </div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">Max Detour Cap</div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl text-center border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xl sm:text-2xl">
                <ShieldCheck className="w-5 h-5" />
                100%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">Verified Flyers</div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl text-center border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold text-xl sm:text-2xl">
                <Zap className="w-5 h-5" />
                4-Factor
              </div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-medium">Deterministic Rules</div>
            </div>
          </div>

          {/* Quick Demo Shortcuts for Hackathon Judges */}
          {onQuickDemoSelect && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Judge Quick-Fill:</span>
              <button
                type="button"
                onClick={() => onQuickDemoSelect('SFO', 'sfo-downtown-market')}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>✈️ SFO → Downtown SF</span>
                <span className="text-[10px] text-emerald-400 font-mono">Top Match</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickDemoSelect('JFK', 'jfk-midtown')}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>✈️ JFK → Midtown Manhattan</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickDemoSelect('BLR', 'blr-indiranagar')}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>✈️ BLR → Indiranagar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
