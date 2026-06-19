import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { cn } from "../lib/utils";
import { LayoutDashboard, Package, ShoppingCart, FileText, LogOut, Wifi, WifiOff, Menu, X } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout, online, setOnlineStatus, syncOfflineData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false); // Close sidebar on route change
  }, [location.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncOfflineData();
    };
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus, syncOfflineData]);

  if (!currentUser) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Package },
    { name: "Billing (POS)", path: "/billing", icon: ShoppingCart },
    { name: "Bill History", path: "/bills", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside className={cn(
        "w-64 bg-slate-900 flex flex-col fixed inset-y-0 left-0 z-30 transition-transform text-slate-300 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-white font-semibold text-lg tracking-tight truncate">
              ShopSync
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Enterprise Inventory
          </div>
        </div>
        <div className="flex-1 py-4 flex flex-col">
          <nav className="flex-1 flex flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-6 py-3 flex items-center gap-3 transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-800 text-slate-300"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "opacity-100" : "opacity-80")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto p-6">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">{currentUser.username || currentUser.email}</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrator' : 'Staff'}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <div className="border-t border-slate-700 pt-3 flex flex-col gap-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sync Status</div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", online ? "bg-emerald-500" : "bg-amber-500")}></div>
                  <span className={cn("text-xs font-medium", online ? "text-emerald-400" : "text-amber-400")}>
                    {online ? "Online Mode Active" : "Offline Mode"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen transition-all">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Shop Management System</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">{currentUser.username || currentUser.email}</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                Rank: {currentUser.role}
              </span>
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold uppercase overflow-hidden cursor-pointer hover:border-indigo-200 transition-colors bg-indigo-100 flex-shrink-0">
              {currentUser.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser.username} className="w-full h-full object-cover" />
              ) : (
                (currentUser.username?.[0] || currentUser.email[0])
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Content Details */}
        <div className="flex-1 flex flex-col items-center p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <div className="w-full flex-1">
            {children}
          </div>
          
          <footer className="w-full mt-12 py-6 border-t border-slate-200 flex items-center justify-center">
            <p className="text-xs font-bold text-slate-400 tracking-widest">
              &copy; 2026 SUDEEP KARMAKAR ALL RIGHT RESERVED
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
