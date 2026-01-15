import { useState, useEffect } from 'react';
import { X, Eye, FileText } from 'lucide-react';
import { Customer, Sale, Prescription } from '@/types';
import api from '@/lib/api';
import { format } from 'date-fns';
import BillModal from './BillModal';
import PrescriptionModal from './PrescriptionModal';

interface CustomerHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: number;
    initialTab?: 'prescriptions' | 'sales';
}

const CustomerHistoryModal = ({ isOpen, onClose, customerId, initialTab = 'prescriptions' }: CustomerHistoryModalProps) => {
    const [activeTab, setActiveTab] = useState<'prescriptions' | 'sales'>(initialTab);
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

    // Sub-modals state
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    useEffect(() => {
        if (isOpen && customerId) {
            loadData();
            setActiveTab(initialTab);
        }
    }, [isOpen, customerId, initialTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [customerRes, salesRes] = await Promise.all([
                api.get<Customer & { prescriptions: Prescription[] }>(`/customers/${customerId}`),
                api.get<Sale[]>('/sales', { params: { customer_id: customerId } })
            ]);
            setCustomer(customerRes.data);
            setPrescriptions(customerRes.data.prescriptions || []);
            setSales(salesRes.data);
        } catch (error) {
            console.error("Failed to load customer history", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold">Customer History</h2>
                        {customer && <p className="text-muted-foreground">{customer.name} - {customer.phone}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border px-6 shrink-0">
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prescriptions'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        Prescriptions
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sales'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveTab('sales')}
                    >
                        Sales History
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'prescriptions' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-accent/30">
                                            <tr>
                                                <th className="p-3 text-left text-sm font-semibold">Date</th>
                                                <th className="p-3 text-left text-sm font-semibold">Type</th>
                                                <th className="p-3 text-left text-sm font-semibold">Doctor</th>
                                                <th className="p-3 text-right text-sm font-semibold">Right (Sph)</th>
                                                <th className="p-3 text-right text-sm font-semibold">Left (Sph)</th>
                                                <th className="p-3 text-center text-sm font-semibold">View</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescriptions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                                                        No prescriptions found
                                                    </td>
                                                </tr>
                                            ) : (
                                                prescriptions.map((pres) => (
                                                    <tr key={pres.id} className="border-t border-border">
                                                        <td className="p-3 text-sm">{format(new Date(pres.date), 'MMM dd, yyyy')}</td>
                                                        <td className="p-3 text-sm">{pres.type}</td>
                                                        <td className="p-3 text-sm">{pres.doctor_name || '-'}</td>
                                                        <td className="p-3 text-sm text-right">{pres.right_eye?.sphD || '-'}</td>
                                                        <td className="p-3 text-sm text-right">{pres.left_eye?.sphD || '-'}</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPrescription(pres);
                                                                    setShowPrescriptionModal(true);
                                                                }}
                                                                className="p-1 hover:bg-accent rounded transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'sales' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-accent/30">
                                            <tr>
                                                <th className="p-3 text-left text-sm font-semibold">Date</th>
                                                <th className="p-3 text-right text-sm font-semibold">Amount</th>
                                                <th className="p-3 text-right text-sm font-semibold">Due</th>
                                                <th className="p-3 text-center text-sm font-semibold">Status</th>
                                                <th className="p-3 text-center text-sm font-semibold">View</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                                                        No sales found
                                                    </td>
                                                </tr>
                                            ) : (
                                                sales.map((sale) => (
                                                    <tr key={sale.id} className="border-t border-border">
                                                        <td className="p-3 text-sm">{format(new Date(sale.sale_date || sale.date || ''), 'MMM dd, yyyy')}</td>
                                                        <td className="p-3 text-sm text-right font-medium">₹{sale.net_amount || sale.netAmount}</td>
                                                        <td className="p-3 text-sm text-right text-destructive">₹{sale.due_amount || sale.dueAmount}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.status === 'Completed' ? 'bg-success/20 text-success' :
                                                                sale.status === 'Ready' ? 'bg-warning/20 text-warning' :
                                                                    'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {sale.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSale(sale);
                                                                    setShowBillModal(true);
                                                                }}
                                                                className="p-1 hover:bg-accent rounded transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Nested Modals */}
            <BillModal
                isOpen={showBillModal}
                onClose={() => setShowBillModal(false)}
                sale={selectedSale}
            />

            <PrescriptionModal
                isOpen={showPrescriptionModal}
                onClose={() => setShowPrescriptionModal(false)}
                customerId={customerId}
                customerPhone={customer?.phone}
                initialData={selectedPrescription}
                readonly={true}
            />
        </div>
    );
};

export default CustomerHistoryModal;
