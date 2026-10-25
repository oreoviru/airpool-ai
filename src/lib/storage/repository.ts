import { SEEDED_TRAVELERS } from '@/lib/constants/demo-data';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { MatchCandidate, TripConfirmation, TripRequest } from '@/types';

// In-Memory Fallback Store (preserved across hot-reloads and requests)
declare global {
  // eslint-disable-next-line no-var
  var __AIRPOOL_STORE__:
    | {
        trips: TripRequest[];
        confirmations: TripConfirmation[];
        rejectedMatchIds: Set<string>;
      }
    | undefined;
}

function initMemoryStore() {
  if (!global.__AIRPOOL_STORE__) {
    global.__AIRPOOL_STORE__ = {
      trips: JSON.parse(JSON.stringify(SEEDED_TRAVELERS)),
      confirmations: [],
      rejectedMatchIds: new Set<string>(),
    };
  }
  return global.__AIRPOOL_STORE__;
}

export class AirPoolRepository {
  /**
   * Resets the entire repository to pristine demo state.
   */
  static async resetDemoState(): Promise<void> {
    const store = initMemoryStore();
    store.trips = JSON.parse(JSON.stringify(SEEDED_TRAVELERS));
    store.confirmations = [];
    store.rejectedMatchIds.clear();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('confirmations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('candidate_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Delete non-seeded requests
        await supabase.from('trip_requests').delete().like('destination_address', '%');
      } catch (err) {
        console.warn('Supabase reset warning (non-fatal):', err);
      }
    }
  }

  /**
   * Creates or persists a new trip request.
   */
  static async createTripRequest(request: TripRequest): Promise<TripRequest> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        // Upsert user profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: request.user.id.includes('-') ? request.user.id : undefined,
          email: request.user.email,
          full_name: request.user.name,
          avatar_url: request.user.avatarUrl,
          boarding_pass_url: request.user.boardingPassUrl,
          flight_number: request.user.flightNumber,
          airline: request.user.airline,
          verified_flight: request.user.verifiedFlight,
          rating: request.user.rating,
          trips_completed: request.user.tripsCompleted,
          bio: request.user.bio,
          luggage_count: request.user.luggageCount,
        });

        if (profileError) {
          console.warn('Supabase profile upsert error, falling back to memory:', profileError.message);
        } else {
          // Insert trip request
          const { error: tripError } = await supabase.from('trip_requests').insert({
            airport_code: request.airportCode,
            terminal: request.terminal,
            destination_zone_id: request.destinationZoneId,
            destination_address: request.destinationAddress,
            arrival_time: request.arrivalTime,
            passenger_count: request.passengerCount,
            max_wait_mins: request.maxWaitMins,
            max_detour_mins: request.maxDetourMins,
            flexible_minutes: request.flexibleMinutes,
            status: request.status,
          });

          if (!tripError) {
            // Also keep local store in sync
            const store = initMemoryStore();
            store.trips.unshift(request);
            return request;
          }
        }
      } catch (e) {
        console.warn('Supabase request creation exception, using fallback:', e);
      }
    }

    // Fallback store
    const store = initMemoryStore();
    // Prepend user trip
    const existingIndex = store.trips.findIndex((t) => t.id === request.id);
    if (existingIndex >= 0) {
      store.trips[existingIndex] = request;
    } else {
      store.trips.unshift(request);
    }
    return request;
  }

  /**
   * Retrieves active candidates available for matching in this airport.
   */
  static async getCandidatePool(airportCode: string, excludeUserId?: string): Promise<TripRequest[]> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('trip_requests')
          .select('*, profiles(*)')
          .eq('airport_code', airportCode)
          .eq('status', 'PENDING');

        if (!error && data && data.length > 0) {
          return data
            .filter((row) => !excludeUserId || row.user_id !== excludeUserId)
            .map((row) => ({
              id: row.id,
              userId: row.user_id || row.profiles?.id || 'anon',
              user: {
                id: row.profiles?.id || row.user_id || 'anon',
                name: row.profiles?.full_name || 'Traveler',
                email: row.profiles?.email || 'traveler@airpool.ai',
                avatarUrl: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
                boardingPassUrl: row.profiles?.boarding_pass_url,
                flightNumber: row.profiles?.flight_number || 'FLIGHT',
                airline: row.profiles?.airline || 'Airline',
                verifiedFlight: row.profiles?.verified_flight ?? true,
                rating: Number(row.profiles?.rating || 4.9),
                tripsCompleted: Number(row.profiles?.trips_completed || 10),
                bio: row.profiles?.bio,
                luggageCount: row.profiles?.luggage_count || 1,
              },
              airportCode: row.airport_code,
              terminal: row.terminal,
              destinationZoneId: row.destination_zone_id,
              destinationAddress: row.destination_address,
              arrivalTime: row.arrival_time,
              passengerCount: row.passenger_count,
              maxWaitMins: row.max_wait_mins,
              maxDetourMins: row.max_detour_mins,
              flexibleMinutes: row.flexible_minutes,
              status: row.status,
              createdAt: row.created_at,
            }));
        }
      } catch (err) {
        console.warn('Supabase candidate pool fetch exception, using fallback:', err);
      }
    }

    // In-memory fallback
    const store = initMemoryStore();
    return store.trips.filter(
      (trip) =>
        trip.airportCode === airportCode &&
        trip.status === 'PENDING' &&
        (!excludeUserId || trip.userId !== excludeUserId)
    );
  }

  /**
   * Prevents double-booking and confirms a match.
   */
  static async confirmMatch(
    userRequestId: string,
    candidate: MatchCandidate
  ): Promise<{ success: boolean; confirmation?: TripConfirmation; error?: string }> {
    const store = initMemoryStore();

    // 1. Strict Server-Side Validation: Check if candidate is already booked
    const candidateTrip = store.trips.find((t) => t.id === candidate.tripRequest.id);
    if (candidateTrip && candidateTrip.status === 'CONFIRMED') {
      return {
        success: false,
        error: `Traveler ${candidate.tripRequest.user.name} has just been matched with another passenger. Please select the next available ride.`,
      };
    }

    // Check if user trip is already confirmed
    const userTrip = store.trips.find((t) => t.id === userRequestId);
    if (userTrip && userTrip.status === 'CONFIRMED') {
      return {
        success: false,
        error: 'You already have a confirmed ride for this request.',
      };
    }

    // Generate verified random 4-digit PIN for mutual verification
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const mockDrivers = [
      { name: 'Elena Ramos (Tesla Model Y • White)', plate: '7XYZ892' },
      { name: 'David Kim (Toyota Highlander Hybrid • Midnight Gray)', plate: '8MNO419' },
      { name: 'Marcus Sterling (Ford Mustang Mach-E • Cyber Cyan)', plate: '6KLM331' },
    ];
    const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];

    const confirmation: TripConfirmation = {
      id: `conf_${Date.now()}`,
      matchId: candidate.id,
      tripRequestId: userRequestId,
      candidateRequestId: candidate.tripRequest.id,
      confirmedAt: new Date().toISOString(),
      pickupCode: randomPin,
      vehicleType: candidate.recommendedVehicle,
      driverName: driver.name,
      driverPlate: driver.plate,
      estimatedArrivalMins: 7,
      status: 'CONFIRMED',
    };

    // Update state in memory
    if (candidateTrip) candidateTrip.status = 'CONFIRMED';
    if (userTrip) userTrip.status = 'CONFIRMED';
    store.confirmations.unshift(confirmation);

    // Persist to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('trip_requests')
          .update({ status: 'CONFIRMED' })
          .in('id', [userRequestId, candidate.tripRequest.id]);

        await supabase.from('confirmations').insert({
          match_id: candidate.id.includes('-') ? candidate.id : undefined,
          trip_request_id: userRequestId.includes('-') ? userRequestId : undefined,
          pickup_code: confirmation.pickupCode,
          vehicle_type: confirmation.vehicleType,
          driver_name: confirmation.driverName,
          driver_plate: confirmation.driverPlate,
          estimated_arrival_mins: confirmation.estimatedArrivalMins,
          status: 'CONFIRMED',
        });
      } catch (err) {
        console.warn('Supabase confirmation sync error (non-fatal):', err);
      }
    }

    return {
      success: true,
      confirmation,
    };
  }

  /**
   * Handles user rejecting a candidate match.
   */
  static async rejectMatch(matchId: string): Promise<void> {
    const store = initMemoryStore();
    store.rejectedMatchIds.add(matchId);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('candidate_matches').update({ status: 'REJECTED' }).eq('id', matchId);
      } catch (err) {
        console.warn('Supabase reject warning:', err);
      }
    }
  }

  /**
   * Retrieves all confirmed trips and requests for the user dashboard.
   */
  static async getUserTrips(userId?: string): Promise<{
    requests: TripRequest[];
    confirmations: TripConfirmation[];
  }> {
    const store = initMemoryStore();
    return {
      requests: store.trips,
      confirmations: store.confirmations,
    };
  }
}
