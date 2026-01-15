import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { sendWhatsAppMessage, getRecallMessage, getBirthdayMessage } from '@/lib/whatsapp';
import { DashboardStats } from '@/types';
import { TrendingUp, DollarSign, Calendar, MessageCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/dashboard');
      setData(response.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center">No data available</div>;
  }

  const StatCard = ({ title, value, count, icon: Icon, color }: any) => (
    <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">₹{value.toLocaleString()}</p>
          {count !== undefined && <p className="text-xs text-muted-foreground mt-1">{count} sales</p>}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={data.todays_sales.amount}
          count={data.todays_sales.count}
          icon={DollarSign}
          color="bg-primary"
        />
        <StatCard
          title="This Month"
          value={data.this_month_sales.amount}
          count={data.this_month_sales.count}
          icon={TrendingUp}
          color="bg-success"
        />
        <StatCard
          title="Last Month"
          value={data.last_month_sales.amount}
          count={data.last_month_sales.count}
          icon={Calendar}
          color="bg-warning"
        />
        <StatCard
          title="Total Due"
          value={data.total_due}
          icon={AlertCircle}
          color="bg-destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-card rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
          <div className="space-y-3">
            {(!data.recent_sales || data.recent_sales.length === 0) ? (
              <p className="text-muted-foreground text-center py-8">No sales yet</p>
            ) : (
              data.recent_sales.map(sale => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{sale.customer?.name || sale.customerName || 'Unknown Customer'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.sale_date || sale.date || ''), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{Number(sale.received_amount ?? sale.amountReceived ?? 0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${sale.status === 'Completed' ? 'bg-success/20 text-success' :
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
              {(!data.recalls_today || data.recalls_today.length === 0) ? (
                <p className="text-muted-foreground text-center py-4">No recalls today</p>
              ) : (
                data.recalls_today.map(customer => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <button
                      onClick={() => sendWhatsAppMessage(customer.phone, getRecallMessage(customer.name))}
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
              {(!data.birthdays_today || data.birthdays_today.length === 0) ? (
                <p className="text-muted-foreground text-center py-4">No birthdays today</p>
              ) : (
                data.birthdays_today.map(customer => (
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
