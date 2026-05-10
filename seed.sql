-- =========================================================
-- TRAVELOOP SEED DATA SCRIPT
-- Populates the database with realistic sample data
-- =========================================================

-- Clear existing data (Optional: Uncomment to reset tables)
/*
truncate public.users, public.cities, public.activities, public.trips cascade;
*/

-- =========================================================
-- 1. USERS
-- =========================================================
insert into public.users (username, full_name, email, password_hash, bio, city, country)
values 
('johndoe', 'John Doe', 'john@example.com', '$2b$10$YourHashedPasswordHere', 'Avid traveler and mountain climber.', 'New York', 'USA'),
('jane_smith', 'Jane Smith', 'jane@traveloop.app', '$2b$10$YourHashedPasswordHere', 'Digital nomad exploring Southeast Asia.', 'London', 'UK'),
('odoo_explorer', 'Odoo Explorer', 'hackathon@odoo.com', '$2b$10$YourHashedPasswordHere', 'Hacking my way through the world.', 'Brussels', 'Belgium')
on conflict (email) do nothing;

-- =========================================================
-- 2. ADDITIONAL CITIES
-- =========================================================
insert into public.cities (city_name, country, average_daily_cost, popularity_score, description, image_url)
values 
('New York', 'USA', 18000, 97, 'The city that never sleeps.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'),
('London', 'UK', 14000, 95, 'A historic city with modern vibes.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('Kyoto', 'Japan', 9000, 92, 'The heart of traditional Japanese culture.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'),
('Rome', 'Italy', 11000, 94, 'The Eternal City.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5')
on conflict (city_name, country) do nothing;

-- =========================================================
-- 3. ACTIVITIES
-- =========================================================
-- Ahmedabad
insert into public.activities (city_id, title, description, category, estimated_cost, estimated_duration_hours, rating)
select id, 'Sabarmati Ashram', 'The residence of Mahatma Gandhi.', 'historical', 50, 2, 4.8 from public.cities where city_name = 'Ahmedabad' limit 1;

insert into public.activities (city_id, title, description, category, estimated_cost, estimated_duration_hours, rating)
select id, 'Adalaj Stepwell', 'Intricate Hindu architecture.', 'historical', 0, 1.5, 4.7 from public.cities where city_name = 'Ahmedabad' limit 1;

-- Tokyo
insert into public.activities (city_id, title, description, category, estimated_cost, estimated_duration_hours, rating)
select id, 'Shibuya Crossing', 'The world''s busiest pedestrian crossing.', 'other', 0, 0.5, 4.5 from public.cities where city_name = 'Tokyo' limit 1;

insert into public.activities (city_id, title, description, category, estimated_cost, estimated_duration_hours, rating)
select id, 'TeamLab Borderless', 'Immersive digital art museum.', 'culture', 3500, 3, 4.9 from public.cities where city_name = 'Tokyo' limit 1;

-- Paris
insert into public.activities (city_id, title, description, category, estimated_cost, estimated_duration_hours, rating)
select id, 'Eiffel Tower Picnic', 'Classic Parisian experience at Champ de Mars.', 'food', 2000, 2, 4.8 from public.cities where city_name = 'Paris' limit 1;

-- =========================================================
-- 4. TRIPS
-- =========================================================
-- John's India Trip
insert into public.trips (user_id, title, description, trip_type, start_date, end_date, visibility, status)
select id, 'Indian Heritage Tour', 'Exploring the roots of Gujarat and beyond.', 'solo', current_date + 10, current_date + 20, 'public', 'planning'
from public.users where username = 'johndoe';

-- Jane's Japan Trip
insert into public.trips (user_id, title, description, trip_type, start_date, end_date, visibility, status)
select id, 'Cherry Blossom 2026', 'A journey through Tokyo and Kyoto.', 'friends', current_date + 30, current_date + 40, 'private', 'planning'
from public.users where username = 'jane_smith';

-- =========================================================
-- 5. TRIP STOPS
-- =========================================================
-- Ahmedabad Stop for John
insert into public.trip_stops (trip_id, city_id, arrival_date, departure_date, stop_order, hotel_name, hotel_cost)
select t.id, c.id, current_date + 10, current_date + 13, 1, 'Hyatt Regency Ahmedabad', 15000
from public.trips t, public.cities c 
where t.title = 'Indian Heritage Tour' and c.city_name = 'Ahmedabad';

-- Tokyo Stop for Jane
insert into public.trip_stops (trip_id, city_id, arrival_date, departure_date, stop_order, hotel_name, hotel_cost)
select t.id, c.id, current_date + 30, current_date + 35, 1, 'Park Hyatt Tokyo', 50000
from public.trips t, public.cities c 
where t.title = 'Cherry Blossom 2026' and c.city_name = 'Tokyo';

-- =========================================================
-- 6. TRIP ACTIVITIES
-- =========================================================
-- John at Ashram
insert into public.trip_activities (trip_stop_id, activity_id, activity_date, start_time, custom_notes)
select ts.id, a.id, current_date + 11, '09:00:00', 'Visit Gandhi''s spinning wheel.'
from public.trip_stops ts 
join public.trips t on ts.trip_id = t.id 
join public.activities a on a.title = 'Sabarmati Ashram'
where t.title = 'Indian Heritage Tour';

-- Jane at TeamLab
insert into public.trip_activities (trip_stop_id, activity_id, activity_date, start_time, custom_notes)
select ts.id, a.id, current_date + 31, '11:00:00', 'Book tickets in advance!'
from public.trip_stops ts 
join public.trips t on ts.trip_id = t.id 
join public.activities a on a.title = 'TeamLab Borderless'
where t.title = 'Cherry Blossom 2026';

-- =========================================================
-- 7. EXPENSES
-- =========================================================
insert into public.trip_expenses (trip_id, category, title, amount, notes)
select id, 'transport', 'Flight NYC to Ahmedabad', 85000, 'International flight'
from public.trips where title = 'Indian Heritage Tour';

insert into public.trip_expenses (trip_id, category, title, amount, notes)
select id, 'food', 'Dinner at Agashiye', 4500, 'Traditional Gujarati Thali'
from public.trips where title = 'Indian Heritage Tour';

-- =========================================================
-- 8. PACKING ITEMS
-- =========================================================
insert into public.packing_items (trip_id, item_name, category, quantity, is_packed)
select id, 'Passport', 'documents', 1, true from public.trips where title = 'Cherry Blossom 2026';

insert into public.packing_items (trip_id, item_name, category, quantity, is_packed)
select id, 'Universal Adapter', 'electronics', 1, false from public.trips where title = 'Cherry Blossom 2026';

-- =========================================================
-- 9. SHARED TRIPS
-- =========================================================
insert into public.shared_trips (trip_id, public_slug)
select id, 'john-india-2026' from public.trips where title = 'Indian Heritage Tour';

-- =========================================================
-- 10. SAVED DESTINATIONS
-- =========================================================
insert into public.saved_destinations (user_id, city_id)
select u.id, c.id from public.users u, public.cities c 
where u.username = 'odoo_explorer' and c.city_name = 'Paris';

-- =========================================================
-- DONE
-- =========================================================
