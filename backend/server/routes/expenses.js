import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
} from '../controllers/expenses.controller.js';

const router = Router();

router.post('/:id/expenses', auth, createExpense);
router.get('/:id/expenses', auth, getExpenses);
router.get('/:id/budget-summary', auth, getBudgetSummary);
router.put('/:id/expenses/:expenseId', auth, updateExpense);
router.delete('/:id/expenses/:expenseId', auth, deleteExpense);

export default router;
