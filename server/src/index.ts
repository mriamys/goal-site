import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Add money to a goal
app.post('/api/goals/:id/deposit', async (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;
  
  try {
    await db.transaction(async (trx) => {
      // Add transaction record
      await trx('transactions').insert({
        goal_id: id,
        amount,
        description,
      });

      // Update current amount in goals table
      await trx('goals')
        .where({ id })
        .increment('current_amount', amount);
    });

    const updatedGoal = await db('goals').where({ id }).first();
    res.json(updatedGoal);
  } catch (error) {
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
      .orderBy('created_at', 'desc');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});