import { DESTINATION_ZONES, SUPPORTED_AIRPORTS } from '@/lib/constants/airports';
import { DestinationZone, FareBreakdown, MatchCandidate, ScoreBreakdown, TripRequest } from '@/types';

/**
 * Calculates great circle distance between two lat/lng coordinates in kilometers.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Converts HH:MM string to total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // If ISO string
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return d.getHours() * 60 + d.getMinutes();
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    return hours * 60 + mins;
  }
  return 0;
}

/**
 * Formats minutes from midnight back to HH:MM format.
 */
export function formatMinutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = Math.floor(normalized % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Deterministic Fare Calculation Engine
 */
export function calculateFares(
  airportCode: string,
  zoneA: DestinationZone,
  zoneB: DestinationZone,
  interDropoffKm: number
): { fareA: FareBreakdown; soloA: number; soloB: number; totalShared: number } {
  // Base rates for airport ride-hailing
  const baseBookingFee = 8.50;
  const perKmRate = 1.85;
  const perMinRate = 0.45;
  const sharedPlatformFee = 4.00;

  // Solo fare for Traveler A
  const soloA = Math.round(
    (baseBookingFee + zoneA.distanceKm * perKmRate + zoneA.estimatedSoloMinutes * perMinRate) * 100
  ) / 100;

  // Solo fare for Traveler B
  const soloB = Math.round(
    (baseBookingFee + zoneB.distanceKm * perKmRate + zoneB.estimatedSoloMinutes * perMinRate) * 100
  ) / 100;

  // Shared route: Airport -> Closer Dropoff -> Farther Dropoff
  const minSoloDist = Math.min(zoneA.distanceKm, zoneB.distanceKm);
  const sharedTotalKm = minSoloDist + interDropoffKm;
  const sharedTotalMinutes = Math.round(sharedTotalKm * 1.5 + 6); // Includes short stopover

  const totalShared = Math.round(
    (baseBookingFee + sharedTotalKm * perKmRate + sharedTotalMinutes * perMinRate + sharedPlatformFee) * 100
  ) / 100;

  // Proportional route-weighting split ensures mathematically fair allocation
  const totalSoloSum = soloA + soloB;
  const weightA = totalSoloSum > 0 ? soloA / totalSoloSum : 0.5;
  const weightB = 1 - weightA;

  const userShare = Math.round(totalShared * weightA * 100) / 100;
  const candidateShare = Math.round(totalShared * weightB * 100) / 100;

  const userSavings = Math.max(0, Math.round((soloA - userShare) * 100) / 100);
  const userSavingsPercent = soloA > 0 ? Math.round((userSavings / soloA) * 100) : 0;

  // Carbon emissions reduction: Standard passenger car produces ~170g CO2 per km
  const kmSaved = Math.max(0, zoneA.distanceKm + zoneB.distanceKm - sharedTotalKm);
  const co2SavedKg = Math.round((kmSaved * 0.171) * 10) / 10;

  const fareA: FareBreakdown = {
    soloBaseFare: soloA,
    candidateSoloFare: soloB,
    totalSharedFare: totalShared,
    userShare,
    candidateShare,
    userSavings,
    userSavingsPercent,
    co2SavedKg,
    currency: airportCode === 'BLR' ? '₹' : airportCode === 'LHR' ? '£' : '$',
  };

  return { fareA, soloA, soloB, totalShared };
}

/**
 * Core Deterministic Matching Rules Engine
 * Evaluates hard constraints and computes normalized 0-100 scores.
 */
export function evaluateTripMatch(
  request: TripRequest,
  candidate: TripRequest
): MatchCandidate | null {
  // HARD CONSTRAINT 1: Same Airport
  if (request.airportCode !== candidate.airportCode) {
    return null;
  }

  // HARD CONSTRAINT 2: Total Vehicle Capacity (Standard rideshare max 4 pax)
  const totalPassengers = request.passengerCount + candidate.passengerCount;
  if (totalPassengers > 4) {
    return null;
  }

  // HARD CONSTRAINT 3: Time Difference within both users' max wait limits
  const timeReq = parseTimeToMinutes(request.arrivalTime);
  const timeCand = parseTimeToMinutes(candidate.arrivalTime);
  const waitDiffMins = Math.abs(timeReq - timeCand);

  const allowedWaitMins = Math.min(request.maxWaitMins, candidate.maxWaitMins);
  if (waitDiffMins > allowedWaitMins) {
    return null;
  }

  // Geospatial Destination Lookup
  const zoneReq = DESTINATION_ZONES.find((z) => z.id === request.destinationZoneId) || {
    id: request.destinationZoneId,
    name: request.destinationAddress,
    city: 'City',
    airportCode: request.airportCode,
    lat: 37.7749,
    lng: -122.4194,
    distanceKm: 22,
    estimatedSoloMinutes: 30,
    corridor: 'Downtown' as const,
  };

  const zoneCand = DESTINATION_ZONES.find((z) => z.id === candidate.destinationZoneId) || {
    id: candidate.destinationZoneId,
    name: candidate.destinationAddress,
    city: 'City',
    airportCode: candidate.airportCode,
    lat: 37.7833,
    lng: -122.4167,
    distanceKm: 23,
    estimatedSoloMinutes: 32,
    corridor: 'Downtown' as const,
  };

  // HARD CONSTRAINT 4: Compatible Corridor / Direction
  // Trips in divergent corridors (e.g. SFO Downtown vs Silicon Valley) fail compatibility
  const isDirectZoneMatch = zoneReq.id === zoneCand.id;
  const isCompatibleCorridor =
    zoneReq.corridor === zoneCand.corridor ||
    (zoneReq.corridor === 'Downtown' && zoneCand.corridor === 'FinancialDistrict') ||
    (zoneReq.corridor === 'FinancialDistrict' && zoneCand.corridor === 'Downtown');

  if (!isDirectZoneMatch && !isCompatibleCorridor) {
    return null;
  }

  // Calculate distance between dropoffs
  const interDropoffKm = isDirectZoneMatch
    ? 0.8
    : calculateDistanceKm(zoneReq.lat, zoneReq.lng, zoneCand.lat, zoneCand.lng);

  // Detour calculation: Detour added to either passenger in minutes
  // In urban traffic, each additional km between drop-offs is roughly 2.2 minutes
  const detourMins = Math.round(interDropoffKm * 2.2);

  // HARD CONSTRAINT 5: Detour within both users' max detour limits
  if (detourMins > request.maxDetourMins || detourMins > candidate.maxDetourMins) {
    return null;
  }

  // ALL HARD CONSTRAINTS PASSED. NOW COMPUTE EXACT WEIGHTED SCORING.

  // 1. Route Compatibility (Weight: 40%)
  // Base 100 for exact zone, decays smoothly with distance between dropoffs
  let routeScore = 100;
  if (!isDirectZoneMatch) {
    routeScore = Math.max(50, Math.round(100 - interDropoffKm * 7));
  }

  // 2. Waiting-Time Compatibility (Weight: 25%)
  // 100 if identical flight arrival, decreases linearly with wait difference
  const waitTimeScore = Math.max(0, Math.round(100 - (waitDiffMins / (allowedWaitMins || 1)) * 100));

  // 3. Detour Acceptability (Weight: 20%)
  // 100 if negligible detour, decreases with detour minutes
  const maxDetourTolerance = Math.min(request.maxDetourMins, candidate.maxDetourMins) || 1;
  const detourScore = Math.max(0, Math.round(100 - (detourMins / maxDetourTolerance) * 100));

  // Fare calculations
  const { fareA } = calculateFares(request.airportCode, zoneReq, zoneCand, interDropoffKm);

  // 4. Fare Fairness (Weight: 15%)
  // Proportional split equity
  const fareScore = Math.min(100, Math.max(60, Math.round(100 - Math.abs(fareA.userSavingsPercent - 45))));

  // Exact Formula: Route (40%) + Waiting Time (25%) + Detour (20%) + Fare Fairness (15%)
  const rawWeighted =
    routeScore * 0.40 +
    waitTimeScore * 0.25 +
    detourScore * 0.20 +
    fareScore * 0.15;

  const totalScore = Math.min(100, Math.max(1, Math.round(rawWeighted)));

  // Reasons summary for transparency
  const reasons: string[] = [];
  if (isDirectZoneMatch) {
    reasons.push('Same destination zone and drop-off corridor');
  } else {
    reasons.push(`Direct along the ${zoneReq.corridor} transit corridor (${interDropoffKm} km apart)`);
  }

  if (waitDiffMins <= 5) {
    reasons.push(`Synchronized arrival: Only ${waitDiffMins} min gap`);
  } else {
    reasons.push(`Arrival gap of ${waitDiffMins} min (well within your ${request.maxWaitMins}m limit)`);
  }

  if (detourMins <= 6) {
    reasons.push(`Minimal detour: Adds only ~${detourMins} mins`);
  } else {
    reasons.push(`Detour is ~${detourMins} mins (under your ${request.maxDetourMins}m max)`);
  }

  reasons.push(`Saves ${fareA.currency}${fareA.userSavings.toFixed(2)} (${fareA.userSavingsPercent}% discount vs solo ride)`);

  const breakdown: ScoreBreakdown = {
    routeScore,
    waitTimeScore,
    detourScore,
    fareScore,
    totalScore,
    routeCompatibilityPct: isDirectZoneMatch ? 98 : Math.max(70, Math.round(100 - interDropoffKm * 5)),
    detourMins,
    waitTimeMins: waitDiffMins,
    reason: reasons,
  };

  // Pickup window
  const earlierMins = Math.min(timeReq, timeCand);
  const pickupStartMins = earlierMins + 15; // standard baggage claim allowance
  const pickupEndMins = pickupStartMins + allowedWaitMins;

  // Recommended vehicle
  const totalLuggage = (request.user.luggageCount || 1) + (candidate.user.luggageCount || 1);
  let recommendedVehicle: MatchCandidate['recommendedVehicle'] = 'Electric Comfort (Tesla)';
  if (totalPassengers >= 3 || totalLuggage >= 3) {
    recommendedVehicle = 'Spacious SUV (UberXL)';
  } else if (zoneReq.distanceKm > 25) {
    recommendedVehicle = 'Electric Comfort (Tesla)';
  } else {
    recommendedVehicle = 'Standard Sedan (UberX)';
  }

  const airportObj = SUPPORTED_AIRPORTS.find((a) => a.code === request.airportCode);
  const commonTerminal = candidate.terminal || airportObj?.terminals[0] || 'Terminal Ride-App Pickup';

  return {
    id: `match_${request.id}_${candidate.id}`,
    tripRequest: candidate,
    breakdown,
    fare: fareA,
    pickupWindowStart: formatMinutesToTime(pickupStartMins),
    pickupWindowEnd: formatMinutesToTime(pickupEndMins),
    recommendedPickupPoint: `${commonTerminal} • Level 2 Rideshare Island`,
    recommendedVehicle,
  };
}

/**
 * Evaluates a TripRequest against all available candidates in the pool,
 * filters hard constraints, and ranks feasible matches by total score descending.
 */
export function findAndRankMatches(
  request: TripRequest,
  candidatePool: TripRequest[]
): MatchCandidate[] {
  const matches: MatchCandidate[] = [];

  for (const candidate of candidatePool) {
    // Cannot match with oneself or another trip by same user
    if (candidate.id === request.id || candidate.userId === request.userId) {
      continue;
    }

    // Must be in pending status
    if (candidate.status !== 'PENDING') {
      continue;
    }

    const match = evaluateTripMatch(request, candidate);
    if (match) {
      matches.push(match);
    }
  }

  // Sort descending by totalScore (0 - 100)
  matches.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);

  return matches;
}
