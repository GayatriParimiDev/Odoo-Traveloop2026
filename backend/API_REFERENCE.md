# Traveloop Backend API Reference

Source of truth: `schema.sql`

## Core

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Dashboard

- `GET /api/dashboard/overview`

## Trips

- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`
- `GET /api/trips/:id/itinerary`
- `GET /api/trips/:id/budget`

## Stops and Activities

- `GET /api/trips/:tripId/stops`
- `POST /api/trips/:tripId/stops`
- `PUT /api/trips/:tripId/stops/:stopId`
- `DELETE /api/trips/:tripId/stops/:stopId`
- `PATCH /api/trips/:tripId/stops/reorder`
- `GET /api/stops/:stopId/activities`
- `POST /api/stops/:stopId/activities`
- `DELETE /api/stops/:stopId/activities/:id`

## Planning Screens

- `GET /api/trips/:id/checklist`
- `POST /api/trips/:id/checklist`
- `PATCH /api/trips/:id/checklist/:itemId`
- `DELETE /api/trips/:id/checklist/:itemId`
- `DELETE /api/trips/:id/checklist/reset`
- `GET /api/trips/:id/expenses`
- `POST /api/trips/:id/expenses`
- `PUT /api/trips/:id/expenses/:expenseId`
- `DELETE /api/trips/:id/expenses/:expenseId`
- `GET /api/trips/:id/budget-summary`
- `GET /api/trips/:id/notes`
- `POST /api/trips/:id/notes`
- `PUT /api/trips/:id/notes/:noteId`
- `DELETE /api/trips/:id/notes/:noteId`

## Discovery

- `GET /api/cities`
- `GET /api/cities/:id`
- `GET /api/activities`
- `GET /api/activities/:id`

## User and Saved Data

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `DELETE /api/users/account`
- `GET /api/saved`
- `POST /api/saved`
- `DELETE /api/saved/:cityId`

## Public Sharing

- `POST /api/shared/trips/:id/share`
- `GET /api/shared/:slug`
- `POST /api/shared/:slug/copy`

## Notes

- All schema table names now align with `schema.sql` (`cities`, `activities`, `trip_expenses`, `packing_items`, `trip_notes`, `shared_trips`, `saved_destinations`).
- Authenticated endpoints expect `Authorization: Bearer <access_token>`.
