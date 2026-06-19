import { useMemo } from "react";
import { useStore } from "../store";
import { DollarSign, Package, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export function Dashboard() {
  const { items, bills } = useStore();

  const metrics = useMemo(() => {
    const totalInventoryValue = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const completedBills = bills.filter((b) => b.status === "completed");
    const totalSales = completedBills.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalCOGS = completedBills.reduce((acc, b) => acc + b.items.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0), 0);
    const netProfit = totalSales - totalCOGS;
    const lowStockItems = items.filter((item) => item.quantity <= item.lowStockThreshold);

    return { totalInventoryValue, totalSales, netProfit, lowStockCount: lowStockItems.length, totalBills: completedBills.length };
  }, [items, bills]);

  const salesData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date).getTime();
      const dayEnd = endOfDay(date).getTime();
      
      const dayBills = bills.filter(b => b.status === "completed" && b.timestamp >= dayStart && b.timestamp <= dayEnd);
      const dailyTotal = dayBills.reduce((sum, b) => sum + b.totalAmount, 0);
      
      data.push({
        date: format(date, "MMM dd"),
        sales: dailyTotal,
      });
    }
    return data;
  }, [bills]);

  const topItems = useMemo(() => {
    const counts: Record<string, {name: string, quantity: number}> = {};
    bills.filter(b => b.status === "completed").forEach(bill => {
      bill.items.forEach(item => {
        if (!counts[item.itemId]) counts[item.itemId] = { name: item.name, quantity: 0 };
        counts[item.itemId].quantity += item.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [bills]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your shop's performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Sales</div>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalSales)}</div>
          <div className="text-emerald-500 text-xs font-medium mt-1">Based on completed orders</div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total SKU Count</div>
            <Package className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{items.length} <span className="text-sm text-slate-400 font-normal">Items</span></div>
          <div className="text-slate-400 text-xs font-medium mt-1">Total items in system</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-red-500 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{metrics.lowStockCount} <span className="text-sm text-slate-400 font-normal">Items</span></div>
          {metrics.lowStockCount > 0 ? (
            <div className="text-slate-400 text-xs font-medium mt-1 underline cursor-pointer hover:text-red-600">Action Required</div>
          ) : (
            <div className="text-emerald-500 text-xs font-medium mt-1">Stock levels healthy</div>
          )}
        </div>

        <div className="bg-indigo-600 p-5 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              Net Profit
              <TrendingUp className="h-4 w-4 text-indigo-200" />
            </div>
            <div className="text-white text-2xl font-bold">{formatCurrency(metrics.netProfit)}</div>
          </div>
          <div className="text-indigo-200 text-[10px] mt-2 font-bold uppercase tracking-wider">Total Sales - Cost of Goods</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-normal">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">Sales (Last 7 Days)</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-medium">Weekly Range</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">Top Selling Items</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold">Real-time</span>
            </div>
          </div>
          <div className="h-72">
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                  <Bar dataKey="quantity" fill="#6366f1" radius={[0, 4, 4, 0]} name="Units Sold" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No sales data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
