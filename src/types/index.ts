export interface Customer {
  id: string;
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age?: number;
  dob?: string;
  notes?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  powerType: 'Specs' | 'Contacts';
  date: string;
  doctorName?: string;
  leftEye: EyePower;
  rightEye: EyePower;
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
  name: string;
  note: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: SaleItem[];
  totalQuantity: number;
  totalAmount: number;
  discount: number;
  netAmount: number;
  amountReceived: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  dueAmount: number;
  recallDate?: string;
  status: 'Pending' | 'Ready' | 'Completed';
  prescriptionId?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Credit' | 'Debit';
  amount: number;
  method: 'Cash' | 'Card' | 'UPI';
  note: string;
  billNumber?: string;
}

export interface DashboardStats {
  todaySales: number;
  thisMonthSales: number;
  lastMonthSales: number;
}
