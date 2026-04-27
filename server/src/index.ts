import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import db, { initDb } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all goals
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await db('goals').select('*').orderBy('id', 'asc');
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create a new goal
app.post('/api/goals', async (req, res) => {
  const { title, image_url, target_amount, currency } = req.body;
  try {
    const [id] = await db('goals').insert({
      title,
      image_url,
      target_amount,
      currency: currency || 'UAH',
    });
    const newGoal = await db('goals').where({ id }).first();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update a goal
app.put('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { title, image_url, target_amount, currency, current_amount } = req.body;
  try {
    await db('goals').where({ id }).update({
      title,
      image_url,
      target_amount,
      currency,
      current_amount,
    });
    const updatedGoal = await db('goals').where({ id }).first();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Add money to a goal
app.post('/api/goals/:id/deposit', async (req, res) => {
  const { id } = req.params;
  const { amount, description, date } = req.body;
  
  try {
    await db.transaction(async (trx) => {
      // Add transaction record
      await trx('transactions').insert({
        goal_id: id,
        amount,
        description,
        date: date || new Date().toISOString().split('T')[0],
      });

      // Update current amount in goals table
      await trx('goals')
        .where({ id })
        .increment('current_amount', amount);
    });

    const updatedGoal = await db('goals').where({ id }).first();
    res.json(updatedGoal);
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to deposit money' });
  }
});

// Delete a goal
app.delete('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db('goals').where({ id }).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Get transactions for a goal
app.get('/api/goals/:id/transactions', async (req, res) => {
  const { id } = req.params;
  try {
    const transactions = await db('transactions')
      .where({ goal_id: id })
      .orderBy('date', 'desc')
      .orderBy('created_at', 'desc');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Download database
app.get('/api/download-db', (req, res) => {
  const dbPath = path.join(__dirname, '../data.sqlite');
  res.download(dbPath, 'data.sqlite', (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to download database' });
    }
  });
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});