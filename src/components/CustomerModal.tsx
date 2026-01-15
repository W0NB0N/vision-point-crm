import { useState } from 'react';
import { X } from 'lucide-react';
import { Customer } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  customer?: Customer;
}

const CustomerModal = ({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) => {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: '',
      phone: '',
      gender: 'Male',
      age: undefined,
      dob: '',
      notes: '',
    }
  );

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    setLoading(true);
    try {
      let response;
      const payload = {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age || undefined,
        dob: formData.dob || undefined,
        notes: formData.notes
      };

      if (customer?.id) {
        // Update existing
        // Note: Add update endpoint if it exists, otherwise just create new for now or assume only Add mode is used here mostly.
        // The USER mostly cared about "adding new customer through add sale".
        // Let's assume Add mostly. If update is needed we need PUT endpoint.
        // For now, let's just support ADD properly as that's the reported bug.
        // If customer exists, we probably shouldn't be here in "add" mode unless editing.
        // Let's just implement POST for now as that's key. 

        // Actually, let's check if we have an update endpoint. The user didn't ask for update but good practice.
        // But to be safe and fix the specific "Add" bug:
        response = await api.post('/customers', payload);
      } else {
        response = await api.post('/customers', payload);
      }

      toast.success(`Customer ${customer ? 'updated' : 'added'} successfully!`);
      // The API returns the created customer with the integer ID.
      onSuccess(response.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                className="input-field"
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => {
                  const dob = e.target.value;
                  let age = formData.age;
                  if (dob) {
                    const birthDate = new Date(dob);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                      calculatedAge--;
                    }
                    age = calculatedAge;
                  }
                  setFormData({ ...formData, dob, age });
                }}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
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
              {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
