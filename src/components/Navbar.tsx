'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, Car, RotateCcw, ShieldCheck, Compass, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { resetDemoAction } from '@/app/actions';

interface NavbarProps {
  confirmedCount?: number;
}

export default function Navbar({ confirmedCount = 0 }: NavbarProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoAction();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070B14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 via-cyan-500/20 to-blue-600/20 border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all duration-300 shadow-lg shadow-emerald-500/10">
            <Plane className="w-5 h-5 text-cyan-400 transform -rotate-45 group-hover:scale-110 transition-transform" />
            <Car className="w-3.5 h-3.5 text-emerald-400 absolute bottom-1.5 right-1.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AirPool <span className="text-gradient-emerald-cyan">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Flight-Aware
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 tracking-wide">
              Same airport. Same direction. One smarter ride.
            </p>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Search & Match</span>
          </Link>

          <Link
            href="/trips"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 relative"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>My Trips</span>
            {confirmedCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                {confirmedCount}
              </span>
            )}
          </Link>

          {/* Reset Demo button for Judges */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset simulated matches, confirmations, and demo pool to initial state"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/40 transition-all duration-200"
          >
            {resetSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="text-emerald-400">Reset Done!</span>
              </>
            ) : (
              <>
                <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reset Demo</span>
              </>
            )}
          </button>

          {/* User profile avatar indicator */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
