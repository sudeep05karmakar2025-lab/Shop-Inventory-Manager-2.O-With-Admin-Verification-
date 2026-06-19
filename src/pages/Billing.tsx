import { useState, useMemo } from "react";
import { useStore } from "../store";
import { BillItem, InventoryItem } from "../types";
import { Search, ScanBarcode, Minus, Plus, Trash2, ShoppingCart, User } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { QRScanner } from "../components/QRScanner";
import QRCode from "react-qr-code";

export function Billing() {
  const { items, currentUser, createBill, bills, shopName } = useStore();
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [completedBillId, setCompletedBillId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

  const generateBillText = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return "";
    let text = `${shopName || 'Our Shop'}\nINVOICE\n`;
    text += `Date: ${new Date(bill.timestamp).toLocaleString()}\n`;
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

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    return items.filter((i) => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // show top 5 matches
  }, [items, searchTerm]);

  const addToCart = (item: InventoryItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) return prev; // don't exceed stock
        return prev.map((i) => (i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { itemId: item.id, name: item.name, quantity: 1, price: item.price, costPrice: item.costPrice || 0 }];
    });
    setSearchTerm("");
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const itemStock = items.find(i => i.id === itemId)?.quantity || 0;
    setCart((prev) =>
      prev.map((i) => {
        if (i.itemId === itemId) {
          const newQty = Math.max(1, i.quantity + delta);
          if (newQty > itemStock) return i; // can't exceed stock
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const billId = createBill({
      items: cart,
      totalAmount: total,
      customerName,
      customerPhone,
      createdBy: currentUser!.id,
    });
    
    setCompletedBillId(billId);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
  };

  if (completedBillId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-lg shadow p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
        <p className="text-gray-500 mb-8">Bill ID: {completedBillId}</p>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 inline-block mb-8">
          <QRCode value={generateBillText(completedBillId)} size={200} />
        </div>
        
        <p className="text-sm text-gray-500 mb-8 max-w-sm">
          Scan this QR code to view the receipt text directly on your device.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={() => setCompletedBillId(null)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)]">
      
      {/* Mobile Tabs Wrapper */}
      <div className="flex lg:hidden bg-slate-200/50 p-1 rounded-xl shrink-0">
         <button 
           className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-all ${mobileTab === 'products' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} 
           onClick={() => setMobileTab('products')}
         >
           Products
         </button>
         <button 
           className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-all ${mobileTab === 'cart' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} 
           onClick={() => setMobileTab('cart')}
         >
           Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
         </button>
      </div>

      {/* Left: Product Selection */}
      <div className={`flex-1 flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] lg:min-h-0 ${mobileTab !== 'products' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-none rounded-full bg-slate-100 focus:ring-2 focus:ring-indigo-500 text-sm h-[42px]"
            />
            {filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <ul className="py-1">
                  {filteredItems.map(item => (
                    <li
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.quantity} in stock</p>
                      </div>
                      <span className="font-bold text-indigo-600">{formatCurrency(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Available Inventory</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
             {items.filter(i => i.quantity > 0).map(item => (
               <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between h-28"
               >
                 <div className="font-semibold text-slate-800 text-sm line-clamp-2">{item.name}</div>
                 <div className="flex justify-between items-end mt-2 border-t border-slate-100 pt-2">
                   <div className="text-sm font-bold text-indigo-600">{formatCurrency(item.price)}</div>
                   <div className="text-[10px] text-slate-400 font-bold uppercase">{item.quantity} left</div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className={`w-full lg:w-[400px] flex-1 lg:flex-none flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:min-h-0 ${mobileTab !== 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-indigo-600" />
            Active Order
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <span className="text-sm font-medium">Cart is empty</span>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.itemId} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex justify-between mb-3">
                  <span className="font-semibold text-slate-800 text-sm line-clamp-1">{item.name}</span>
                  <span className="font-bold text-slate-800 text-sm">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.itemId, -1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-xs font-bold w-12 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.itemId)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-white border-t border-slate-200 space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>
          
          <div className="flex justify-between items-end py-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-bold text-indigo-600 tracking-tight">{formatCurrency(total)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            Complete Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
