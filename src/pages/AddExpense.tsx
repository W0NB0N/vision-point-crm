import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'Cash' as 'Cash' | 'Card' | 'UPI',
    type: 'Debit' as 'Credit' | 'Debit',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount) {
      toast.error('Amount is required');
      return;
    }

    try {
      await api.post('/cashbook', {
        date: formData.date,
        type: formData.type,
        amount: parseFloat(formData.amount),
        method: formData.method,
        note: formData.notes || `${formData.type} transaction`,
      });

      toast.success('Transaction added successfully!');
      navigate('/cashbook');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
        <p className="text-muted-foreground mt-1">Record a new financial transaction</p>
      </div>

      <div className="bg-card rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="p-6 bg-primary/10 rounded-full">
            <DollarSign className="w-12 h-12 text-primary" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                className="input-field"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input-field"
              >
                <option value="Debit">Debit (Expense)</option>
                <option value="Credit">Credit (Income)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Add any notes about this transaction..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => navigate('/cashbook')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
