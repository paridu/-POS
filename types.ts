// Data Models matching the requested schema structure

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  barcode: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'qrcode' | 'credit';
  customerId?: string; // Optional link to customer
  items: SaleItem[];
}

export interface StockHistory {
  id: string;
  productId: string;
  type: 'sale' | 'import' | 'adjustment';
  quantity: number;
  date: string;
  note?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export interface AppConfig {
  storeName: string;
  // Removed Google Sheet specific configs
}

export type ViewState = 'dashboard' | 'pos' | 'inventory' | 'customers' | 'transactions' | 'analysis' | 'settings';