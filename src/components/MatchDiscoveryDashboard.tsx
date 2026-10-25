'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Plane,
  Clock,
  ShieldCheck,
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';
import { MatchCandidate, TripConfirmation, TripRequest } from '@/types';
import MatchDetailCard from '@/components/MatchDetailCard';
import UnmatchedFallbackState from '@/components/UnmatchedFallbackState';
import ConfirmedMatchModal from '@/components/ConfirmedMatchModal';
import { confirmTripMatchAction, rejectTripMatchAction, searchAndMatchTripsAction } from '@/app/actions';

interface MatchDiscoveryDashboardProps {
  initialRequest: TripRequest;
  initialMatches: MatchCandidate[];
  onResetSearch: () => void;
}

export default function MatchDiscoveryDashboard({
  initialRequest,
  initialMatches,
  onResetSearch,
}: MatchDiscoveryDashboardProps) {
  const [currentRequest, setCurrentRequest] = useState<TripRequest>(initialRequest);
  const [candidates, setCandidates] = useState<MatchCandidate[]>(initialMatches);
  const [activeConfirmation, setActiveConfirmation] = useState<{
    confirmation: TripConfirmation;
    candidate: MatchCandidate;
  } | null>(null);

  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Accept candidate handler with server-side double-booking validation
  const handleAcceptMatch = async (candidate: MatchCandidate) => {
    setIsAccepting(true);
    setErrorMessage(null);

    try {
      const res = await confirmTripMatchAction(currentRequest.id, candidate);
      if (res.success && res.confirmation) {
        setActiveConfirmation({
          confirmation: res.confirmation,
          candidate,
        });
      } else {
        setErrorMessage(res.error || 'Ride could not be confirmed. It may already be booked.');
      }
    } catch (err) {
      setErrorMessage('Server error while locking ride.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Reject candidate handler (Prompt 5: "Ensure rejecting a match properly updates the state and offers the next best candidate.")
  const handleRejectMatch = async (matchId: string) => {
    try {
      await rejectTripMatchAction(matchId);
      // Remove candidate from list
      const updated = candidates.filter((c) => c.id !== matchId);
      setCandidates(updated);
      setNotification('Candidate declined. Revealing next best route match.');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Adjust parameters when in fallback state
  const handleAdjustParameters = async (adjustments: { maxWaitMins?: number; maxDetourMins?: number }) => {
    const updatedRequest: TripRequest = {
      ...currentRequest,
      maxWaitMins: adjustments.maxWaitMins ?? currentRequest.maxWaitMins,
      maxDetourMins: adjustments.maxDetourMins ?? currentRequest.maxDetourMins,
    };
    setCurrentRequest(updatedRequest);

    const res = await searchAndMatchTripsAction(updatedRequest);
    if (res.success) {
      setCandidates(res.matches);
      setNotification(`Constraints updated! Discovered ${res.matches.length} compatible candidates.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between shadow-lg shadow-cyan-500/10">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{notification}</span>
          </span>
          <button onClick={() => setNotification(null)} className="text-cyan-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Discovery Header & Filter Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active Corridor Search
            </span>
            <span className="text-xs text-slate-400">
              {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Ranked
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>{currentRequest.airportCode}</span>
            <span className="text-slate-600">→</span>
            <span className="text-gradient-emerald-cyan">{currentRequest.destinationAddress}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-mono text-cyan-300">
              <Clock className="w-3.5 h-3.5" /> Ready: ~{currentRequest.arrivalTime}
            </span>
            <span>•</span>
            <span>Max wait: {currentRequest.maxWaitMins}m</span>
            <span>•</span>
            <span>Max detour: +{currentRequest.maxDetourMins}m</span>
            <span>•</span>
            <span>Flight: {currentRequest.user.flightNumber}</span>
          </div>
        </div>

        <button
          onClick={onResetSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer self-start md:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modify Flight / Destination</span>
        </button>
      </div>

      {/* Candidate List or Fallback */}
      {candidates.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Ranked Feasible Candidates (Hard Constraints Passed):
            </span>
            <span className="font-mono text-slate-500">
              Sorted by Total Score Descending
            </span>
          </div>

          <div className="space-y-6">
            {candidates.map((candidate, idx) => (
              <MatchDetailCard
                key={candidate.id}
                candidate={candidate}
                rankIndex={idx}
                onAccept={handleAcceptMatch}
                onReject={handleRejectMatch}
                isAccepting={isAccepting}
              />
            ))}
          </div>
        </div>
      ) : (
        <UnmatchedFallbackState
          request={currentRequest}
          onAdjustParameters={handleAdjustParameters}
          onResetSearch={onResetSearch}
        />
      )}

      {/* Confirmation Modal */}
      {activeConfirmation && (
        <ConfirmedMatchModal
          confirmation={activeConfirmation.confirmation}
          candidate={activeConfirmation.candidate}
          onClose={() => setActiveConfirmation(null)}
        />
      )}
    </div>
  );
}
