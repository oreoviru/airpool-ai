'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plane,
  MapPin,
  Clock,
  Users,
  Compass,
  Upload,
  CheckCircle2,
  Sliders,
  Sparkles,
  Camera,
  Luggage,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { DESTINATION_ZONES, SUPPORTED_AIRPORTS } from '@/lib/constants/airports';
import { uploadToCloudinary } from '@/lib/cloudinary/client';
import { AirportCode, TripRequest } from '@/types';

interface TripSearchFormProps {
  onSearch: (request: TripRequest) => void;
  isLoading: boolean;
  selectedAirportPreset?: string;
  selectedZonePreset?: string;
}

export default function TripSearchForm({
  onSearch,
  isLoading,
  selectedAirportPreset,
  selectedZonePreset,
}: TripSearchFormProps) {
  // Form state
  const [airportCode, setAirportCode] = useState<AirportCode>('SFO');
  const [destinationZoneId, setDestinationZoneId] = useState('sfo-downtown-market');
  const [flightNumber, setFlightNumber] = useState('UA 482');
  const [airline, setAirline] = useState('United Airlines');
  const [arrivalTime, setArrivalTime] = useState('17:35');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [luggageCount, setLuggageCount] = useState<number>(1);
  const [maxWaitMins, setMaxWaitMins] = useState<number>(25);
  const [maxDetourMins, setMaxDetourMins] = useState<number>(15);

  // Cloudinary boarding pass / profile avatar upload state
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'
  );
  const [boardingPassUrl, setBoardingPassUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize presets if clicked from HeroBanner
  useEffect(() => {
    if (selectedAirportPreset) {
      setAirportCode(selectedAirportPreset as AirportCode);
    }
  }, [selectedAirportPreset]);

  useEffect(() => {
    if (selectedZonePreset) {
      setDestinationZoneId(selectedZonePreset);
    }
  }, [selectedZonePreset]);

  // Keep destination zones filtered by selected airport
  const availableZones = DESTINATION_ZONES.filter((z) => z.airportCode === airportCode);
  const currentAirport = SUPPORTED_AIRPORTS.find((a) => a.code === airportCode);
  const selectedZone = DESTINATION_ZONES.find((z) => z.id === destinationZoneId);

  // When airport changes, reset destination to first valid zone
  const handleAirportChange = (newCode: AirportCode) => {
    setAirportCode(newCode);
    const zones = DESTINATION_ZONES.filter((z) => z.airportCode === newCode);
    if (zones.length > 0) {
      setDestinationZoneId(zones[0].id);
    }
  };

  // Cloudinary upload handler (Prompt 4)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading securely to Cloudinary...');

    try {
      const { secureUrl, isRealCloudinary } = await uploadToCloudinary(file, 'airpool_boarding_passes');
      setBoardingPassUrl(secureUrl);
      setAvatarUrl(secureUrl); // Also use as verified avatar preview
      setUploadStatus(
        isRealCloudinary
          ? 'Verified & delivered via Cloudinary CDN!'
          : 'Boarding pass processed (demo mode)'
      );
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const request: TripRequest = {
      id: `req_user_${Date.now()}`,
      userId: 'primary_traveler',
      user: {
        id: 'primary_traveler',
        name: 'You (Verified Traveler)',
        email: 'you@airpool.ai',
        avatarUrl,
        boardingPassUrl: boardingPassUrl || undefined,
        flightNumber: flightNumber.trim() || 'UA 482',
        airline,
        verifiedFlight: Boolean(boardingPassUrl || flightNumber),
        rating: 4.98,
        tripsCompleted: 8,
        bio: 'Visiting for tech conference. Punctual and friendly!',
        luggageCount,
      },
      airportCode,
      terminal: currentAirport?.terminals[0] || 'Terminal 2',
      destinationZoneId,
      destinationAddress: selectedZone?.name || 'Downtown Corridor',
      arrivalTime,
      passengerCount,
      maxWaitMins,
      maxDetourMins,
      flexibleMinutes: 15,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    onSearch(request);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Find Shared Airport Ride
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Specify your flight and drop-off corridor. Our rules engine evaluates compatible candidates.
          </p>
        </div>

        {/* Cloudinary Boarding Pass / ID Upload Trigger (Prompt 4) */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
          >
            {boardingPassUrl ? (
              <>
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Boarding Pass Verified</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{isUploading ? 'Signing & Uploading...' : 'Upload Boarding Pass (Cloudinary)'}</span>
              </>
            )}
          </button>
          {uploadStatus && (
            <p className="text-[11px] text-emerald-400/90 text-right mt-1 font-mono">
              {uploadStatus}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Airport Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              Arrival Airport
            </label>
            <div className="relative">
              <select
                value={airportCode}
                onChange={(e) => handleAirportChange(e.target.value as AirportCode)}
                className="w-full bg-slate-900/90 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none transition-all cursor-pointer"
              >
                {SUPPORTED_AIRPORTS.map((airport) => (
                  <option key={airport.code} value={airport.code} className="bg-slate-900 text-white">
                    {airport.code} — {airport.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Terminal: {currentAirport?.terminals[0]} (Rideshare Island)
            </p>
          </div>

          {/* Destination Zone Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Destination Corridor / Zone
            </label>
            <div className="relative">
              <select
                value={destinationZoneId}
                onChange={(e) => setDestinationZoneId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 hover:border-slate-600 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 appearance-none transition-all cursor-pointer"
              >
                {availableZones.map((zone) => (
                  <option key={zone.id} value={zone.id} className="bg-slate-900 text-white">
                    {zone.name} ({zone.distanceKm} km • ~{zone.estimatedSoloMinutes}m)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            {selectedZone && (
              <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                <span>Corridor: {selectedZone.corridor}</span>
                <span>•</span>
                <span>Solo base est. ~${Math.round(8.5 + selectedZone.distanceKm * 1.85 + selectedZone.estimatedSoloMinutes * 0.45)}</span>
              </p>
            )}
          </div>

          {/* Flight Number & Airline Sync */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Flight Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UA 482"
                className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 uppercase font-mono tracking-wider"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Synchronizes exact landing gate & luggage carousel
            </p>
          </div>

          {/* Arrival Time */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              Landing / Ready Time
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Estimated terminal exit after baggage claim
            </p>
          </div>

          {/* Passenger & Luggage Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-300" />
              Travelers & Luggage
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value={1}>1 Passenger</option>
                <option value={2}>2 Passengers</option>
                <option value={3}>3 Passengers</option>
              </select>

              <select
                value={luggageCount}
                onChange={(e) => setLuggageCount(Number(e.target.value))}
                className="bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value={1}>1 Bag</option>
                <option value={2}>2 Bags</option>
                <option value={3}>3+ Bags (SUV)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Enforces vehicle seating & trunk limits
            </p>
          </div>

          {/* Max Detour and Max Wait Tolerance Sliders */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Max Wait Tolerance:
                </span>
                <span className="font-mono font-bold text-cyan-400">{maxWaitMins} mins</span>
              </div>
              <input
                type="range"
                min={5}
                max={45}
                step={5}
                value={maxWaitMins}
                onChange={(e) => setMaxWaitMins(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Max Detour Cap:
                </span>
                <span className="font-mono font-bold text-emerald-400">+{maxDetourMins} mins</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={maxDetourMins}
                onChange={(e) => setMaxDetourMins(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Deterministic 4-factor scoring: Route (40%) • Wait (25%) • Detour (20%) • Fare (15%)</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Corridor Compatibility...</span>
              </>
            ) : (
              <>
                <Plane className="w-4 h-4 -rotate-45" />
                <span>Search Matched Passengers</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
