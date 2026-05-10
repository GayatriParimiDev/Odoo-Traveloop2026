import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes.controller.js';

const router = Router();

router.get('/:id/notes', auth, getNotes);
router.post('/:id/notes', auth, createNote);
router.put('/:id/notes/:noteId', auth, updateNote);
router.delete('/:id/notes/:noteId', auth, deleteNote);

export default router;
