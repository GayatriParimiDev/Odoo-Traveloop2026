import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import citiesRoutes from './routes/cities.js';
import activitiesRoutes from './routes/activities.js';
import tripsRoutes from './routes/trips.js';
import stopsRoutes from './routes/stops.js';
import checklistRoutes from './routes/checklist.js';
import expensesRoutes from './routes/expenses.js';
import notesRoutes from './routes/notes.js';
import savedRoutes from './routes/saved.js';
import sharedRoutes from './routes/shared.js';
import dashboardRoutes from './routes/dashboard.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Traveloop API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/stops', stopsRoutes);
app.use('/api/trips', checklistRoutes);
app.use('/api/trips', expensesRoutes);
app.use('/api/trips', notesRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/shared', sharedRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
