import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Transaction } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Cashbook = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    method: '',
    type: '',
  });

  const [summary, setSummary] = useState({
    total_credit: 0,
    total_debit: 0,
    net_earnings: 0,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      // Load transactions with filters
      const params: any = { limit: 1000 };
      if (filters.fromDate) params.start_date = filters.fromDate;
      if (filters.toDate) params.end_date = filters.toDate;
      if (filters.method) params.method = filters.method;
      if (filters.type) params.type = filters.type;

      const [transactionsRes, summaryRes] = await Promise.all([
        api.get('/cashbook', { params }),
        api.get('/cashbook/summary')
      ]);

      setTransactions(transactionsRes.data);
      setFilteredTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to load cashbook data", error);
    }
  };

  // Deprecated client-side filtering and calc, now handled by fetch re-trigger
  const applyFilters = () => { };

  const totalCredit = summary.total_credit;
  const totalDebit = summary.total_debit;
  const netEarning = summary.net_earnings;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-card rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">₹{value.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cashbook</h1>
        <p className="text-muted-foreground mt-1">Track all your financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Credit"
          value={totalCredit}
          icon={TrendingUp}
          color="bg-success"
        />
        <StatCard
          title="Total Debit"
          value={totalDebit}
          icon={TrendingDown}
          color="bg-destructive"
        />
        <StatCard
          title="Net Earning"
          value={netEarning}
          icon={DollarSign}
          color="bg-primary"
        />
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Method</label>
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="input-field"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Date</th>
                <th className="p-4 text-center text-sm font-semibold">Type</th>
                <th className="p-4 text-right text-sm font-semibold">Amount</th>
                <th className="p-4 text-center text-sm font-semibold">Method</th>
                <th className="p-4 text-left text-sm font-semibold">Note</th>
                <th className="p-4 text-left text-sm font-semibold">Bill #</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-border table-row-hover">
                    <td className="p-4">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'Credit'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                          }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${transaction.type === 'Credit' ? 'text-success' : 'text-destructive'
                      }`}>
                      {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-accent/50 rounded-full text-xs font-medium">
                        {transaction.method}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{transaction.note}</td>
                    <td className="p-4 text-sm font-mono">{transaction.billNumber || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cashbook;
