import { useState, useEffect } from 'react';
import { getSales, getCustomers } from '@/lib/storage';
import { sendWhatsAppMessage, getRecallMessage, getBirthdayMessage } from '@/lib/whatsapp';
import { Sale, Customer } from '@/types';
import { TrendingUp, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { format, isToday, isSameMonth, subMonths, parse } from 'date-fns';

const Dashboard = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    thisMonthSales: 0,
    lastMonthSales: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allSales = getSales();
    const allCustomers = getCustomers();
    setSales(allSales);
    setCustomers(allCustomers);

    // Calculate stats
    const today = new Date();
    const thisMonth = new Date();
    const lastMonth = subMonths(new Date(), 1);

    const todaySales = allSales
      .filter(s => isToday(new Date(s.date)))
      .reduce((sum, s) => sum + s.amountReceived, 0);

    const thisMonthSales = allSales
      .filter(s => isSameMonth(new Date(s.date), thisMonth))
      .reduce((sum, s) => sum + s.amountReceived, 0);

    const lastMonthSales = allSales
      .filter(s => isSameMonth(new Date(s.date), lastMonth))
      .reduce((sum, s) => sum + s.amountReceived, 0);

    setStats({ todaySales, thisMonthSales, lastMonthSales });
  };

  const recentSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const todayRecalls = sales.filter(s => 
    s.recallDate && isToday(new Date(s.recallDate))
  );

  const todayBirthdays = customers.filter(c => {
    if (!c.dob) return false;
    try {
      const dob = parse(c.dob, 'yyyy-MM-dd', new Date());
      const today = new Date();
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    } catch {
      return false;
    }
  });

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Sales"
          value={stats.todaySales}
          icon={DollarSign}
          color="bg-primary"
        />
        <StatCard
          title="This Month's Sales"
          value={stats.thisMonthSales}
          icon={TrendingUp}
          color="bg-success"
        />
        <StatCard
          title="Last Month's Sales"
          value={stats.lastMonthSales}
          icon={Calendar}
          color="bg-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sales yet</p>
            ) : (
              recentSales.map(sale => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{sale.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{sale.amountReceived.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sale.status === 'Completed' ? 'bg-success/20 text-success' :
                      sale.status === 'Ready' ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Events */}
        <div className="space-y-6">
          {/* Today's Recalls */}
          <div className="bg-card rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Today's Recalls</h2>
            <div className="space-y-3">
              {todayRecalls.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recalls today</p>
              ) : (
                todayRecalls.map(sale => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{sale.customerName}</p>
                      <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
                    </div>
                    <button
                      onClick={() => sendWhatsAppMessage(sale.customerPhone, getRecallMessage(sale.customerName))}
                      className="p-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                      title="Send WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Birthdays */}
          <div className="bg-card rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Birthdays Today 🎉</h2>
            <div className="space-y-3">
              {todayBirthdays.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No birthdays today</p>
              ) : (
                todayBirthdays.map(customer => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <button
                      onClick={() => sendWhatsAppMessage(customer.phone, getBirthdayMessage(customer.name))}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      title="Send WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
