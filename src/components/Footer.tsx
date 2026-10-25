'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, RotateCcw, ShieldCheck, Database, Cloud, FileText, CheckCircle2 } from 'lucide-react';
import { resetDemoAction } from '@/app/actions';

export default function Footer() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemoAction();
      setDone(true);
      setTimeout(() => {
        setDone(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <footer className="border-t border-slate-800/80 bg-[#05080F] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Compliance and Regulatory Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-400">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Compliance & Regulatory Notice: </span>
              AirPool AI is a flight-aware peer route optimization and cost-sharing coordinator. All listed fares prior to ride confirmation are algorithmic estimates calculated from standardized airport-to-zone tariffs and proportional detour overhead. AirPool AI operates strictly under statutory non-commercial carpooling and peer rideshare guidelines.
            </div>
          </div>
        </div>

        {/* Main Footer Links & Integrations */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-800/60 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Plane className="w-4 h-4 text-emerald-400 -rotate-45" />
            </div>
            <div>
              <span className="font-bold text-slate-200">AirPool AI</span>
              <span className="text-xs text-slate-500 block">Flight-Aware Mobility Protocol</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Supabase PostgreSQL
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              Cloudinary Media
            </span>
            <Link href="/trips" className="hover:text-emerald-400 transition-colors">
              My Trips Dashboard
            </Link>
          </div>

          {/* Reset Demo button for quick 2-minute pitch reset */}
          <div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer"
            >
              {done ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Demo Pool Reset!</span>
                </>
              ) : (
                <>
                  <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${resetting ? 'animate-spin' : ''}`} />
                  <span>Reset Demo (Judge Pitch)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600">
          &copy; 2026 AirPool AI. Same airport. Same direction. One smarter ride.
        </div>
      </div>
    </footer>
  );
}
