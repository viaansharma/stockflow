import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../utils/api';
import { PageLoader } from '../components/UI';
import {
  Package, Users, ShoppingCart, TrendingUp,
  AlertCircle, Clock, ArrowRight, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const mockRevenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 6800 },
  { month: 'Mar', revenue: 5400 },
  { month: 'Apr', revenue: 9200 },
  { month: 'May', revenue: 7600 },
  { month: 'Jun', revenue: 11400 },
  { month: 'Jul', revenue: 9800 },
];

const mockOrdersData = [
  { name: 'Pending', value: 0, color: '#fbbf24' },
  { name: 'Confirmed', value: 0, color: '#38bdf8' },
  { name: 'Shipped', value: 0, color: '#a78bfa' },
  { name: 'Delivered', value: 0, color: '#34d399' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          ordersApi.dashboard(),
          ordersApi.list({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: Package,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      link: '/products',
    },
    {
      label: 'Customers',
      value: stats?.total_customers ?? 0,
      icon: Users,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      link: '/customers',
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders ?? 0,
      icon: ShoppingCart,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
      link: '/orders',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      link: '/orders',
    },
  ];

  const alerts = [];
  if (stats?.low_stock_products > 0) {
    alerts.push({
      type: 'warning',
      message: `${stats.low_stock_products} product(s) have low stock (≤10 units)`,
      link: '/products?low_stock=true',
    });
  }
  if (stats?.pending_orders > 0) {
    alerts.push({
      type: 'info',
      message: `${stats.pending_orders} order(s) are pending confirmation`,
      link: '/orders?status=pending',
    });
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              onClick={() => navigate(alert.link)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-opacity hover:opacity-80
                ${alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
                }`}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{alert.message}</span>
              <ArrowRight size={14} />
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
          <div
            key={label}
            onClick={() => navigate(link)}
            className="card p-5 cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-display text-ink-900">{value}</p>
            <p className="text-xs text-ink-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-ink-900">Revenue Trend</h2>
            <span className="text-xs text-ink-400 bg-ink-50 px-2.5 py-1 rounded-full">Sample Data</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5dc" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9a9082' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9a9082' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1815', border: 'none', borderRadius: '10px', color: '#f5f4f0', fontSize: '12px' }}
                formatter={(v) => [`$${v}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="card p-5">
          <h2 className="font-display text-lg text-ink-900 mb-5">Order Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', val: stats?.pending_orders ?? 0, color: 'bg-amber-400' },
              { label: 'Total', val: stats?.total_orders ?? 0, color: 'bg-sky-400' },
              { label: 'Low Stock', val: stats?.low_stock_products ?? 0, color: 'bg-rose-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-ink-600">{label}</span>
                </div>
                <span className="font-mono text-sm font-medium text-ink-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="font-display text-lg text-ink-900">Recent Orders</h2>
          <button onClick={() => navigate('/orders')} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={13} />
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-ink-400">No orders yet</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate('/orders')}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-ink-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-ink-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={14} className="text-ink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">Order #{order.id}</p>
                    <p className="text-xs text-ink-400">
                      {order.customer?.first_name} {order.customer?.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-800">${order.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-ink-400 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
