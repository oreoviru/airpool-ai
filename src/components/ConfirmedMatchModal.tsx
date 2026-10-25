'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import {
  CheckCircle2,
  Car,
  ShieldCheck,
  MapPin,
  Clock,
  Key,
  Users,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { MatchCandidate, TripConfirmation } from '@/types';
import { getTransformedCloudinaryUrl } from '@/lib/cloudinary/client';

interface ConfirmedMatchModalProps {
  confirmation: TripConfirmation;
  candidate: MatchCandidate;
  onClose: () => void;
}

export default function ConfirmedMatchModal({
  confirmation,
  candidate,
  onClose,
}: ConfirmedMatchModalProps) {
  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F5A0', '#00E5FF', '#38BDF8', '#FFFFFF'],
      });
    } catch (e) {
      // Non-fatal if canvas not supported in test env
    }
  }, []);

  const companion = candidate.tripRequest.user;
  const avatar = getTransformedCloudinaryUrl(companion.avatarUrl, {
    width: 120,
    height: 120,
    crop: 'thumb',
    gravity: 'face',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with verified badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Ride Confirmed & Synchronized
          </span>
          <h2 className="text-2xl font-black text-white">You & {companion.name}</h2>
          <p className="text-xs text-slate-400">
            Same airport, same direction. Both passengers verified and fare split locked.
          </p>
        </div>

        {/* 4-Digit Pickup PIN for Mutual Verification */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Mutual Verification Pickup PIN
          </div>
          <div className="text-3xl font-black font-mono tracking-widest text-emerald-400">
            {confirmation.pickupCode}
          </div>
          <p className="text-[10px] text-slate-500">
            Show this PIN to your companion & driver at the airport rideshare island.
          </p>
        </div>

        {/* Dispatched Vehicle & Companion info */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-400" />
                Vehicle & Driver:
              </span>
              <span className="font-semibold text-white">{confirmation.driverName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Driver Status:
              </span>
              <span className="text-emerald-400 font-mono font-semibold">
                Arriving at Terminal in ~{confirmation.estimatedArrivalMins} mins
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Meeting Spot:
              </span>
              <span className="text-white font-medium text-right">
                {candidate.recommendedPickupPoint}
              </span>
            </div>
          </div>

          {/* Companion card */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={companion.name}
                className="w-10 h-10 rounded-xl object-cover border border-emerald-400/40"
              />
              <div>
                <span className="font-bold text-white block">{companion.name}</span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Flight {companion.flightNumber} ({companion.airline})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Your Split:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {candidate.fare.currency}{candidate.fare.userShare.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/trips"
            className="flex-1 py-3 rounded-xl font-bold text-center text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <span>View in My Trips</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
