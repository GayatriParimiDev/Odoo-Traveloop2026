# Traveloop Screen Reference

Reference for the non-admin screens from the PDF brief.

## Scope

- Include screens 4 through 13.
- Exclude the optional admin / analytics dashboard.
- Keep the UI modular so a backend can be connected later without reshaping the layouts.

## Screens

| Screen | Route | Core UI |
| --- | --- | --- |
| Itinerary Builder | `/itinerary-builder` | Add Stop, city/date pickers, activity assignment, reorderable stops |
| Itinerary View | `/itinerary-view` | Day-wise itinerary, city headers, time/cost blocks, list/calendar toggle |
| City Search | `/city-search` | Search bar, filters, city cards, add-to-trip actions |
| Activity Search | `/activity-search` | Type/cost/duration filters, activity cards, add/remove actions |
| Trip Budget | `/budget` | Cost breakdown, charts, average per day, over-budget alert |
| Packing Checklist | `/packing-checklist` | Checklist groups, packed state, item add/remove, reset action |
| Shared Itinerary | `/shared-itinerary` | Public link, itinerary summary, copy/share actions, read-only view |
| Profile Settings | `/settings` | Editable profile fields, language, privacy, saved destinations |
| Trip Notes | `/trip-notes` | Notes list, editor, timestamps, per-trip / per-stop notes |

## Layout Rules

- Use a warm editorial travel look.
- Keep cards soft and minimal, with clear hierarchy.
- Preserve room for future API integration.
- Use static mock data only as a temporary presentation layer.

## Notes

- The dashboard already uses the attached scenic travel photo.
- Backend integration should mount on top of the page components and data modules, not inside the route shell.
