import { useState } from 'react';
import { X } from 'lucide-react';
import { Prescription, EyePower } from '@/types';
import { savePrescription, generateId } from '@/lib/storage';
import { toast } from 'sonner';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onSuccess?: (prescription: Prescription) => void;
}

const emptyEyePower: EyePower = {
  sphD: '', sphN: '', cylD: '', cylN: '',
  axisD: '', axisN: '', visionD: '', visionN: '',
  addD: '', addN: '',
};

const PrescriptionModal = ({ isOpen, onClose, customerId, onSuccess }: PrescriptionModalProps) => {
  const [formData, setFormData] = useState({
    powerType: 'Specs' as 'Specs' | 'Contacts',
    date: new Date().toISOString().split('T')[0],
    doctorName: '',
    leftEye: { ...emptyEyePower },
    rightEye: { ...emptyEyePower },
    psm: '',
    pd: '',
    fh: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prescription: Prescription = {
      id: generateId(),
      customerId,
      powerType: formData.powerType,
      date: formData.date,
      doctorName: formData.doctorName,
      leftEye: formData.leftEye,
      rightEye: formData.rightEye,
      psm: formData.psm,
      pd: formData.pd,
      fh: formData.fh,
    };

    savePrescription(prescription);
    toast.success('Prescription added successfully!');
    onSuccess?.(prescription);
    onClose();
  };

  const EyeTable = ({ 
    eye, 
    onChange, 
    label 
  }: { 
    eye: EyePower; 
    onChange: (eye: EyePower) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">{label}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-accent/30">
              <th className="border border-border p-2"></th>
              <th className="border border-border p-2">Sph</th>
              <th className="border border-border p-2">Cyl</th>
              <th className="border border-border p-2">Axis</th>
              <th className="border border-border p-2">Vision</th>
              <th className="border border-border p-2">Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-2 font-medium">D</td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.sphD}
                  onChange={(e) => onChange({ ...eye, sphD: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.cylD}
                  onChange={(e) => onChange({ ...eye, cylD: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.axisD}
                  onChange={(e) => onChange({ ...eye, axisD: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.visionD}
                  onChange={(e) => onChange({ ...eye, visionD: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.addD}
                  onChange={(e) => onChange({ ...eye, addD: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2 font-medium">N</td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.sphN}
                  onChange={(e) => onChange({ ...eye, sphN: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.cylN}
                  onChange={(e) => onChange({ ...eye, cylN: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.axisN}
                  onChange={(e) => onChange({ ...eye, axisN: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.visionN}
                  onChange={(e) => onChange({ ...eye, visionN: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
              <td className="border border-border p-1">
                <input
                  type="text"
                  value={eye.addN}
                  onChange={(e) => onChange({ ...eye, addN: e.target.value })}
                  className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-ring rounded"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Add Prescription</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Power Type</label>
              <select
                value={formData.powerType}
                onChange={(e) => setFormData({ ...formData, powerType: e.target.value as any })}
                className="input-field"
              >
                <option value="Specs">Specs</option>
                <option value="Contacts">Contacts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Doctor Name</label>
              <input
                type="text"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EyeTable
              eye={formData.rightEye}
              onChange={(rightEye) => setFormData({ ...formData, rightEye })}
              label="Right Eye (OD)"
            />
            <EyeTable
              eye={formData.leftEye}
              onChange={(leftEye) => setFormData({ ...formData, leftEye })}
              label="Left Eye (OS)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Psm</label>
              <input
                type="text"
                value={formData.psm}
                onChange={(e) => setFormData({ ...formData, psm: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pd</label>
              <input
                type="text"
                value={formData.pd}
                onChange={(e) => setFormData({ ...formData, pd: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fh</label>
              <input
                type="text"
                value={formData.fh}
                onChange={(e) => setFormData({ ...formData, fh: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
