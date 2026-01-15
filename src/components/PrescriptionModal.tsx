import { useState, useEffect } from 'react';
import { X, Share2 } from 'lucide-react';
import { Prescription, EyePower } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerPhone?: string;
  onSuccess?: (prescription: Prescription) => void;
  initialData?: Prescription | null;
  readonly?: boolean;
}

const emptyEyePower: EyePower = {
  sphD: '', sphN: '', cylD: '', cylN: '',
  axisD: '', axisN: '', visionD: '', visionN: '',
  addD: '', addN: '',
};

const PrescriptionModal = ({ isOpen, onClose, customerId, customerPhone, onSuccess, initialData, readonly = false }: PrescriptionModalProps) => {
  const [formData, setFormData] = useState({
    type: 'Specs' as 'Specs' | 'Contacts',
    date: new Date().toISOString().split('T')[0],
    doctor_name: '',
    left_eye: { ...emptyEyePower },
    right_eye: { ...emptyEyePower },
    psm: '',
    pd: '',
    fh: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        type: initialData.type,
        date: initialData.date,
        doctor_name: initialData.doctor_name || '',
        left_eye: initialData.left_eye || { ...emptyEyePower },
        right_eye: initialData.right_eye || { ...emptyEyePower },
        psm: initialData.psm || '',
        pd: initialData.pd || '',
        fh: initialData.fh || '',
      });
    } else if (isOpen && !initialData) {
      setFormData({
        type: 'Specs',
        date: new Date().toISOString().split('T')[0],
        doctor_name: '',
        left_eye: { ...emptyEyePower },
        right_eye: { ...emptyEyePower },
        psm: '',
        pd: '',
        fh: '',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleShare = () => {
    if (!customerPhone) {
      toast.error('Customer phone number not available');
      return;
    }

    const formatEye = (label: string, eye: EyePower) => {
      return `${label}:\n` +
        `   SPH   CYL   AXIS   VIS   ADD\n` +
        `DV ${eye.sphD.padEnd(5)} ${eye.cylD.padEnd(5)} ${eye.axisD.padEnd(5)} ${eye.visionD.padEnd(5)} ${eye.addD}\n` +
        `NV ${eye.sphN.padEnd(5)} ${eye.cylN.padEnd(5)} ${eye.axisN.padEnd(5)} ${eye.visionN.padEnd(5)} ${eye.addN}`;
    };

    const message = `*Vision Point Prescription*\n` +
      `Date: ${formData.date}\n` +
      `Doctor: ${formData.doctor_name}\n\n` +
      `${formatEye("RIGHT EYE (OD)", formData.right_eye)}\n\n` +
      `${formatEye("LEFT EYE (OS)", formData.left_eye)}\n\n` +
      `PD: ${formData.pd}  PSM: ${formData.psm}  FH: ${formData.fh}\n\n` +
      `Visit us again!`;

    sendWhatsAppMessage(customerPhone, message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;

    try {
      const payload = {
        date: formData.date,
        type: formData.type,
        doctor_name: formData.doctor_name,
        left_eye: formData.left_eye,
        right_eye: formData.right_eye,
        pd: formData.pd,
        psm: formData.psm,
        fh: formData.fh,
      };

      const response = await api.post(`/customers/${customerId}/prescriptions`, payload);

      toast.success('Prescription added successfully!');
      onSuccess?.(response.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to add prescription');
    }
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
              <th className="border border-border p-2">SPH</th>
              <th className="border border-border p-2">CYL</th>
              <th className="border border-border p-2">AXIS</th>
              <th className="border border-border p-2">VISION</th>
              <th className="border border-border p-2">ADD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-2 font-medium">D.V</td>
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
              <td className="border border-border p-2 font-medium">N.V</td>
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
          <h2 className="text-2xl font-bold">{readonly ? 'View Prescription' : 'Add Prescription'}</h2>

          <div className="flex gap-2">
            {readonly && (
              <button onClick={handleShare} className="p-2 hover:bg-accent rounded-lg transition-colors text-green-600" title="Share on WhatsApp">
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Power Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input-field"
                disabled={readonly}
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
                disabled={readonly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Doctor Name</label>
              <input
                type="text"
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                className="input-field"
                disabled={readonly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EyeTable
              eye={formData.right_eye}
              onChange={(right_eye) => !readonly && setFormData({ ...formData, right_eye })}
              label="Right Eye (OD)"
            />
            <EyeTable
              eye={formData.left_eye}
              onChange={(left_eye) => !readonly && setFormData({ ...formData, left_eye })}
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
                disabled={readonly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pd</label>
              <input
                type="text"
                value={formData.pd}
                onChange={(e) => setFormData({ ...formData, pd: e.target.value })}
                className="input-field"
                disabled={readonly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fh</label>
              <input
                type="text"
                value={formData.fh}
                onChange={(e) => setFormData({ ...formData, fh: e.target.value })}
                className="input-field"
                disabled={readonly}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            {!readonly && (
              <button type="submit" className="btn-primary">
                Add Prescription
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
