import { useState } from "react";
import { useStore } from "../store";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { QrCode, Search, Eye, X } from "lucide-react";
import QRCode from "react-qr-code";

export function BillHistory() {
  const { bills, shopName } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const generateBillText = (bill: Bill) => {
    let text = `${shopName || 'Our Shop'}\nINVOICE\n`;
    text += `Date: ${format(bill.timestamp, "MMM dd, yyyy HH:mm")}\n`;
    text += `Bill ID: #${bill.id.slice(0, 8).toUpperCase()}\n`;
    if (bill.customerName) text += `Customer: ${bill.customerName}\n`;
    if (bill.customerPhone) text += `Phone: ${bill.customerPhone}\n`;
    text += `------------------------\n`;
    bill.items.forEach(item => {
      text += `${item.name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
    });
    text += `------------------------\n`;
    text += `Total: ${formatCurrency(bill.totalAmount)}\n`;
    return text;
  };
  
  const sortedBills = [...bills].sort((a, b) => b.timestamp - a.timestamp);
  
  const filteredBills = sortedBills.filter(
    (b) =>
      b.id.includes(searchTerm) ||
      (b.customerName && b.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bill History</h1>
          <p className="mt-1 text-sm text-gray-500">View past transactions and receipts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">No bills found.</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-slate-800">
                        #INV-{bill.id.slice(0, 6).toUpperCase()}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                        {format(bill.timestamp, "MMM dd, yyyy HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">
                        {bill.customerName ? bill.customerName : "Walk-in Customer"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                        {bill.items.length} Items
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-indigo-600">
                        {formatCurrency(bill.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        bill.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 shadow-sm rounded hover:bg-slate-50 transition-colors flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </button>
                        <a
                          href={`/scan/${bill.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-indigo-600 bg-indigo-50 border border-indigo-100 shadow-sm rounded hover:bg-indigo-100 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center text-gray-900">
                Receipt
              </h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-gray-50">
               <div className="bg-white p-6 rounded border border-dashed border-gray-300">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">ShopSync Invoice</h2>
                    <p className="text-sm text-gray-500">{format(selectedBill.timestamp, "MMM dd, yyyy HH:mm")}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {selectedBill.id}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6 text-sm">
                    {selectedBill.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(selectedBill.totalAmount)}</span>
                  </div>
               </div>
               
               <div className="mt-6 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Scan to view receipt text</p>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <QRCode value={generateBillText(selectedBill)} size={140} level="M" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
