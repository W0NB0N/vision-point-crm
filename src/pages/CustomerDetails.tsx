import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Customer, Sale, Prescription } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Plus, FileText, Eye, Edit } from 'lucide-react';
import PrescriptionModal from '@/components/PrescriptionModal';
import BillModal from '@/components/BillModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import { toast } from 'sonner';
import { IndianRupee } from 'lucide-react';

const CustomerDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    // Bill Modal State
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showBillModal, setShowBillModal] = useState(false);

    // Add Payment Modal State
    const [saleToPay, setSaleToPay] = useState<Sale | null>(null);
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [customerRes, salesRes] = await Promise.all([
                api.get<Customer & { prescriptions: Prescription[] }>(`/customers/${id}`),
                api.get<Sale[]>('/sales', { params: { customer_id: id } })
            ]);

            setCustomer(customerRes.data);
            setPrescriptions(customerRes.data.prescriptions || []);
            setSales(salesRes.data);
        } catch (error) {
            console.error("Failed to load customer data", error);
            toast.error("Failed to load customer data");
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !customer) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/customers')}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
                    <p className="text-muted-foreground">{customer.phone}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info Card */}
                <div className="bg-card rounded-xl shadow-md p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4">Customer Info</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">ID</label>
                            <p>{customer.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Age / Gender</label>
                            <p>
                                {customer.age
                                    ? `${customer.age} Years`
                                    : customer.dob
                                        ? `${new Date().getFullYear() - new Date(customer.dob).getFullYear()} Years (Auto)`
                                        : '-'
                                } / {customer.gender}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">DOB</label>
                            <p>{customer.dob ? format(new Date(customer.dob), 'MMM dd, yyyy') : '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Notes</label>
                            <p>{customer.notes || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Joined</label>
                            <p>{customer.created_at || customer.createdAt ? format(new Date(customer.created_at || customer.createdAt || ''), 'MMM dd, yyyy') : '-'}</p>
                        </div>
                    </div>
                </div>

                {/* content column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Prescriptions */}
                    <div className="bg-card rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Prescriptions</h2>
                            <button
                                onClick={() => {
                                    setSelectedPrescription(null);
                                    setShowPrescriptionModal(true);
                                }}
                                className="btn-secondary text-xs flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-accent/30">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold">Date</th>
                                        <th className="p-3 text-left text-sm font-semibold">Type</th>
                                        <th className="p-3 text-left text-sm font-semibold">Doctor</th>
                                        <th className="p-3 text-right text-sm font-semibold">Right (Sph)</th>
                                        <th className="p-3 text-right text-sm font-semibold">Left (Sph)</th>
                                        <th className="p-3 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground text-sm">
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
                                                        title="View Details"
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
                    </div>

                    {/* Sales History */}
                    <div className="bg-card rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Sales History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-accent/30">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold">Date</th>
                                        <th className="p-3 text-right text-sm font-semibold">Amount</th>
                                        <th className="p-3 text-right text-sm font-semibold">Due</th>
                                        <th className="p-3 text-center text-sm font-semibold">Status</th>
                                        <th className="p-3 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
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
                                                        title="View Bill"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {(sale.due_amount > 0 || sale.dueAmount > 0) && (
                                                        <button
                                                            onClick={() => {
                                                                setSaleToPay(sale);
                                                                setShowAddPaymentModal(true);
                                                            }}
                                                            className="p-1 hover:bg-accent rounded transition-colors text-green-600"
                                                            title="Add Payment"
                                                        >
                                                            <IndianRupee className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/sales/edit/${sale.id}`)}
                                                        className="p-1 hover:bg-accent rounded transition-colors"
                                                        title="Edit Sale"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            <PrescriptionModal
                isOpen={showPrescriptionModal}
                onClose={() => setShowPrescriptionModal(false)}
                customerId={customer.id}
                customerPhone={customer.phone}
                onSuccess={(newPrescription) => {
                    setPrescriptions([...prescriptions, newPrescription]);
                }}
                initialData={selectedPrescription}
                readonly={!!selectedPrescription}
            />

            <BillModal
                isOpen={showBillModal}
                onClose={() => setShowBillModal(false)}
                sale={selectedSale}
            />

            <AddPaymentModal
                isOpen={showAddPaymentModal}
                onClose={() => setShowAddPaymentModal(false)}
                sale={saleToPay}
                onSuccess={() => {
                    loadData(); // Reload to update table
                }}
            />
        </div>
    );
};

export default CustomerDetails;
