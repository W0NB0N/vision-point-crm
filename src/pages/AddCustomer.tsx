import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import PrescriptionModal from '@/components/PrescriptionModal';
import { Plus } from 'lucide-react';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [savedCustomerId, setSavedCustomerId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: '',
    dob: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      const response = await api.post('/customers', {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : undefined,
        dob: formData.dob || undefined,
        notes: formData.notes,
      });

      setSavedCustomerId(response.data.id);
      toast.success('Customer added successfully!');

      // Reset form
      setFormData({
        name: '',
        phone: '',
        gender: 'Male',
        age: '',
        dob: '',
        notes: '',
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to add customer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Customer</h1>
        <p className="text-muted-foreground mt-1">Register a new customer in your system</p>
      </div>

      <div className="bg-card rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
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
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => {
                  const dob = e.target.value;
                  let age = '';
                  if (dob) {
                    const birthDate = new Date(dob);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                      calculatedAge--;
                    }
                    age = calculatedAge.toString();
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
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Any additional notes about the customer..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Customer
            </button>

            {savedCustomerId && (
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Prescription
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {savedCustomerId && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          customerId={savedCustomerId}
        />
      )}
    </div>
  );
};

export default AddCustomer;
