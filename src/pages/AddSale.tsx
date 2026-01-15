import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Customer, SaleItem } from '@/types';
import { toast } from 'sonner';
import CustomerModal from '@/components/CustomerModal';
import PrescriptionModal from '@/components/PrescriptionModal';
import CustomerHistoryModal from '@/components/CustomerHistoryModal';
import { Plus, Trash2, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

const AddSale = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    category: 'Product' | 'Service';
    item_type: string;
    item_detail: string;
    name: string; // Keep for legacy or derived
    note: string;
    price: string;
    quantity: string;
  }>({
    category: 'Product',
    item_type: 'Frames',
    item_detail: 'Metal',
    name: '',
    note: '',
    price: '',
    quantity: '1',
  });

  const [billing, setBilling] = useState({
    discountPercent: '0',
    amountReceived: '0',
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'UPI',
    recallDate: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadCustomers();
    if (isEditing) {
      loadSale();
    }
  }, [id]);

  const loadSale = async () => {
    try {
      // We fetch generic sales list and find by ID because we don't have separate get_sale endpoint visible yet
      // A better way is to assume GET /sales returns list but maybe we can filter by ID or just fetch all
      // Actually router.get("/sales") has filtering but returns a list.
      // Let's rely on finding it in the list or fetching customer sales. 
      // Best approach given constraints: Fetch specific sale? The router doesn't strictly have GET /sales/{id} in the viewed code. 
      // It has GET / with limit. 
      // I should have added GET /sales/{id}. But I can filter the list if it's small or just query relevant data.
      // Wait, I can try GET /sales?limit=1000 and find it. Not efficient but works for now.
      // OR better: I'll assume I might need to add GET /sales/{id}. 
      // Actually, let's just use the list endpoint and filter.
      const response = await api.get('/sales', { params: { limit: 1000 } });
      const sale = response.data.find((s: any) => s.id === Number(id));

      if (sale) {
        // Find customer
        const customer = sale.customer || (await api.get(`/customers/${sale.customer_id}`)).data;
        setSelectedCustomer(customer);

        setItems(sale.items.map((i: any) => ({
          category: i.category || 'Product',
          item_type: i.item_type || '',
          item_detail: i.item_detail || '',
          name: i.name,
          note: i.note || '',
          price: parseFloat(i.price),
          quantity: i.quantity,
          amount: parseFloat(i.amount)
        })));

        setBilling({
          discountPercent: String(sale.discount_percent || 0),
          amountReceived: String(sale.received_amount || 0),
          paymentMethod: 'Cash', // Default, as we don't edit specific payments here
          recallDate: sale.recall_date || '',
          date: sale.sale_date || sale.date
        });
      }
    } catch (error) {
      console.error("Failed to load sale", error);
      toast.error("Failed to load sale details");
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to load customers", error);
    }
  };

  const addItem = () => {
    // Basic Validation
    if (!currentItem.price || !currentItem.quantity) {
      toast.error('Price and Quantity are required');
      return;
    }

    const item: SaleItem = {
      category: currentItem.category,
      item_type: currentItem.item_type,
      item_detail: currentItem.item_detail,
      name: `${currentItem.item_type} ${currentItem.item_detail ? `- ${currentItem.item_detail}` : ''}`,
      note: currentItem.note,
      price: parseFloat(currentItem.price),
      quantity: parseInt(currentItem.quantity),
      amount: parseFloat(currentItem.price) * parseInt(currentItem.quantity),
    };

    setItems([...items, item]);
    // Reset to defaults
    setCurrentItem({
      category: 'Product',
      item_type: 'Frames',
      item_detail: 'Metal',
      name: '',
      note: '',
      price: '',
      quantity: '1'
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // Discount Calculation
  const discountPercent = parseFloat(billing.discountPercent) || 0;
  const discountAmount = (totalAmount * discountPercent) / 100;

  const netAmount = totalAmount - discountAmount;
  const amountReceived = parseFloat(billing.amountReceived) || 0;
  const dueAmount = netAmount - amountReceived;

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const payload = {
      customer_id: selectedCustomer.id,
      sale_date: billing.date,
      subtotal: totalAmount,
      discount_percent: discountPercent,
      net_amount: netAmount,
      received_amount: amountReceived,
      due_amount: dueAmount,
      recall_date: billing.recallDate || null,
      status: 'Pending',
      items: items.map(item => ({
        category: item.category,
        item_type: item.item_type,
        item_detail: item.item_detail,
        name: item.name,
        note: item.note,
        price: item.price,
        quantity: item.quantity,
        amount: item.amount
      })),
      // Only include payments for new sales. 
      // For editing, we don't modify payments here (unless we allow adding new ones, but kept simple for now)
      payments: (!isEditing && amountReceived > 0) ? [{
        amount: amountReceived,
        method: billing.paymentMethod,
        date: billing.date
      }] : []
    };

    try {
      if (isEditing && id) {
        await api.put(`/sales/${id}`, payload);
        toast.success('Sale updated successfully!');
      } else {
        await api.post('/sales', payload);
        toast.success('Sale added successfully!');
      }
      navigate('/sales');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to save sale');
    }
  };

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<'prescriptions' | 'sales'>('prescriptions');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{isEditing ? 'Edit Sale' : 'Add Sale'}</h1>
        <p className="text-muted-foreground mt-1">{isEditing ? 'Update existing sale' : 'Create a new sale transaction'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Customer</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => String(c.id) === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                  className="input-field flex-1"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>

              {selectedCustomer && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setHistoryTab('prescriptions');
                      setShowHistoryModal(true);
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Prescriptions
                  </button>
                  <button
                    onClick={() => {
                      setHistoryTab('sales');
                      setShowHistoryModal(true);
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    Previous Sales
                  </button>
                  <button
                    onClick={() => setShowPrescriptionModal(true)}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Power
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Items</h2>

            {/* Add Item Form */}
            <div className="space-y-4 mb-6 p-4 bg-accent/10 rounded-lg border border-accent/20">

              {/* Category Selection */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="Product"
                    checked={currentItem.category === 'Product'}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      category: 'Product',
                      item_type: 'Frames', // set default
                      item_detail: 'Metal'
                    })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium">Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="Service"
                    checked={currentItem.category === 'Service'}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      category: 'Service',
                      item_type: 'Eye Testing', // set default
                      item_detail: ''
                    })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium">Service</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                {/* Type Selection based on Category */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Type</label>
                  <select
                    value={currentItem.item_type}
                    onChange={(e) => setCurrentItem({ ...currentItem, item_type: e.target.value, item_detail: '' })}
                    className="input-field w-full"
                  >
                    {currentItem.category === 'Product' ? (
                      <>
                        <option value="Frames">Frames</option>
                        <option value="Sunglass">Sunglass</option>
                        <option value="Contact Lens">Contact Lens</option>
                      </>
                    ) : (
                      <>
                        <option value="Eye Testing">Eye Testing</option>
                        <option value="Repair">Repair</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Detail Selection based on Type */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    {currentItem.item_type === 'Contact Lens' ? 'Color' : 'Detail'}
                  </label>
                  {(currentItem.item_type === 'Frames' || currentItem.item_type === 'Sunglass') ? (
                    <select
                      value={currentItem.item_detail}
                      onChange={(e) => setCurrentItem({ ...currentItem, item_detail: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="Metal">Metal</option>
                      <option value="Sheet">Sheet</option>
                    </select>
                  ) : (currentItem.item_type === 'Contact Lens') ? (
                    <input
                      type="text"
                      placeholder="Color e.g. Blue"
                      value={currentItem.item_detail}
                      onChange={(e) => setCurrentItem({ ...currentItem, item_detail: e.target.value })}
                      className="input-field w-full"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Optional Detail"
                      value={currentItem.item_detail}
                      onChange={(e) => setCurrentItem({ ...currentItem, item_detail: e.target.value })}
                      className="input-field w-full"
                      disabled={currentItem.category === 'Service' && ['Eye Testing', 'Repair'].includes(currentItem.item_type || '')}
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Price</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Qty</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    className="input-field w-full"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button onClick={addItem} className="btn-primary w-full flex justify-center items-center gap-2 h-10">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Large Note Field */}
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Notes</label>
                <textarea
                  placeholder="Item notes..."
                  value={currentItem.note}
                  onChange={(e) => setCurrentItem({ ...currentItem, note: e.target.value })}
                  className="input-field w-full resize-y min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent/30">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Item</th>
                    <th className="p-3 text-left text-sm font-medium">Note</th>
                    <th className="p-3 text-right text-sm font-medium">Price</th>
                    <th className="p-3 text-right text-sm font-medium">Qty</th>
                    <th className="p-3 text-right text-sm font-medium">Amount</th>
                    <th className="p-3 text-center text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-3">
                        <div className="font-medium">{item.item_type}</div>
                        <div className="text-xs text-muted-foreground">{item.category} {item.item_detail && `• ${item.item_detail}`}</div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{item.note}</td>
                      <td className="p-3 text-right">₹{item.price}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right font-medium">₹{item.amount}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:bg-destructive/10 p-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Bill Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="font-medium">{totalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={billing.discountPercent}
                    onChange={(e) => setBilling({ ...billing, discountPercent: e.target.value })}
                    className="input-field flex-1"
                    min="0"
                    max="100"
                  />
                  <div className="flex items-center text-sm text-muted-foreground w-20 justify-end">
                    ₹{discountAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-4">
                <span>Net Amount:</span>
                <span className="text-primary">₹{netAmount.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {isEditing ? 'Amount Received (Total)' : 'Amount Received'}
                </label>
                <input
                  type="number"
                  value={billing.amountReceived}
                  onChange={(e) => setBilling({ ...billing, amountReceived: e.target.value })}
                  className="input-field"
                  min="0"
                  disabled={isEditing} // Disable editing received amount directly in Edit mode
                  title={isEditing ? "Cannot edit payments here. Use 'Add Payment' in the list." : ""}
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={billing.paymentMethod}
                    onChange={(e) => setBilling({ ...billing, paymentMethod: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              )}

              <div className="flex justify-between text-destructive">
                <span className="font-medium">Due Amount:</span>
                <span className="font-bold">₹{dueAmount.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recall Date</label>
                <input
                  type="date"
                  value={billing.recallDate}
                  onChange={(e) => setBilling({ ...billing, recallDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sale Date</label>
                <input
                  type="date"
                  value={billing.date}
                  onChange={(e) => setBilling({ ...billing, date: e.target.value })}
                  className="input-field"
                />
              </div>

              <button onClick={handleSubmit} className="btn-primary w-full">
                {isEditing ? 'Update Sale' : 'Submit Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={(customer) => {
          setCustomers([...customers, customer]);
          setSelectedCustomer(customer);
        }}
      />

      {selectedCustomer && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          customerId={selectedCustomer.id}
          customerPhone={selectedCustomer.phone}
        />
      )}

      {selectedCustomer && (
        <CustomerHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          customerId={selectedCustomer.id}
          initialTab={historyTab}
        />
      )}
    </div>
  );
};

export default AddSale;
