import { useState, useMemo } from "react";
import { useStore } from "../store";
import { cn } from "../lib/utils";
import { InventoryItem } from "../types";
import { Plus, Edit, Trash2, AlertTriangle, BarChart2, X } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export function Inventory() {
  const { items, addItem, updateItem, deleteItem, transactions, adjustStock } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    price: 0,
    costPrice: 0,
    lowStockThreshold: 5,
  });

  const handleSave = () => {
    if (editingId) {
      updateItem(editingId, formData);
      setEditingId(null);
    } else {
      addItem({
        ...formData,
      } as any);
      setIsAdding(false);
    }
    setFormData({ name: "", quantity: 0, price: 0, costPrice: 0, lowStockThreshold: 5 });
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      costPrice: item.costPrice || 0,
      lowStockThreshold: item.lowStockThreshold,
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your products.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-medium mb-4">{editingId ? "Edit Item" : "Add New Item"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="col-span-full lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                disabled={!!editingId} // Cannot edit quantity directly if editing, use adjust stock
                className="mt-1 focus:ring-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="mt-1 focus:ring-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="mt-1 focus:ring-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Low Stock Alert at</label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                className="mt-1 focus:ring-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Item
            </button>
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Current Stock</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Cost Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Selling Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">No items in inventory.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLowStock = item.quantity <= item.lowStockThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={cn("font-semibold", isLowStock ? "text-red-600" : "text-slate-800")}>
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("text-sm font-mono font-bold", isLowStock ? "text-red-600" : "text-slate-700")}>
                          {item.quantity} Units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-slate-500">
                        {formatCurrency(item.costPrice || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setHistoryItem(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                            title="View Fluctuations"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-white border border-slate-200 shadow-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Item</h3>
              <p className="text-sm text-slate-500 text-center">
                Are you sure you want to delete this inventory item? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex space-x-3 justify-end border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyItem && (
        <InventoryHistoryModal
          item={historyItem}
          transactions={transactions.filter((t) => t.itemId === historyItem.id)}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}

function InventoryHistoryModal({ item, transactions, onClose }: { item: InventoryItem; transactions: any[]; onClose: () => void }) {
  const chartData = useMemo(() => {
    // Reconstruct quantity over time
    let currentQty = 0;
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    
    return sorted.map((t) => {
      currentQty += t.quantityChange;
      return {
        date: format(t.timestamp, "MMM dd HH:mm"),
        quantity: currentQty,
        change: t.quantityChange,
        type: t.type
      };
    });
  }, [transactions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
            Stock History: {item.name}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
           {chartData.length > 0 ? (
             <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Area type="stepAfter" dataKey="quantity" stroke="#10b981" fillOpacity={1} fill="url(#colorQty)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           ) : (
             <p className="text-gray-500 text-center py-4">No transaction history found.</p>
           )}
           
           <h4 className="font-medium text-gray-900 mb-3">Transaction Log</h4>
           <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...chartData].reverse().map((d, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-500">{d.type}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${d.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.change > 0 ? '+' : ''}{d.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
