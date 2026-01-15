import { useState } from 'react';
import { X } from 'lucide-react';
import { Sale } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
    onSuccess: () => void;
}

const AddPaymentModal = ({ isOpen, onClose, sale, onSuccess }: AddPaymentModalProps) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !sale) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) {
            toast.error('Amount is required');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/sales/${sale.id}/payments`, {
                amount: parseFloat(amount),
                method,
                date
            });
            toast.success('Payment added successfully');
            setAmount('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to add payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add Payment for Bill #{sale.id}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-4 bg-accent/20 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Net Amount:</span>
                            <span className="font-medium">₹{sale.net_amount || sale.netAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Paid:</span>
                            <span className="text-success font-medium">₹{sale.received_amount || sale.amountReceived}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-destructive">
                            <span>Due:</span>
                            <span>₹{sale.due_amount || sale.dueAmount}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field"
                            placeholder={`Max: ${sale.due_amount || sale.dueAmount}`}
                            max={sale.due_amount || sale.dueAmount}
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="input-field"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
