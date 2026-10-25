'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Plane,
  Clock,
  Navigation,
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
  Star,
  Luggage,
  Sparkles,
  Info,
  Car
} from 'lucide-react';
import { MatchCandidate } from '@/types';
import { getTransformedCloudinaryUrl } from '@/lib/cloudinary/client';

interface MatchDetailCardProps {
  candidate: MatchCandidate;
  rankIndex: number;
  onAccept: (candidate: MatchCandidate) => void;
  onReject: (matchId: string) => void;
  isAccepting: boolean;
}

export default function MatchDetailCard({
  candidate,
  rankIndex,
  onAccept,
  onReject,
  isAccepting,
}: MatchDetailCardProps) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const { tripRequest, breakdown, fare } = candidate;
  const user = tripRequest.user;

  // Cloudinary optimized face avatar
  const optimizedAvatar = getTransformedCloudinaryUrl(user.avatarUrl, {
    width: 140,
    height: 140,
    crop: 'thumb',
    gravity: 'face',
    radius: 'max',
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20';
    if (score >= 75) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-cyan-500/20';
    return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-amber-500/20';
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-6 sm:p-7 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 shadow-xl relative overflow-hidden group">
      {/* Top Banner: Rank & Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
            #{rankIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {rankIndex === 0 ? 'Optimal Route Companion' : 'Compatible Candidate'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-slate-400 font-mono">
                Window: {candidate.pickupWindowStart} – {candidate.pickupWindowEnd}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{user.name}</span>
              {user.verifiedFlight && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Flight Verified
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Big Normalized Match Score (0 - 100) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Match Score
            </span>
            <span className="text-xs text-slate-500 font-mono">Deterministic Rules</span>
          </div>
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-2xl font-black font-mono shadow-lg flex items-baseline gap-1 ${getScoreBadgeColor(
              breakdown.totalScore
            )}`}
          >
            <span>{breakdown.totalScore}</span>
            <span className="text-xs font-normal opacity-70">/100</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Passenger Info & Transparent Fare Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column: Traveler Profile & Routing (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-start gap-4">
            {/* Avatar with Cloudinary CDN tag */}
            <div className="relative shrink-0">
              <img
                src={optimizedAvatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-emerald-400 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                ✓
              </span>
            </div>

            <div className="space-y-1 text-sm flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-medium text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {user.rating.toFixed(2)}
                </span>
                <span className="text-slate-600">•</span>
                <span>{user.tripsCompleted} shared trips</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Luggage className="w-3.5 h-3.5 text-slate-300" />
                  {user.luggageCount} luggage
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Plane className="w-3.5 h-3.5 -rotate-45" />
                <span>{user.airline} • {user.flightNumber}</span>
                <span className="text-slate-500">landing ~{tripRequest.arrivalTime}</span>
              </div>

              {user.bio && (
                <p className="text-xs text-slate-400 italic pt-1">
                  &ldquo;{user.bio}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Route & Destination Information */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium text-slate-400">Drop-off Destination:</span>
              <span className="font-semibold text-white text-right truncate max-w-[240px]">
                {tripRequest.destinationAddress}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium text-slate-400">Recommended Pickup:</span>
              <span className="text-emerald-400 font-medium">
                {candidate.recommendedPickupPoint}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium text-slate-400">Optimal Vehicle:</span>
              <span className="text-cyan-300 font-medium flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                {candidate.recommendedVehicle}
              </span>
            </div>
          </div>

          {/* Algorithmic Reason Badges */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Why You Matched (Rules Evaluation):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {breakdown.reason.map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 text-slate-300 border border-slate-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Fare Split & Sustainability (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Transparent Fare Split
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  Estimated Tariff
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Save {fare.userSavingsPercent}%
              </div>
            </div>

            {/* Fare Comparison Breakdown */}
            <div className="space-y-2.5 pt-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Solo Ride Estimate:</span>
                <span className="line-through font-mono text-slate-500">
                  {fare.currency}{fare.soloBaseFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Combined Fare:</span>
                <span className="font-mono text-slate-300">
                  {fare.currency}{fare.totalSharedFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <div>
                  <span className="font-bold text-white block text-sm">Your Cost-Share:</span>
                  <span className="text-[10px] text-slate-500">Proportional route split</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {fare.currency}{fare.userShare.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-emerald-400/90 block font-semibold">
                    You save {fare.currency}{fare.userSavings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proportional Split Visual Bar */}
            <div className="pt-3 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>You ({fare.currency}{fare.userShare.toFixed(2)})</span>
                <span>{user.name.split(' ')[0]} ({fare.currency}{fare.candidateShare.toFixed(2)})</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                <div
                  className="bg-emerald-400 h-full"
                  style={{
                    width: `${Math.round((fare.userShare / fare.totalSharedFare) * 100)}%`,
                  }}
                />
                <div
                  className="bg-cyan-400 h-full"
                  style={{
                    width: `${Math.round((fare.candidateShare / fare.totalSharedFare) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="mt-3 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Carbon Reduction:
              </span>
              <span className="font-bold font-mono">-{fare.co2SavedKg} kg CO₂</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onAccept(candidate)}
              disabled={isAccepting}
              className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAccepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Capacity & Locking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Lock Ride ({fare.currency}{fare.userShare.toFixed(2)})</span>
                </>
              )}
            </button>

            <button
              onClick={() => onReject(candidate.id)}
              disabled={isAccepting}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Decline / View Next Candidate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Algorithmic Breakdown Modal / Accordion */}
      <div className="mt-5 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setShowScoreDetails(!showScoreDetails)}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showScoreDetails ? 'Hide' : 'Inspect'} 4-Factor Deterministic Algorithm Weights</span>
          {showScoreDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showScoreDetails && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Route (40%)</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {breakdown.routeScore}/100
                </div>
                <div className="text-[10px] text-slate-500">Corridor overlap</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Wait Time (25%)</div>
                <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                  {breakdown.waitTimeScore}/100
                </div>
                <div className="text-[10px] text-slate-500">{breakdown.waitTimeMins}m arrival gap</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Detour (20%)</div>
                <div className="text-base font-bold text-teal-400 font-mono mt-0.5">
                  {breakdown.detourScore}/100
                </div>
                <div className="text-[10px] text-slate-500">~{breakdown.detourMins}m extra detour</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Fare Fairness (15%)</div>
                <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
                  {breakdown.fareScore}/100
                </div>
                <div className="text-[10px] text-slate-500">Equitable split</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Score = ({breakdown.routeScore} × 0.40) + ({breakdown.waitTimeScore} × 0.25) + ({breakdown.detourScore} × 0.20) + ({breakdown.fareScore} × 0.15) = <strong>{breakdown.totalScore} / 100</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
