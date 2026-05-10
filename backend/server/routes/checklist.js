import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getChecklist,
  createChecklistItem,
  bulkCreateChecklistItems,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  resetChecklist,
} from '../controllers/checklist.controller.js';

const router = Router();

router.get('/:id/checklist', auth, getChecklist);
router.post('/:id/checklist', auth, createChecklistItem);
router.post('/:id/checklist/bulk', auth, bulkCreateChecklistItems);
router.put('/:id/checklist/:itemId', auth, updateChecklistItem);
router.delete('/:id/checklist/reset', auth, resetChecklist);
router.patch('/:id/checklist/:itemId', auth, toggleChecklistItem);
router.delete('/:id/checklist/:itemId', auth, deleteChecklistItem);

export default router;
