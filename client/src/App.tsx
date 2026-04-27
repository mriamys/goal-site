import { useState, useEffect } from 'react'
import { Plus, Wallet, Trash2, History, TrendingUp, Edit, X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

interface Transaction {
  id: number;
  amount: number;
  description: string;
  created_at: string;
  date?: string;
}

interface Goal {
  id: number;
  title: string;
  image_url: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  transactions?: Transaction[];
}

const API_URL = '/api';

function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    image_url: '',
    target_amount: '',
    currency: 'UAH',
  });

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_URL}/goals`);
      const goalsData: Goal[] = await response.json();
      
      const goalsWithTransactions = await Promise.all(goalsData.map(async (goal) => {
        const tResponse = await fetch(`${API_URL}/goals/${goal.id}/transactions`);
        const tData = await tResponse.json();
        return { ...goal, transactions: tData };
      }));
      
      setGoals(goalsWithTransactions);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          target_amount: parseFloat(newGoal.target_amount)
        }),
      });
      setIsModalOpen(false);
      setNewGoal({ title: '', image_url: '', target_amount: '', currency: 'UAH' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal) return;
    try {
      await fetch(`${API_URL}/goals/${editGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGoal),
      });
      setIsEditModalOpen(false);
      setEditGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;
    try {
      await fetch(`${API_URL}/goals/${selectedGoalId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(depositAmount),
          date: depositDate
        }),
      });
      setIsDepositModalOpen(false);
      setDepositAmount('');
      setDepositDate(new Date().toISOString().split('T')[0]);
      fetchGoals();
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Видалити цю ціль та всі її транзакції?')) return;
    try {
      await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTransaction) return;
    try {
      await fetch(`${API_URL}/transactions/${editTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: editTransaction.amount,
          date: editTransaction.date || editTransaction.created_at.split('T')[0],
          description: editTransaction.description
        }),
      });
      setIsEditTransactionModalOpen(false);
      setEditTransaction(null);
      fetchGoals();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Видалити цю транзакцию? Сума цілі буде перерахована.')) return;
    try {
      await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  return (
    <div className="App">
      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;900&display=swap" rel="stylesheet" />
      
      <header className="header">
        <h1 className="logo">GOAL</h1>
        <div className="header-actions">
          <button className="download-btn" onClick={() => window.open(`${API_URL}/download-db`)}>
            <Download size={20} style={{ marginRight: '8px' }} /> СКАЧАТИ БД
          </button>
          <button className="create-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> НОВА ЦІЛЬ
          </button>
        </div>
      </header>

      <main>
        <div className="goal-grid">
          <AnimatePresence>
            {goals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <motion.div 
                  key={goal.id} 
                  className="goal-card-premium"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="goal-visual">
                    <img 
                      src={goal.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000'} 
                      alt={goal.title} 
                      className="goal-img-large" 
                    />
                    <div className="goal-overlay-info">
                      <h3 className="goal-title">{goal.title}</h3>
                    </div>
                  </div>

                  <div className="goal-main-content">
                    <div className="stats-row">
                      <div className="stat-item">
                        <label>Цільова сума</label>
                        <div className="stat-value">{goal.target_amount.toLocaleString()} {goal.currency}</div>
                      </div>
                      <div className="stat-item">
                        <label>Накопичено</label>
                        <div className="stat-value" style={{ color: '#8b5cf6' }}>{goal.current_amount.toLocaleString()} {goal.currency}</div>
                      </div>
                    </div>

                    <div className="progress-section">
                      <div className="huge-percent">{progress.toFixed(0)}%</div>
                      <div className="custom-progress-bar">
                        <motion.div 
                          className="progress-fill-neon"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="action-btns">
                      <button className="btn-premium btn-primary-glow" onClick={() => {
                        setSelectedGoalId(goal.id);
                        setIsDepositModalOpen(true);
                      }}>
                        <Wallet size={20} /> ПОПОВНИТИ
                      </button>
                      <button className="btn-premium btn-edit" onClick={() => {
                        setEditGoal(goal);
                        setIsEditModalOpen(true);
                      }}>
                        <Edit size={20} /> РЕДАГУВАТИ
                      </button>
                      <button className="btn-premium btn-delete" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {goal.transactions && goal.transactions.length > 0 && (
                      <div className="history-section">
                        <div className="history-title">
                          <History size={16} /> ІСТОРІЯ ТРАНЗАКЦІЙ
                        </div>
                        <div className="transaction-list">
                          {goal.transactions.map((t) => (
                            <div key={t.id} className="transaction-item">
                              <div className="t-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingUp size={14} color="#10b981" />
                                <span className="t-amount">+{t.amount.toLocaleString()} {goal.currency}</span>
                                <span className="t-date-label" style={{ color: '#475569', fontSize: '0.8rem', marginLeft: '8px' }}>
                                  {t.date ? new Date(t.date).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="t-actions" style={{ display: 'flex', gap: '8px' }}>
                                <button className="t-btn-icon" onClick={() => {
                                  setEditTransaction(t);
                                  setIsEditTransactionModalOpen(true);
                                }} title="Редагувати">
                                  <Edit size={14} />
                                </button>
                                <button className="t-btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDeleteTransaction(t.id)} title="Видалити">
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2>СТВОРИТИ НОВИЙ ПРОЕКТ</h2>
            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label>НАЗВА</label>
                <input 
                  type="text" 
                  placeholder="Введіть назву..." 
                  required 
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>НЕОБХІДНА СУМА</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>ВАЛЮТА</label>
                <input 
                  type="text" 
                  placeholder="UAH" 
                  value={newGoal.currency}
                  onChange={(e) => setNewGoal({...newGoal, currency: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>URL ФОТО</label>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={newGoal.image_url}
                  onChange={(e) => setNewGoal({...newGoal, image_url: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>СКАСУВАТИ</button>
                <button type="submit" className="btn-primary">ЗАПУСТИТИ</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editGoal && (
        <div className="modal-overlay">
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2>РЕДАГУВАТИ ПРОЕКТ</h2>
            <form onSubmit={handleUpdateGoal}>
              <div className="form-group">
                <label>НАЗВА</label>
                <input 
                  type="text" 
                  required 
                  value={editGoal.title}
                  onChange={(e) => setEditGoal({...editGoal, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>НЕОБХІДНА СУМА</label>
                <input 
                  type="number" 
                  required 
                  value={editGoal.target_amount}
                  onChange={(e) => setEditGoal({...editGoal, target_amount: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>НАКОПИЧЕНО (ВРУЧНУ)</label>
                <input 
                  type="number" 
                  required 
                  value={editGoal.current_amount}
                  onChange={(e) => setEditGoal({...editGoal, current_amount: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>ВАЛЮТА</label>
                <input 
                  type="text" 
                  value={editGoal.currency}
                  onChange={(e) => setEditGoal({...editGoal, currency: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>URL ФОТО</label>
                <input 
                  type="text" 
                  value={editGoal.image_url}
                  onChange={(e) => setEditGoal({...editGoal, image_url: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>СКАСУВАТИ</button>
                <button type="submit" className="btn-primary">ЗБЕРЕГТИ</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="modal-overlay">
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2>ПОПОВНИТИ БАЛАНС</h2>
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label>СУМА ВНЕСКУ</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ДАТА ВНЕСКУ</label>
                <input 
                  type="date" 
                  required 
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsDepositModalOpen(false)}>СКАСУВАТИ</button>
                <button type="submit" className="btn-primary">ПІДТВЕРДИТИ</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isEditTransactionModalOpen && editTransaction && (
        <div className="modal-overlay">
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2>РЕДАГУВАТИ ТРАНЗАКЦІЮ</h2>
            <form onSubmit={handleUpdateTransaction}>
              <div className="form-group">
                <label>СУМА</label>
                <input 
                  type="number" 
                  required 
                  value={editTransaction.amount}
                  onChange={(e) => setEditTransaction({...editTransaction, amount: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>ДАТА</label>
                <input 
                  type="date" 
                  required 
                  value={editTransaction.date || editTransaction.created_at?.split('T')[0]}
                  onChange={(e) => setEditTransaction({...editTransaction, date: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditTransactionModalOpen(false)}>СКАСУВАТИ</button>
                <button type="submit" className="btn-primary">ЗБЕРЕГТИ</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App