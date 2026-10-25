'use client';

import React, { useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import TripSearchForm from '@/components/TripSearchForm';
import MatchDiscoveryDashboard from '@/components/MatchDiscoveryDashboard';
import { MatchCandidate, TripRequest } from '@/types';
import { searchAndMatchTripsAction } from '@/app/actions';
import {
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  MapPin,
  Car,
  Clock,
  Sparkles,
  Plane
} from 'lucide-react';

export default function HomePage() {
  const [activeRequest, setActiveRequest] = useState<TripRequest | null>(null);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Quick preset shortcuts from Hero
  const [airportPreset, setAirportPreset] = useState<string | undefined>(undefined);
  const [zonePreset, setZonePreset] = useState<string | undefined>(undefined);

  const handleQuickDemoSelect = (airport: string, zoneId: string) => {
    setAirportPreset(airport);
    setZonePreset(zoneId);
    // Scroll down to the search form smoothly
    const formElement = document.getElementById('search-form-section');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (request: TripRequest) => {
    setIsSearching(true);
    try {
      const res = await searchAndMatchTripsAction(request);
      setActiveRequest(res.savedRequest);
      setMatches(res.matches);

      // Scroll to discovery dashboard
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        resultsElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetSearch = () => {
    setActiveRequest(null);
    setMatches([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 space-y-12 pb-16">
      {/* Hero Section */}
      <HeroBanner onQuickDemoSelect={handleQuickDemoSelect} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Search or Results Section */}
        {activeRequest ? (
          <div id="results-section">
            <MatchDiscoveryDashboard
              initialRequest={activeRequest}
              initialMatches={matches}
              onResetSearch={handleResetSearch}
            />
          </div>
        ) : (
          <div id="search-form-section" className="scroll-mt-24">
            <TripSearchForm
              onSearch={handleSearch}
              isLoading={isSearching}
              selectedAirportPreset={airportPreset}
              selectedZonePreset={zonePreset}
            />
          </div>
        )}

        {/* How It Works & Architecture Feature Cards */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              The Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Deterministic Airport Ride Matching
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Unlike generic carpooling, AirPool AI is built specifically for airport corridors with flight-aware synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <h3 className="text-base font-bold text-white">Flight & Gate Aware</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches are dynamically aligned with flight arrival times and terminal baggage claim windows. If your flight is delayed, the matching engine adjusts pickup buffers automatically.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">4-Factor Rules Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                5 strict hard constraints must pass before ranking candidates by Route (40%), Waiting-Time (25%), Detour Acceptability (20%), and Fare Fairness (15%).
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Verified Peer Trust</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Cloudinary CDN transformations and boarding pass authentication. Arrive with complete confidence and coordinate using a mutual 4-digit PIN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
