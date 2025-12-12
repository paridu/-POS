import { Product, Sale, Customer, StockHistory, CartItem } from '../types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'กาแฟเย็น (Iced Coffee)', category: 'เครื่องดื่ม', price: 55, cost: 20, stock: 50, image: 'https://picsum.photos/id/1060/200/200', barcode: '885001' },
  { id: '2', name: 'ชาเขียวมัทฉะ (Matcha)', category: 'เครื่องดื่ม', price: 65, cost: 25, stock: 32, image: 'https://picsum.photos/id/225/200/200', barcode: '885002' },
  { id: '3', name: 'ครัวซองต์เนยสด', category: 'เบเกอรี่', price: 45, cost: 15, stock: 12, image: 'https://picsum.photos/id/1080/200/200', barcode: '885003' },
  { id: '4', name: 'เค้กช็อกโกแลต', category: 'เบเกอรี่', price: 85, cost: 35, stock: 8, image: 'https://picsum.photos/id/292/200/200', barcode: '885004' },
  { id: '5', name: 'น้ำเปล่า', category: 'เครื่องดื่ม', price: 15, cost: 5, stock: 100, image: 'https://picsum.photos/id/326/200/200', barcode: '885005' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'คุณสมชาย ใจดี', phone: '0812345678', points: 150, totalSpent: 1500 },
  { id: 'c2', name: 'คุณมานี มีแชร์', phone: '0898765432', points: 50, totalSpent: 500 },
];

// Helper to load/save from localStorage
const load = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  getProducts: (): Product[] => load('pos_products', INITIAL_PRODUCTS),
  saveProduct: (product: Product) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    save('pos_products', products);
  },
  deleteProduct: (id: string) => {
    const products = db.getProducts().filter(p => p.id !== id);
    save('pos_products', products);
  },

  getCustomers: (): Customer[] => load('pos_customers', INITIAL_CUSTOMERS),
  saveCustomer: (customer: Customer) => {
    const customers = db.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    save('pos_customers', customers);
  },

  getSales: (): Sale[] => load('pos_sales', []),
  
  processSale: (cartItems: CartItem[], paymentMethod: 'cash'|'qrcode'|'credit', customerId?: string): Sale => {
    const products = db.getProducts();
    const sales = db.getSales();
    const history = db.getStockHistory();
    const customers = db.getCustomers();

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newSale: Sale = {
      id: `S${Date.now()}`,
      date: new Date().toISOString(),
      totalAmount,
      discount: 0,
      finalAmount: totalAmount,
      paymentMethod,
      customerId,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))
    };

    // Update Stock
    cartItems.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.id);
      if (productIndex >= 0) {
        products[productIndex].stock -= item.quantity;
        
        // Log History
        history.push({
          id: `H${Date.now()}_${item.id}`,
          productId: item.id,
          type: 'sale',
          quantity: -item.quantity,
          date: new Date().toISOString(),
          note: `Sale #${newSale.id}`
        });
      }
    });

    // Update Customer Points (10 baht = 1 point)
    if (customerId) {
        const custIndex = customers.findIndex(c => c.id === customerId);
        if (custIndex >= 0) {
            customers[custIndex].totalSpent += totalAmount;
            customers[custIndex].points += Math.floor(totalAmount / 10);
            save('pos_customers', customers);
        }
    }

    sales.push(newSale);
    save('pos_products', products);
    save('pos_sales', sales);
    save('pos_history', history);

    return newSale;
  },

  getStockHistory: (): StockHistory[] => load('pos_history', []),

  // For AI Analysis
  getDataForAI: () => {
    return {
      products: db.getProducts(),
      sales: db.getSales(),
      stockHistory: db.getStockHistory()
    };
  }
};
