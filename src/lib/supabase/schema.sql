-- =========================================================================
-- AirPool AI - Production Supabase PostgreSQL Schema & Migrations
-- Flight-aware passenger matching platform
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    boarding_pass_url TEXT,
    flight_number TEXT,
    airline TEXT,
    verified_flight BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 4.90,
    trips_completed INTEGER DEFAULT 0,
    bio TEXT,
    luggage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRIP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.trip_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    airport_code VARCHAR(10) NOT NULL,
    terminal TEXT,
    destination_zone_id TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    passenger_count INTEGER DEFAULT 1 CHECK (passenger_count >= 1 AND passenger_count <= 4),
    max_wait_mins INTEGER DEFAULT 25 CHECK (max_wait_mins >= 5 AND max_wait_mins <= 60),
    max_detour_mins INTEGER DEFAULT 15 CHECK (max_detour_mins >= 0 AND max_detour_mins <= 35),
    flexible_minutes INTEGER DEFAULT 15,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MATCHED', 'CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CANDIDATE MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.candidate_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_request_id_a UUID NOT NULL REFERENCES public.trip_requests(id) ON DELETE CASCADE,
    trip_request_id_b UUID NOT NULL REFERENCES public.trip_requests(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    route_score INTEGER NOT NULL,
    wait_score INTEGER NOT NULL,
    detour_score INTEGER NOT NULL,
    fare_score INTEGER NOT NULL,
    estimated_solo_fare_a NUMERIC(10,2) NOT NULL,
    estimated_solo_fare_b NUMERIC(10,2) NOT NULL,
    shared_fare_total NUMERIC(10,2) NOT NULL,
    fare_split_a NUMERIC(10,2) NOT NULL,
    fare_split_b NUMERIC(10,2) NOT NULL,
    recommended_pickup_point TEXT,
    recommended_vehicle TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_bidirectional_match UNIQUE (trip_request_id_a, trip_request_id_b)
);

-- 4. CONFIRMATIONS TABLE (Double-booking protected)
CREATE TABLE IF NOT EXISTS public.confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID UNIQUE REFERENCES public.candidate_matches(id) ON DELETE CASCADE,
    trip_request_id UUID UNIQUE REFERENCES public.trip_requests(id) ON DELETE CASCADE,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pickup_code VARCHAR(10) NOT NULL,
    vehicle_type TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_plate TEXT NOT NULL,
    estimated_arrival_mins INTEGER DEFAULT 8,
    status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'EN_ROUTE', 'COMPLETED', 'CANCELLED'))
);

-- INDEXES FOR FAST GEOSPATIAL & TEMPORAL LOOKUPS
CREATE INDEX IF NOT EXISTS idx_trip_requests_airport_status ON public.trip_requests(airport_code, status);
CREATE INDEX IF NOT EXISTS idx_trip_requests_user ON public.trip_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_requests ON public.candidate_matches(trip_request_id_a, trip_request_id_b);
CREATE INDEX IF NOT EXISTS idx_confirmations_match ON public.confirmations(match_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;

-- Allow public reads and inserts for demo and authenticated users
CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Profiles Insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Profiles Update" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Trip Requests Read" ON public.trip_requests FOR SELECT USING (true);
CREATE POLICY "Trip Requests Insert" ON public.trip_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Trip Requests Update" ON public.trip_requests FOR UPDATE USING (true);

CREATE POLICY "Matches Read" ON public.candidate_matches FOR SELECT USING (true);
CREATE POLICY "Matches Insert" ON public.candidate_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Matches Update" ON public.candidate_matches FOR UPDATE USING (true);

CREATE POLICY "Confirmations Read" ON public.confirmations FOR SELECT USING (true);
CREATE POLICY "Confirmations Insert" ON public.confirmations FOR INSERT WITH CHECK (true);
