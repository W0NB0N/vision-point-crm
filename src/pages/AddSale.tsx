import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, getSalesByCustomerId, getPrescriptionsByCustomerId, saveSale, saveTransaction, generateId } from '@/lib/storage';
import { Customer, SaleItem, Sale } from '@/types';
import { toast } from 'sonner';
import CustomerModal from '@/components/CustomerModal';
import PrescriptionModal from '@/components/PrescriptionModal';
import { Plus, Trash2, Eye, FileText } from 'lucide-react';

const AddSale = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    note: '',
    price: '',
    quantity: '1',
  });

  const [billing, setBilling] = useState({
    discount: '0',
    amountReceived: '0',
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'UPI',
    recallDate: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const addItem = () => {
    if (!currentItem.name || !currentItem.price || !currentItem.quantity) {
      toast.error('Please fill all item fields');
      return;
    }

    const item: SaleItem = {
      name: currentItem.name,
      note: currentItem.note,
      price: parseFloat(currentItem.price),
      quantity: parseInt(currentItem.quantity),
      amount: parseFloat(currentItem.price) * parseInt(currentItem.quantity),
    };

    setItems([...items, item]);
    setCurrentItem({ name: '', note: '', price: '', quantity: '1' });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = parseFloat(billing.discount) || 0;
  const netAmount = totalAmount - discount;
  const amountReceived = parseFloat(billing.amountReceived) || 0;
  const dueAmount = netAmount - amountReceived;

  const handleSubmit = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const sale: Sale = {
      id: generateId(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      date: billing.date,
      items,
      totalQuantity,
      totalAmount,
      discount,
      netAmount,
      amountReceived,
      paymentMethod: billing.paymentMethod,
      dueAmount,
      recallDate: billing.recallDate || undefined,
      status: 'Pending',
    };

    saveSale(sale);

    // Add transaction to cashbook
    saveTransaction({
      id: generateId(),
      date: billing.date,
      type: 'Credit',
      amount: amountReceived,
      method: billing.paymentMethod,
      note: `Sale to ${selectedCustomer.name}`,
      billNumber: sale.id,
    });

    toast.success('Sale added successfully!');
    navigate('/sales');
  };

  const viewPrescriptions = () => {
    if (!selectedCustomer) return;
    const prescriptions = getPrescriptionsByCustomerId(selectedCustomer.id);
    if (prescriptions.length === 0) {
      toast.info('No prescriptions found for this customer');
    } else {
      toast.info(`Found ${prescriptions.length} prescription(s)`);
    }
  };

  const viewPreviousSales = () => {
    if (!selectedCustomer) return;
    const previousSales = getSalesByCustomerId(selectedCustomer.id);
    if (previousSales.length === 0) {
      toast.info('No previous sales found');
    } else {
      toast.info(`Found ${previousSales.length} previous sale(s)`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Sale</h1>
        <p className="text-muted-foreground mt-1">Create a new sale transaction</p>
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
                    const customer = customers.find(c => c.id === e.target.value);
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
                  <button onClick={viewPrescriptions} className="btn-secondary text-sm flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Prescriptions
                  </button>
                  <button onClick={viewPreviousSales} className="btn-secondary text-sm flex items-center gap-1">
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
            <div className="grid grid-cols-12 gap-2 mb-4">
              <input
                type="text"
                placeholder="Item name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="input-field col-span-3"
              />
              <input
                type="text"
                placeholder="Note"
                value={currentItem.note}
                onChange={(e) => setCurrentItem({ ...currentItem, note: e.target.value })}
                className="input-field col-span-3"
              />
              <input
                type="number"
                placeholder="Price"
                value={currentItem.price}
                onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                className="input-field col-span-2"
              />
              <input
                type="number"
                placeholder="Qty"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                className="input-field col-span-2"
                min="1"
              />
              <button onClick={addItem} className="btn-primary col-span-2">
                <Plus className="w-4 h-4" />
              </button>
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
                      <td className="p-3">{item.name}</td>
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
                <label className="block text-sm font-medium mb-2">Discount</label>
                <input
                  type="number"
                  value={billing.discount}
                  onChange={(e) => setBilling({ ...billing, discount: e.target.value })}
                  className="input-field"
                  min="0"
                />
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-4">
                <span>Net Amount:</span>
                <span className="text-primary">₹{netAmount.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount Received</label>
                <input
                  type="number"
                  value={billing.amountReceived}
                  onChange={(e) => setBilling({ ...billing, amountReceived: e.target.value })}
                  className="input-field"
                  min="0"
                />
              </div>

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
                Submit Sale
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
        />
      )}
    </div>
  );
};

export default AddSale;
