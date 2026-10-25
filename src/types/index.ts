export type AirportCode = 'SFO' | 'JFK' | 'LAX' | 'ORD' | 'SEA' | 'BLR' | 'LHR';

export interface Airport {
  code: AirportCode;
  name: string;
  city: string;
  terminals: string[];
  lat: number;
  lng: number;
}

export interface DestinationZone {
  id: string;
  name: string;
  city: string;
  airportCode: AirportCode;
  lat: number;
  lng: number;
  distanceKm: number;
  estimatedSoloMinutes: number;
  corridor: 'North' | 'South' | 'East' | 'West' | 'Downtown' | 'SiliconValley' | 'FinancialDistrict';
}

export interface TravelerProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  boardingPassUrl?: string;
  flightNumber: string;
  airline: string;
  verifiedFlight: boolean;
  rating: number;
  tripsCompleted: number;
  bio?: string;
  luggageCount: number;
}

export interface TripRequest {
  id: string;
  userId: string;
  user: TravelerProfile;
  airportCode: AirportCode;
  terminal?: string;
  destinationZoneId: string;
  destinationAddress: string;
  arrivalTime: string; // ISO string or HH:MM format
  passengerCount: number;
  maxWaitMins: number;
  maxDetourMins: number;
  flexibleMinutes: number;
  status: 'PENDING' | 'MATCHED' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface ScoreBreakdown {
  routeScore: number;       // 40% weight
  waitTimeScore: number;    // 25% weight
  detourScore: number;      // 20% weight
  fareScore: number;        // 15% weight
  totalScore: number;       // 0 - 100
  routeCompatibilityPct: number;
  detourMins: number;
  waitTimeMins: number;
  reason: string[];
}

export interface FareBreakdown {
  soloBaseFare: number;       // What traveler would pay alone
  candidateSoloFare: number;  // What candidate would pay alone
  totalSharedFare: number;    // Combined fare with detour
  userShare: number;          // Equitable split for primary traveler
  candidateShare: number;     // Equitable split for candidate
  userSavings: number;        // Absolute dollars saved
  userSavingsPercent: number; // Percentage saved (e.g. 42%)
  co2SavedKg: number;         // Carbon reduction metric
  currency: string;
}

export interface MatchCandidate {
  id: string;
  tripRequest: TripRequest;
  breakdown: ScoreBreakdown;
  fare: FareBreakdown;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  recommendedPickupPoint: string;
  recommendedVehicle: 'Standard Sedan (UberX)' | 'Electric Comfort (Tesla)' | 'Spacious SUV (UberXL)';
}

export interface TripConfirmation {
  id: string;
  matchId: string;
  tripRequestId: string;
  candidateRequestId: string;
  confirmedAt: string;
  pickupCode: string;
  vehicleType: string;
  driverName: string;
  driverPlate: string;
  estimatedArrivalMins: number;
  status: 'CONFIRMED' | 'EN_ROUTE' | 'COMPLETED';
}
