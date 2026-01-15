export interface Customer {
  id: number;
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  dob?: string;
  notes?: string;
  created_at?: string;
  createdAt?: string; // legacy
}

export interface Prescription {
  id: number;
  customerId: number;
  type: 'Specs' | 'Contacts';
  date: string;
  doctor_name?: string;
  left_eye: EyePower;
  right_eye: EyePower;
  psm?: string;
  pd?: string;
  fh?: string;
}

export interface EyePower {
  sphD: string;
  sphN: string;
  cylD: string;
  cylN: string;
  axisD: string;
  axisN: string;
  visionD: string;
  visionN: string;
  addD: string;
  addN: string;
}

export interface SaleItem {
  category: 'Product' | 'Service';
  item_type?: string;
  item_detail?: string;
  name: string;
  note: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface Sale {
  id: number;
  customer_id: number;
  customerId?: string; // legacy support if needed
  customerName?: string; // legacy
  customerPhone?: string; // legacy
  customer?: Customer;
  sale_date: string;
  date?: string; // legacy
  items: SaleItem[];
  totalQuantity: number;
  totalAmount: number;
  discount: number;
  net_amount: number; // backend
  netAmount?: number; // legacy
  received_amount: number; // backend
  amountReceived?: number; // legacy
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  due_amount: number; // backend
  dueAmount?: number; // legacy
  recall_date?: string; // backend
  recallDate?: string; // legacy
  status: 'Pending' | 'Ready' | 'Completed';
  prescriptionId?: number;
  payments?: any[];
}

export interface Transaction {
  id: number;
  date: string;
  type: 'Credit' | 'Debit';
  amount: number;
  method: 'Cash' | 'Card' | 'UPI';
  note: string;
  billNumber?: string | number;
}

export interface SalesStats {
  amount: number;
  count: number;
}

export interface DashboardStats {
  todays_sales: SalesStats;
  this_month_sales: SalesStats;
  last_month_sales: SalesStats;
  total_due: number;
  recent_sales: Sale[];
  recalls_today: Customer[];
  birthdays_today: Customer[];
}
