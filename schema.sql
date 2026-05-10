-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  city_id uuid,
  title text NOT NULL,
  description text,
  category USER-DEFINED DEFAULT 'other'::activity_category,
  estimated_cost numeric DEFAULT 0,
  estimated_duration_hours numeric,
  rating numeric,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.cities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  city_name text NOT NULL,
  country text NOT NULL,
  latitude numeric,
  longitude numeric,
  average_daily_cost numeric DEFAULT 0,
  popularity_score integer DEFAULT 0,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cities_pkey PRIMARY KEY (id)
);

CREATE TYPE public.packing_category AS ENUM (
  'documents',
  'electronics',
  'clothing',
  'toiletries',
  'medical',
  'accessories',
  'technology',
  'weather',
  'essentials',
  'other'
);

CREATE TYPE public.packing_priority AS ENUM (
  'high',
  'medium',
  'low'
);

CREATE TABLE public.packing_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_id uuid NOT NULL,
  item_name text NOT NULL,
  category public.packing_category DEFAULT 'other'::packing_category,
  quantity integer DEFAULT 1,
  priority public.packing_priority DEFAULT 'medium'::packing_priority,
  notes text,
  pack_by date,
  is_essential boolean DEFAULT false,
  is_packed boolean DEFAULT false,
  packed_at timestamp with time zone,
  source text DEFAULT 'manual'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT packing_items_pkey PRIMARY KEY (id),
  CONSTRAINT packing_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.saved_destinations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  city_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_destinations_pkey PRIMARY KEY (id),
  CONSTRAINT saved_destinations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT saved_destinations_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.shared_trips (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_id uuid UNIQUE,
  public_slug text NOT NULL UNIQUE,
  total_views integer DEFAULT 0,
  allow_copy boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shared_trips_pkey PRIMARY KEY (id),
  CONSTRAINT shared_trips_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.trip_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_stop_id uuid,
  activity_id uuid,
  activity_date date,
  start_time time without time zone,
  end_time time without time zone,
  custom_notes text,
  custom_cost numeric DEFAULT 0,
  activity_order integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_activities_pkey PRIMARY KEY (id),
  CONSTRAINT trip_activities_trip_stop_id_fkey FOREIGN KEY (trip_stop_id) REFERENCES public.trip_stops(id),
  CONSTRAINT trip_activities_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.trip_expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_id uuid,
  category USER-DEFINED NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  payment_method text,
  receipt_url text,
  expense_date date,
  expense_time time without time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT trip_expenses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id)
);
CREATE TABLE public.trip_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_id uuid,
  trip_stop_id uuid,
  user_id uuid,
  title text,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_notes_pkey PRIMARY KEY (id),
  CONSTRAINT trip_notes_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id),
  CONSTRAINT trip_notes_trip_stop_id_fkey FOREIGN KEY (trip_stop_id) REFERENCES public.trip_stops(id),
  CONSTRAINT trip_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.trip_stops (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  trip_id uuid,
  city_id uuid,
  arrival_date date NOT NULL,
  departure_date date NOT NULL,
  stop_order integer NOT NULL,
  hotel_name text,
  stay_type text,
  hotel_cost numeric DEFAULT 0,
  transport_cost numeric DEFAULT 0,
  food_cost numeric DEFAULT 0,
  total_stop_cost numeric DEFAULT ((hotel_cost + transport_cost) + food_cost),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trip_stops_pkey PRIMARY KEY (id),
  CONSTRAINT trip_stops_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id),
  CONSTRAINT trip_stops_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.trips (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title text NOT NULL,
  description text,
  trip_type USER-DEFINED DEFAULT 'solo'::trip_type,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cover_image text,
  visibility USER-DEFINED DEFAULT 'private'::trip_visibility,
  status USER-DEFINED DEFAULT 'planning'::trip_status,
  total_days integer DEFAULT ((end_date - start_date) + 1),
  estimated_total_cost numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trips_pkey PRIMARY KEY (id),
  CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username text NOT NULL UNIQUE,
  full_name text,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  avatar_url text,
  bio text,
  city text,
  country text,
  preferred_currency text DEFAULT 'INR'::text,
  refresh_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
