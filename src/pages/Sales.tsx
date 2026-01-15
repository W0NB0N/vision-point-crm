import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Sale } from '@/types';
import { sendWhatsAppMessage, getStatusMessage } from '@/lib/whatsapp';
import { MessageCircle, Edit, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import BillModal from '@/components/BillModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import { IndianRupee } from 'lucide-react';

const Sales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerName: '',
    status: '',
  });

  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [saleToPay, setSaleToPay] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, filters]);

  const loadSales = async () => {
    try {
      const response = await api.get('/sales', {
        params: { limit: 1000 }
      });
      setSales(response.data);
    } catch (error) {
      console.error("Failed to load sales", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...sales];

    if (filters.startDate) {
      filtered = filtered.filter(s => new Date(s.sale_date || s.date || '') >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(s => new Date(s.sale_date || s.date || '') <= new Date(filters.endDate));
    }
    if (filters.customerName) {
      filtered = filtered.filter(s =>
        (s.customer?.name || s.customerName || '').toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    setFilteredSales(filtered);
  };

  const updateStatus = async (saleId: string | number, newStatus: 'Pending' | 'Ready' | 'Completed') => {
    try {
      await api.patch(`/sales/${saleId}/status`, null, {
        params: { status: newStatus }
      });

      const updatedSales = sales.map(s =>
        s.id === saleId ? { ...s, status: newStatus } : s
      );
      setSales(updatedSales);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success/20 text-success';
      case 'Ready':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground mt-1">View and manage all sales transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name</label>
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
              className="input-field"
              placeholder="Search by name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Date</th>
                <th className="p-4 text-left text-sm font-semibold">Customer</th>
                <th className="p-4 text-left text-sm font-semibold">Phone</th>
                <th className="p-4 text-right text-sm font-semibold">Received</th>
                <th className="p-4 text-right text-sm font-semibold">Due</th>
                <th className="p-4 text-center text-sm font-semibold">Status</th>
                <th className="p-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-border table-row-hover">
                    <td className="p-4">
                      {format(new Date(sale.sale_date || sale.date || ''), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4 font-medium">{sale.customer?.name || sale.customerName}</td>
                    <td className="p-4 text-sm text-muted-foreground">{sale.customer?.phone || sale.customerPhone}</td>
                    <td className="p-4 text-right font-medium text-success">
                      ₹{sale.received_amount?.toLocaleString() || sale.amountReceived?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-right font-medium text-destructive">
                      ₹{sale.due_amount?.toLocaleString() || sale.dueAmount?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={sale.status}
                        onChange={(e) => updateStatus(sale.id, e.target.value as any)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(sale.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => sendWhatsAppMessage(sale.customer?.phone || sale.customerPhone || '', getStatusMessage(sale.customer?.name || sale.customerName || '', sale.status))}
                          className="p-2 hover:bg-success/20 text-success rounded-lg transition-colors"
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowBillModal(true);
                          }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
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
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-green-600"
                            title="Add Payment"
                          >
                            <IndianRupee className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/sales/edit/${sale.id}`)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          loadSales(); // Reload to refresh data
        }}
      />
    </div>
  );
};

export default Sales;
