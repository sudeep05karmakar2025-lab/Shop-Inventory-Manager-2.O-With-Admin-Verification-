import { useParams, Link } from "react-router-dom";
import { useStore } from "../store";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { ShoppingBag, CheckCircle, Store, Download } from "lucide-react";

export function PublicBill() {
  const { id } = useParams<{ id: string }>();
  const { bills } = useStore();
  
  const bill = bills.find((b) => b.id === id);

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h1>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          We couldn't find a receipt with this ID. Please check the link and try again.
        </p>
        <Link to="/" className="text-indigo-600 hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-8 text-center print:bg-white print:text-black">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 print:hidden">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white print:text-black">Payment Successful</h1>
          <p className="text-indigo-200 mt-2 print:text-gray-600">
            {format(bill.timestamp, "MMMM dd, yyyy 'at' hh:mm a")}
          </p>
        </div>

        {/* content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Receipt Number</p>
              <p className="font-mono text-sm text-gray-900 font-medium">{bill.id}</p>
            </div>
            {bill.customerName && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Billed To</p>
                <p className="text-sm text-gray-900 font-medium">{bill.customerName}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
              Order Summary
            </h3>
            <ul className="space-y-4">
              {bill.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-500">Total Amount</span>
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download / Print Receipt
          </button>
        </div>
        
        <div className="hidden print:block text-center mt-12 text-sm text-gray-500">
          <p>Thank you for shopping with us!</p>
          <p className="mt-1">ShopSync Inventory System</p>
        </div>
      </div>
    </div>
  );
}
