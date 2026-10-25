'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plane,
  Car,
  Clock,
  MapPin,
  Key,
  Users,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { TripConfirmation, TripRequest } from '@/types';
import { getUserTripsAction } from '@/app/actions';
import { getTransformedCloudinaryUrl } from '@/lib/cloudinary/client';

export default function MyTripsPage() {
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [confirmations, setConfirmations] = useState<TripConfirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await getUserTripsAction();
        setRequests(data.requests || []);
        setConfirmations(data.confirmations || []);
      } catch (err) {
        console.error('Error loading trips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>My Airport Trips & Rides</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Supabase Persisted
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review confirmed carpool arrangements, mutual pickup PINs, and active requests.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plane className="w-3.5 h-3.5 -rotate-45" />
          <span>New Trip Search</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading trips from database...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 1. Confirmed Arrangements Section (Compliance distinction from estimates) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Confirmed Ride Arrangements ({confirmations.length})</span>
              </h2>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Locked & Dispatched
              </span>
            </div>

            {confirmations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {confirmations.map((conf) => {
                  return (
                    <div
                      key={conf.id}
                      className="glass-panel-glow rounded-2xl p-6 border border-emerald-500/30 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {conf.vehicleType}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Status: {conf.status}
                        </span>
                      </div>

                      {/* Driver & PIN display */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-semibold">
                            Driver & Vehicle
                          </span>
                          <div className="font-bold text-white text-xs">{conf.driverName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">Plate: {conf.driverPlate}</div>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 text-center">
                          <span className="text-slate-300 text-[10px] uppercase font-semibold flex items-center justify-center gap-1">
                            <Key className="w-3 h-3 text-cyan-400" /> Pickup PIN
                          </span>
                          <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                            {conf.pickupCode}
                          </div>
                          <div className="text-[10px] text-slate-400">Mutual Verification</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Driver ETA:</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            ~{conf.estimatedArrivalMins} minutes to Terminal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Confirmed At:</span>
                          <span className="text-slate-300 font-mono">
                            {new Date(conf.confirmedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                <Car className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No confirmed rides yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Search for your flight and accept an optimal companion match to lock in your ride and mutual PIN.
                </p>
              </div>
            )}
          </section>

          {/* 2. Persisted Requests & Pool Activity */}
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Trip Requests & Demo Pool Activity ({requests.length})</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Active Corridor Pool
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => {
                const avatar = getTransformedCloudinaryUrl(req.user.avatarUrl, {
                  width: 90,
                  height: 90,
                  crop: 'thumb',
                  gravity: 'face',
                });

                return (
                  <div
                    key={req.id}
                    className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400">
                        {req.airportCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                          req.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt={req.user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{req.user.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {req.user.flightNumber} • Ready ~{req.arrivalTime}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1 text-[11px]">
                      <div className="text-slate-400 truncate">
                        Drop-off: <strong className="text-slate-200">{req.destinationAddress}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Max Wait: {req.maxWaitMins}m</span>
                        <span>Detour: +{req.maxDetourMins}m</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
