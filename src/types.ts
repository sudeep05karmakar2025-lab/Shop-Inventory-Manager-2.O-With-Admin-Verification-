export type Role = "admin" | "staff";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  profileImage?: string;
  role: Role;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  costPrice: number;
  lowStockThreshold: number;
  createdAt: number;
  updatedAt: number;
}

export type TransactionType = "restock" | "sale" | "adjustment";

export interface Transaction {
  id: string;
  itemId: string;
  quantityChange: number;
  type: TransactionType;
  timestamp: number;
  note?: string;
  billId?: string;
}

export interface BillItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number; // Price at the time of sale
  costPrice: number; // Cost price at the time of sale
}

export interface Bill {
  id: string;
  items: BillItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  customerName?: string;
  customerPhone?: string;
  timestamp: number;
  createdBy: string; // user id
}

export interface DataState {
  users: User[];
  items: InventoryItem[];
  transactions: Transaction[];
  bills: Bill[];
  shopName?: string;
  lastSynced: number;
}
