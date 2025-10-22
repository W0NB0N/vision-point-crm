import { Customer, Prescription, Sale, Transaction } from '@/types';

const STORAGE_KEYS = {
  CUSTOMERS: 'visionpoint_customers',
  PRESCRIPTIONS: 'visionpoint_prescriptions',
  SALES: 'visionpoint_sales',
  TRANSACTIONS: 'visionpoint_transactions',
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Customer functions
export const getCustomers = (): Customer[] => getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex(c => c.id === customer.id);
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }
  saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomers().find(c => c.id === id);
};

// Prescription functions
export const getPrescriptions = (): Prescription[] => getFromStorage<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);

export const savePrescription = (prescription: Prescription): void => {
  const prescriptions = getPrescriptions();
  const existingIndex = prescriptions.findIndex(p => p.id === prescription.id);
  if (existingIndex >= 0) {
    prescriptions[existingIndex] = prescription;
  } else {
    prescriptions.push(prescription);
  }
  saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
};

export const getPrescriptionsByCustomerId = (customerId: string): Prescription[] => {
  return getPrescriptions().filter(p => p.customerId === customerId);
};

// Sale functions
export const getSales = (): Sale[] => getFromStorage<Sale>(STORAGE_KEYS.SALES);

export const saveSale = (sale: Sale): void => {
  const sales = getSales();
  const existingIndex = sales.findIndex(s => s.id === sale.id);
  if (existingIndex >= 0) {
    sales[existingIndex] = sale;
  } else {
    sales.push(sale);
  }
  saveToStorage(STORAGE_KEYS.SALES, sales);
};

export const getSalesByCustomerId = (customerId: string): Sale[] => {
  return getSales().filter(s => s.customerId === customerId);
};

// Transaction functions
export const getTransactions = (): Transaction[] => getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
};

// Helper functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
