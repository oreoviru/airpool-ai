'use client';

import React from 'react';
import { AlertCircle, Sliders, Clock, Users, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { TripRequest } from '@/types';

interface UnmatchedFallbackStateProps {
  request: TripRequest;
  onAdjustParameters: (adjustments: { maxWaitMins?: number; maxDetourMins?: number }) => void;
  onResetSearch: () => void;
}

export default function UnmatchedFallbackState({
  request,
  onAdjustParameters,
  onResetSearch,
}: UnmatchedFallbackStateProps) {
  return (
    <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-slate-700/80 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          No Direct Matches Within Strict Constraints
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Our deterministic engine evaluated active travelers at <span className="text-white font-semibold">{request.airportCode}</span>, but none currently meet all 5 hard constraints:
        </p>
      </div>

      {/* Constraints that blocked matching */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-left space-y-2">
        <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
          Evaluated Hard Constraints:
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>• Airport Compatibility:</span>
          <span className="text-emerald-400 font-mono">Matched ({request.airportCode})</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>• Max Wait Window ({request.maxWaitMins}m):</span>
          <span className="text-amber-400 font-mono">Requires +10-15m flexibility</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>• Max Detour Cap (+{request.maxDetourMins}m):</span>
          <span className="text-amber-400 font-mono">Nearby drop-offs require +5m</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>• Vehicle Capacity:</span>
          <span className="text-emerald-400 font-mono">Passed (&le; 4 passengers)</span>
        </div>
      </div>

      {/* Recommended Quick Actions to Relax Constraints */}
      <div className="space-y-3 pt-2">
        <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">
          One-Click Adjustments:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onAdjustParameters({ maxWaitMins: request.maxWaitMins + 15 })}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Expand Wait Window (+15m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Increases wait limit to {request.maxWaitMins + 15} mins to unlock adjacent landings.
            </p>
          </button>

          <button
            onClick={() => onAdjustParameters({ maxDetourMins: request.maxDetourMins + 10 })}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Increase Detour Cap (+10m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Allows drop-offs in adjacent neighborhoods along the corridor.
            </p>
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Edit Search Criteria</span>
        </button>
      </div>
    </div>
  );
}
