import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  createStop,
  getStops,
  updateStop,
  deleteStop,
  reorderStops,
  getItinerary,
} from '../controllers/trips.controller.js';

const router = Router();

router.post('/', auth, createTrip);
router.get('/', auth, getTrips);
router.get('/:id', auth, getTrip);
router.put('/:id', auth, updateTrip);
router.delete('/:id', auth, deleteTrip);
router.get('/:id/itinerary', auth, getItinerary);
router.post('/:tripId/stops', auth, createStop);
router.get('/:tripId/stops', auth, getStops);
router.put('/:tripId/stops/:stopId', auth, updateStop);
router.delete('/:tripId/stops/:stopId', auth, deleteStop);
router.patch('/:tripId/stops/reorder', auth, reorderStops);

export default router;
