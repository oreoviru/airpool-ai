'use server';

import { findAndRankMatches } from '@/lib/matching/engine';
import { AirPoolRepository } from '@/lib/storage/repository';
import { MatchCandidate, TripConfirmation, TripRequest } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Submit a new trip search and discover ranked matches
 */
export async function searchAndMatchTripsAction(
  request: TripRequest
): Promise<{
  success: boolean;
  matches: MatchCandidate[];
  savedRequest: TripRequest;
  error?: string;
}> {
  try {
    // 1. Persist the user's trip request
    const savedRequest = await AirPoolRepository.createTripRequest(request);

    // 2. Fetch candidate pool for this airport
    const pool = await AirPoolRepository.getCandidatePool(
      request.airportCode,
      request.userId
    );

    // 3. Run the deterministic matching engine
    const rankedMatches = findAndRankMatches(savedRequest, pool);

    return {
      success: true,
      matches: rankedMatches,
      savedRequest,
    };
  } catch (error) {
    console.error('searchAndMatchTripsAction error:', error);
    return {
      success: false,
      matches: [],
      savedRequest: request,
      error: error instanceof Error ? error.message : 'Failed to search matches',
    };
  }
}

/**
 * Server Action: Confirm a shared trip with a matched candidate
 * Enforces double-booking server validation check
 */
export async function confirmTripMatchAction(
  userRequestId: string,
  candidate: MatchCandidate
): Promise<{
  success: boolean;
  confirmation?: TripConfirmation;
  error?: string;
}> {
  try {
    const result = await AirPoolRepository.confirmMatch(userRequestId, candidate);
    revalidatePath('/trips');
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('confirmTripMatchAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Server confirmation failed',
    };
  }
}

/**
 * Server Action: Reject a candidate match
 */
export async function rejectTripMatchAction(matchId: string): Promise<{ success: boolean }> {
  try {
    await AirPoolRepository.rejectMatch(matchId);
    return { success: true };
  } catch (error) {
    console.error('rejectTripMatchAction error:', error);
    return { success: false };
  }
}

/**
 * Server Action: Reset all demo data
 */
export async function resetDemoAction(): Promise<{ success: boolean; message: string }> {
  try {
    await AirPoolRepository.resetDemoState();
    revalidatePath('/');
    revalidatePath('/trips');
    return {
      success: true,
      message: 'Demo state successfully reset to initial 8+ seeded travelers!',
    };
  } catch (error) {
    console.error('resetDemoAction error:', error);
    return {
      success: false,
      message: 'Failed to reset demo state',
    };
  }
}

/**
 * Server Action: Get all user requests and confirmations
 */
export async function getUserTripsAction(userId?: string): Promise<{
  requests: TripRequest[];
  confirmations: TripConfirmation[];
}> {
  try {
    return await AirPoolRepository.getUserTrips(userId);
  } catch (error) {
    console.error('getUserTripsAction error:', error);
    return { requests: [], confirmations: [] };
  }
}
