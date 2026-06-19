import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, InventoryItem, Transaction, Bill, DataState } from "./types";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

interface AppState extends DataState {
  currentUser: User | null;
  online: boolean;
  login: (email: string, passwordHash: string) => User | null;
  logout: () => void;
  register: (email: string, passwordHash: string, username: string) => void;
  registerInitialAdmin: (email: string, passwordHash: string, username: string) => void;
  updateUserProfile: (username: string, profileImage?: string) => void;
  updateShopName: (name: string) => void;
  resetPassword: (email: string, newPasswordHash: string) => boolean;
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, quantityChange: number, type: Transaction["type"], note?: string, billId?: string) => void;
  createBill: (bill: Omit<Bill, "id" | "timestamp" | "status">) => string;
  completeBill: (id: string) => void;
  cancelBill: (id: string) => void;
  setOnlineStatus: (status: boolean) => void;
  syncOfflineData: () => void;
}

const initialState: DataState = {
  users: [],
  items: [],
  transactions: [],
  bills: [],
  lastSynced: Date.now(),
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentUser: null,
      online: navigator.onLine,

      login: (email, passwordHash) => {
        const user = get().users.find((u) => u.email === email && u.passwordHash === passwordHash);
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      register: (email, passwordHash, username) => {
        const users = get().users;
        const role: User["role"] = users.length === 0 ? "admin" : "admin"; 
        const newUser: User = { id: uuidv4(), email, username, passwordHash, role };
        set({ users: [...users, newUser], currentUser: newUser });
      },

      registerInitialAdmin: (email, passwordHash, username) => {
        const users = get().users;
        if (users.length === 0) {
          const newUser: User = { id: uuidv4(), email, username, passwordHash, role: "admin" };
          set({ users: [newUser], currentUser: newUser });
        }
      },

      updateUserProfile: (username, profileImage) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, username, profileImage: profileImage || currentUser.profileImage };
        set((state) => ({
          currentUser: updatedUser,
          users: state.users.map((u) => u.id === currentUser.id ? updatedUser : u)
        }));
      },

      updateShopName: (name) => {
        set({ shopName: name });
      },

      resetPassword: (email, newPasswordHash) => {
        const users = get().users;
        const userExists = users.some(u => u.email === email);
        if (userExists) {
          set({ users: users.map(u => u.email === email ? { ...u, passwordHash: newPasswordHash } : u) });
          return true;
        }
        return false;
      },

      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: uuidv4(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
        if (item.quantity > 0) {
          get().adjustStock(newItem.id, item.quantity, "restock", "Initial stock");
        }
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      adjustStock: (itemId, quantityChange, type, note, billId) => {
        const transaction: Transaction = {
          id: uuidv4(),
          itemId,
          quantityChange,
          type,
          timestamp: Date.now(),
          note,
          billId,
        };
        set((state) => ({
          transactions: [...state.transactions, transaction],
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantityChange, updatedAt: Date.now() }
              : item
          ),
        }));
      },

      createBill: (billData) => {
        const id = uuidv4();
        const newBill: Bill = {
          ...billData,
          id,
          status: "completed",
          timestamp: Date.now(),
        };
        
        set((state) => ({ bills: [...state.bills, newBill] }));
        
        // Deduct inventory
        newBill.items.forEach((item) => {
          get().adjustStock(item.itemId, -item.quantity, "sale", `Sold in bill ${id}`, id);
        });

        return id;
      },

      completeBill: (id) => {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? { ...bill, status: "completed" } : bill)),
        }));
      },

      cancelBill: (id) => {
        set((state) => ({
          bills: state.bills.map((bill) => (bill.id === id ? { ...bill, status: "cancelled" } : bill)),
        }));
      },

      setOnlineStatus: (status) => set({ online: status }),

      syncOfflineData: () => {
        // In a real app, this would push local data to a remote DB.
        // Here, we just acknowledge the sync and update timestamp.
        console.log("Syncing offline data to server...");
        set({ lastSynced: Date.now() });
      },
    }),
    {
      name: "shop-inventory-storage-v4",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        items: state.items,
        transactions: state.transactions,
        bills: state.bills,
        lastSynced: state.lastSynced,
        shopName: state.shopName,
      }),
    }
  )
);

export const hashPassword = (password: string) => {
  return CryptoJS.SHA256(password).toString();
};
