import React, { useState, useEffect } from 'react';
import { Product, CartItem, Customer, AppConfig } from '../types';
import { db } from '../services/mockDatabase';
import { syncToGoogleSheets } from '../services/googleSheetService';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, User, Package, ChevronUp, X, ShoppingCart } from 'lucide-react';

export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mobile UI State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [storeName, setStoreName] = useState('ประจันตคามขายดี');

  useEffect(() => {
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());

    const config: AppConfig = JSON.parse(localStorage.getItem('pos_config') || '{}');
    if(config.storeName) setStoreName(config.storeName);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'ทั้งหมด' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > product.stock) {
        alert("สินค้าหมดสต็อก (จำนวนในตะกร้าครบตามจำนวนสินค้าที่มี)");
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock) {
             alert("ไม่สามารถเพิ่มจำนวนได้ (สินค้าหมดสต็อก)");
             return item; 
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    if (cart.length <= 1) setIsMobileCartOpen(false);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (method: 'cash' | 'qrcode' | 'credit') => {
    if (cart.length === 0) return;
    
    if (window.confirm(`ยืนยันการชำระเงิน ${totalAmount} บาท ด้วย ${method}?`)) {
      db.processSale(cart, method, selectedCustomer?.id);
      
      // Auto Sync Logic
      const config: AppConfig = JSON.parse(localStorage.getItem('pos_config') || '{}');
      if(config.autoSync && config.googleSheetUrl) {
        // Sync the sale we just made (get latest from db or pass it)
        const sales = db.getSales(); 
        syncToGoogleSheets(sales.slice(-1), config.googleSheetUrl); // Sync latest only or full sync strategy
      }

      setCart([]);
      setSelectedCustomer(null);
      setProducts(db.getProducts());
      setIsMobileCartOpen(false);
      alert("บันทึกการขายสำเร็จ!");
    }
  };

  const CartContent = () => (
    <>
      {/* Customer Select */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">ลูกค้า</span>
            {selectedCustomer && (
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500">ลบ</button>
            )}
        </div>
        {selectedCustomer ? (
            <div className="bg-blue-50 p-2 rounded flex items-center text-blue-800">
                <User size={16} className="mr-2"/>
                <span className="text-sm">{selectedCustomer.name} (แต้ม: {selectedCustomer.points})</span>
            </div>
        ) : (
            <select 
                className="w-full p-2 border rounded text-sm"
                onChange={(e) => {
                    const cust = customers.find(c => c.id === e.target.value);
                    if(cust) setSelectedCustomer(cust);
                }}
                value=""
            >
                <option value="" disabled>เลือกลูกค้าสมาชิก...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <Package size={48} className="mb-2 opacity-50"/>
            <p>เลือกสินค้าเพื่อเริ่มขาย</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <div className="flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">฿{item.price} x {item.quantity}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center border border-gray-200"><Minus size={12}/></button>
                <span className="text-sm w-4 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center border border-gray-200"><Plus size={12}/></button>
                <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 ml-2"><Trash2 size={16}/></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Checkout */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">ยอดรวมทั้งสิ้น</span>
          <span className="text-2xl font-bold text-blue-600">฿{totalAmount.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handleCheckout('cash')} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-300 rounded hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-colors">
            <Banknote size={20} className="mb-1"/>
            <span className="text-xs">เงินสด</span>
          </button>
          <button onClick={() => handleCheckout('qrcode')} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors">
            <QrCode size={20} className="mb-1"/>
            <span className="text-xs">QR</span>
          </button>
           <button onClick={() => handleCheckout('credit')} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-500 hover:text-purple-600 transition-colors">
            <CreditCard size={20} className="mb-1"/>
            <span className="text-xs">เครดิต</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100 relative">
      
      {/* Top Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center shadow-md z-20 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight truncate max-w-[200px]">{storeName}</h1>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold leading-none">
            {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-gray-300 hidden sm:block">
            {currentTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          {/* Filter */}
          <div className="bg-white p-3 shadow-sm z-10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาสินค้า..."
                className="w-full pl-9 pr-4 py-2 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3 pb-24 md:pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg shadow-sm active:scale-95 transition-transform cursor-pointer overflow-hidden border border-gray-100 flex flex-col group"
                >
                  <div className="aspect-square bg-gray-100 w-full relative">
                     <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                     {product.stock === 0 && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">สินค้าหมด</div>
                     )}
                     <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 rounded">
                        {product.stock}
                     </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-medium text-gray-800 line-clamp-2 text-xs leading-4 mb-1">{product.name}</h3>
                        <div className="font-bold text-blue-600 text-sm">฿{product.price}</div>
                    </div>
                    <button 
                        className="mt-2 w-full bg-blue-100 text-blue-700 text-xs py-1.5 rounded-md font-semibold hover:bg-blue-200 active:bg-blue-300 transition-colors flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                    >
                        <ShoppingCart size={14} className="mr-1" /> Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Cart Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex w-96 bg-white shadow-xl flex-col border-l border-gray-200 h-full z-20">
            <CartContent />
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-30 p-3 pb-safe">
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">{totalItems} รายการ</span>
                <span className="text-xl font-bold text-blue-600">฿{totalAmount.toLocaleString()}</span>
            </div>
            <button 
                onClick={() => setIsMobileCartOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg active:bg-blue-700 flex items-center"
            >
                ตะกร้าสินค้า <ChevronUp size={16} className="ml-2"/>
            </button>
        </div>
      </div>

      {/* Mobile Cart Modal/Drawer */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-2xl h-[85vh] flex flex-col shadow-2xl animate-slide-up">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg flex items-center"><Package size={20} className="mr-2"/> ตะกร้าสินค้า</h3>
                    <button onClick={() => setIsMobileCartOpen(false)} className="p-1 bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <CartContent />
            </div>
        </div>
      )}
    </div>
  );
};