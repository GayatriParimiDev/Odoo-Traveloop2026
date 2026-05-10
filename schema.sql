-- TRAVELOOP FINAL DATABASE SCHEMA
-- ODOO HACKATHON EDITION

-- PostgreSQL + Supabase Database
-- Custom JWT Authentication
-- =========================================================

create extension if not exists "uuid-ossp";

-- =========================================================
-- ENUMS
-- =========================================================

create type trip_visibility as enum (
    'private',
    'public'
);

create type trip_status as enum (
    'planning',
    'ongoing',
    'completed'
);

create type trip_type as enum (
    'solo',
    'friends',
    'family',
    'business'
);

create type activity_category as enum (
    'adventure',
    'food',
    'culture',
    'shopping',
    'nature',
    'nightlife',
    'relaxation',
    'historical',
    'other'
);

create type packing_category as enum (
    'clothing',
    'electronics',
    'documents',
    'medical',
    'toiletries',
    'other'
);

create type expense_category as enum (
    'transport',
    'hotel',
    'food',
    'activity',
    'shopping',
    'misc'
);

-- =========================================================
-- USERS TABLE
-- =========================================================

create table public.users (
    id uuid primary key default uuid_generate_v4(),

    username text unique not null,

    full_name text,

    email text unique not null,

    password_hash text not null,

    avatar_url text,

    bio text,

    city text,

    country text,

    preferred_currency text default 'INR',

    refresh_token text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- =========================================================
-- CITIES TABLE
-- =========================================================

create table public.cities (
    id uuid primary key default uuid_generate_v4(),

    city_name text not null,

    country text not null,

    latitude numeric(9,6),

    longitude numeric(9,6),

    average_daily_cost numeric(10,2) default 0,

    popularity_score integer default 0,

    description text,

    image_url text,

    created_at timestamptz default now(),

    unique(city_name, country)
);

-- =========================================================
-- ACTIVITIES TABLE
-- =========================================================

create table public.activities (
    id uuid primary key default uuid_generate_v4(),

    city_id uuid references public.cities(id) on delete cascade,

    title text not null,

    description text,

    category activity_category default 'other',

    estimated_cost numeric(10,2) default 0,

    estimated_duration_hours numeric(5,2),

    rating numeric(2,1),

    image_url text,

    created_at timestamptz default now()
);

-- =========================================================
-- TRIPS TABLE
-- =========================================================

create table public.trips (
    id uuid primary key default uuid_generate_v4(),

    user_id uuid references public.users(id) on delete cascade,

    title text not null,

    description text,

    trip_type trip_type default 'solo',

    start_date date not null,

    end_date date not null,

    cover_image text,

    visibility trip_visibility default 'private',

    status trip_status default 'planning',

    total_days integer generated always as (
        end_date - start_date + 1
    ) stored,

    estimated_total_cost numeric(12,2) default 0,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- =========================================================
-- TRIP STOPS TABLE
-- =========================================================

create table public.trip_stops (
    id uuid primary key default uuid_generate_v4(),

    trip_id uuid references public.trips(id) on delete cascade,

    city_id uuid references public.cities(id) on delete cascade,

    arrival_date date not null,

    departure_date date not null,

    stop_order integer not null,

    hotel_name text,

    stay_type text,

    hotel_cost numeric(10,2) default 0,

    transport_cost numeric(10,2) default 0,

    food_cost numeric(10,2) default 0,

    total_stop_cost numeric(12,2) generated always as (
        hotel_cost + transport_cost + food_cost
    ) stored,

    notes text,

    created_at timestamptz default now()
);

-- =========================================================
-- TRIP ACTIVITIES TABLE
-- =========================================================

create table public.trip_activities (
    id uuid primary key default uuid_generate_v4(),

    trip_stop_id uuid references public.trip_stops(id) on delete cascade,

    activity_id uuid references public.activities(id) on delete cascade,

    activity_date date,

    start_time time,

    end_time time,

    custom_notes text,

    custom_cost numeric(10,2) default 0,

    activity_order integer default 1,

    created_at timestamptz default now()
);

-- =========================================================
-- TRIP EXPENSES TABLE
-- =========================================================

create table public.trip_expenses (
    id uuid primary key default uuid_generate_v4(),

    trip_id uuid references public.trips(id) on delete cascade,

    category expense_category not null,

    title text not null,

    amount numeric(12,2) not null,

    payment_method text,

    receipt_url text,

    expense_date date,

    expense_time time,

    notes text,

    created_at timestamptz default now()
);

-- =========================================================
-- PACKING ITEMS TABLE
-- =========================================================

create table public.packing_items (
    id uuid primary key default uuid_generate_v4(),

    trip_id uuid references public.trips(id) on delete cascade,

    item_name text not null,

    category packing_category default 'other',

    quantity integer default 1,

    is_packed boolean default false,

    created_at timestamptz default now()
);

-- =========================================================
-- TRIP NOTES TABLE
-- =========================================================

create table public.trip_notes (
    id uuid primary key default uuid_generate_v4(),

    trip_id uuid references public.trips(id) on delete cascade,

    trip_stop_id uuid references public.trip_stops(id) on delete set null,

    user_id uuid references public.users(id) on delete cascade,

    title text,

    content text not null,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- =========================================================
-- SHARED TRIPS TABLE
-- =========================================================

create table public.shared_trips (
    id uuid primary key default uuid_generate_v4(),

    trip_id uuid unique references public.trips(id) on delete cascade,

    public_slug text unique not null,

    total_views integer default 0,

    allow_copy boolean default true,

    created_at timestamptz default now()
);

-- =========================================================
-- SAVED DESTINATIONS TABLE
-- =========================================================

create table public.saved_destinations (
    id uuid primary key default uuid_generate_v4(),

    user_id uuid references public.users(id) on delete cascade,

    city_id uuid references public.cities(id) on delete cascade,

    created_at timestamptz default now(),

    unique(user_id, city_id)
);

-- =========================================================
-- INDEXES
-- =========================================================

create index idx_users_email
on public.users(email);

create index idx_trips_user
on public.trips(user_id);

create index idx_trip_stops_trip
on public.trip_stops(trip_id);

create index idx_trip_activities_stop
on public.trip_activities(trip_stop_id);

create index idx_trip_expenses_trip
on public.trip_expenses(trip_id);

create index idx_trip_notes_trip
on public.trip_notes(trip_id);

create index idx_saved_destinations_user
on public.saved_destinations(user_id);

-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- =========================================================
-- UPDATE TRIGGERS
-- =========================================================

create trigger set_users_updated_at
before update on public.users
for each row
execute procedure public.handle_updated_at();

create trigger set_trips_updated_at
before update on public.trips
for each row
execute procedure public.handle_updated_at();

create trigger set_trip_notes_updated_at
before update on public.trip_notes
for each row
execute procedure public.handle_updated_at();

-- =========================================================
-- AUTO CALCULATE TRIP TOTAL COST
-- =========================================================

create or replace function public.update_trip_total_cost()
returns trigger
language plpgsql
as $$
declare
    stop_cost numeric := 0;
    activity_cost numeric := 0;
begin

    select coalesce(sum(total_stop_cost), 0)
    into stop_cost
    from public.trip_stops
    where trip_id = coalesce(
        new.trip_id,
        old.trip_id
    );

    select coalesce(sum(custom_cost), 0)
    into activity_cost
    from public.trip_activities ta
    join public.trip_stops ts
    on ta.trip_stop_id = ts.id
    where ts.trip_id = coalesce(
        new.trip_id,
        old.trip_id
    );

    update public.trips
    set estimated_total_cost = stop_cost + activity_cost
    where id = coalesce(
        new.trip_id,
        old.trip_id
    );

    return null;
end;
$$;

-- =========================================================
-- COST UPDATE TRIGGERS
-- =========================================================

create trigger trigger_update_trip_cost_from_stops
after insert or update or delete
on public.trip_stops
for each row
execute procedure public.update_trip_total_cost();

create trigger trigger_update_trip_cost_from_activities
after insert or update or delete
on public.trip_activities
for each row
execute procedure public.update_trip_total_cost();

-- =========================================================


-- SAMPLE CITY DATA
-- =========================================================

insert into public.cities (
    city_name,
    country,
    average_daily_cost,
    popularity_score,
    image_url
)
values
(
    'Ahmedabad',
    'India',
    2500,
    80,
    'https://images.unsplash.com/photo-1587474260584-136574528ed5'
),
(
    'Goa',
    'India',
    4500,
    95,
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2'
),
(
    'Tokyo',
    'Japan',
    12000,
    99,
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
),
(
    'Paris',
    'France',
    15000,
    98,
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
),
(
    'Bali',
    'Indonesia',
    7000,
    96,
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
);

-- =========================================================
-- FINAL NOTES

-- =========================================================
-- Authentication:
-- ✅ Custom JWT Authentication
-- ✅ bcrypt password hashing
-- ✅ refresh token support
-- ❌ No Supabase Auth dependency
-- ❌ No RLS policies
--
-- Features Included:
-- ✅ Multi-city trip planning
-- ✅ Dynamic itinerary builder
-- ✅ Activity management
-- ✅ Expense tracking
-- ✅ Packing checklist
-- ✅ Travel journal
-- ✅ Shared/public trips
-- ✅ Saved destinations
-- ✅ Auto-calculated trip budgets
--
-- Optimized For:
-- ✅ Odoo Hackathon
-- ✅ Next.js Frontend
-- ✅ Express Backend
-- ✅ PostgreSQL
-- ✅ Prisma / Drizzle ORM
-- ✅ Scalable SaaS Architecture
-- =========================================================

