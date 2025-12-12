import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Customer, AppConfig, Sale } from '../types';
import { db } from '../services/mockDatabase';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, User, Package, ChevronUp, X, ShoppingCart, CheckCircle, ArrowRight, Printer } from 'lucide-react';

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

  // Payment & Success Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'cash' | 'qrcode' | 'credit'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());

    const config: AppConfig = JSON.parse(localStorage.getItem('pos_config') || '{}');
    if(config.storeName) setStoreName(config.storeName);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus input when payment modal opens
  useEffect(() => {
    if (isPaymentModalOpen && cashInputRef.current) {
        setTimeout(() => cashInputRef.current?.focus(), 100);
    }
  }, [isPaymentModalOpen]);

  const categories = ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'ทั้งหมด' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleInitiatePayment = (method: 'cash' | 'qrcode' | 'credit') => {
    if (cart.length === 0) return;
    setCurrentPaymentMethod(method);

    if (method === 'cash') {
        setCashReceived('');
        setIsPaymentModalOpen(true);
    } else {
        processSale(method, totalAmount);
    }
  };

  const processSale = (method: 'cash' | 'qrcode' | 'credit', receivedAmount: number) => {
    const sale = db.processSale(cart, method, selectedCustomer?.id);
    
    // Auto-sync logic removed.

    setCompletedSale({
        ...sale,
        discount: receivedAmount - sale.finalAmount
    });

    setCart([]);
    setProducts(db.getProducts());
    setIsPaymentModalOpen(false);
    setIsMobileCartOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleCashConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < totalAmount) {
        alert("ยอดเงินไม่เพียงพอ");
        return;
    }
    processSale('cash', received);
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    setCompletedSale(null);
    setSelectedCustomer(null);
    setCashReceived('');
  };

  const handlePrintReceipt = () => {
    if (!completedSale) return;

    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
            .header { text-align: center; margin-bottom: 10px; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .total { font-weight: bold; font-size: 14px; margin-top: 10px; text-align: right; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>${storeName}</h3>
            <p>วันที่: ${new Date(completedSale.date).toLocaleString('th-TH')}</p>
            <p>เลขที่บิล: ${completedSale.id}</p>
          </div>
          <div class="line"></div>
          ${completedSale.items.map(item => `
            <div class="item">
              <span>${item.productName} x${item.quantity}</span>
              <span>${item.subtotal.toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="item">
            <span>ยอดรวม</span>
            <span class="total">฿${completedSale.finalAmount.toLocaleString()}</span>
          </div>
          ${completedSale.paymentMethod === 'cash' ? `
          <div class="item">
            <span>รับเงิน</span>
            <span>฿${parseFloat(cashReceived || '0').toLocaleString()}</span>
          </div>
          <div class="item">
            <span>เงินทอน</span>
            <span>฿${(parseFloat(cashReceived || '0') - completedSale.finalAmount).toLocaleString()}</span>
          </div>
          ` : ''}
          <div class="footer">
            ขอบคุณที่ใช้บริการ
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  // Mobile-safe padding
  const safeAreaClass = "pb-[env(safe-area-inset-bottom)]";

  const renderCartContent = (isMobile = false) => (
    <div className={`flex flex-col h-full ${isMobile ? safeAreaClass : ''}`}>
      {/* Customer Select */}
      <div className="p-4 border-b bg-white shrink-0">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">ลูกค้า</span>
            {selectedCustomer && (
                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50">ลบ</button>
            )}
        </div>
        {selectedCustomer ? (
            <div className="bg-orange-50 p-3 rounded-lg flex items-center text-orange-900 border border-orange-100">
                <div className="bg-orange-200 p-1.5 rounded-full mr-3">
                   <User size={16} className="text-orange-700"/>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">{selectedCustomer.name}</span>
                    <span className="text-xs text-orange-700">แต้มสะสม: {selectedCustomer.points}</span>
                </div>
            </div>
        ) : (
            <select 
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none"
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package size={32} className="opacity-50"/>
            </div>
            <p className="font-medium">ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-xs mt-1">เลือกสินค้าจากรายการเพื่อเริ่มขาย</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-bold text-gray-800 truncate">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">฿{item.price.toLocaleString()} / ชิ้น</div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg active:bg-gray-200"><Minus size={14}/></button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg active:bg-gray-200"><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Checkout */}
      <div className="p-4 border-t bg-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
        {cart.length > 0 && (
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-gray-600 text-sm font-medium">ยอดรวม ({totalItems} ชิ้น)</span>
            <span className="text-2xl font-bold text-orange-600">฿{totalAmount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            disabled={cart.length === 0}
            onClick={() => handleInitiatePayment('cash')} 
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 h-20"
          >
            <Banknote size={24} className="mb-1 text-green-600"/>
            <span className="text-xs font-bold">เงินสด</span>
          </button>
          <button 
            disabled={cart.length === 0}
            onClick={() => handleInitiatePayment('qrcode')} 
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 h-20"
          >
            <QrCode size={24} className="mb-1 text-blue-600"/>
            <span className="text-xs font-bold">QR Code</span>
          </button>
           <button 
            disabled={cart.length === 0}
            onClick={() => handleInitiatePayment('credit')} 
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 h-20"
          >
            <CreditCard size={24} className="mb-1 text-purple-600"/>
            <span className="text-xs font-bold">บัตรเครดิต</span>
          </button>
        </div>

        {cart.length > 0 && (
          <button 
            onClick={() => {
              if(window.confirm('ยืนยันล้างตะกร้าสินค้าทั้งหมด?')) setCart([]);
            }}
            className="w-full mt-3 flex items-center justify-center py-2 text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
          >
            <Trash2 size={14} className="mr-1"/> ล้างตะกร้าสินค้า
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100 relative">
      
      {/* Top Status Bar */}
      <div className="bg-gray-900 text-white px-4 py-3 md:py-2 flex justify-between items-center shadow-md z-20 shrink-0 border-b border-gray-800">
        <div className="flex flex-col md:block">
          <h1 className="text-lg font-bold tracking-tight truncate max-w-[200px] text-orange-500 leading-tight">{storeName}</h1>
          <div className="text-[10px] text-gray-400 md:hidden">{currentTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold leading-none">
            {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-gray-400 hidden md:block">
            {currentTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-0">
          {/* Filter */}
          <div className="bg-white p-3 shadow-sm z-10 space-y-3 border-b border-orange-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาสินค้า (ชื่อ, บาร์โค้ด)..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 border ${
                    selectedCategory === cat 
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className={`flex-1 overflow-y-auto p-3 bg-gray-50 md:pb-3 ${cart.length > 0 ? 'pb-24' : ''}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer overflow-hidden border border-gray-200 hover:border-orange-400 hover:shadow-md flex flex-col group relative"
                >
                  <div className="aspect-square bg-gray-100 w-full relative overflow-hidden">
                     <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                     {product.stock === 0 && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-[2px]">สินค้าหมด</div>
                     )}
                     <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                        {product.stock}
                     </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight mb-1 h-9">{product.name}</h3>
                        <div className="font-bold text-orange-600 text-base">฿{product.price.toLocaleString()}</div>
                    </div>
                    {/* Add Button - Visible on Mobile and Desktop */}
                    <div className="mt-2 w-full bg-orange-50 text-orange-700 text-xs py-2 rounded-lg font-bold group-hover:bg-orange-500 group-hover:text-white transition-colors flex items-center justify-center">
                        <Plus size={14} className="mr-1" strokeWidth={3}/> เพิ่ม
                    </div>
                  </div>
                </div>
              ))}
            </div>
             {/* Spacer for mobile bottom bar */}
             <div className="h-safe md:hidden"></div>
          </div>
        </div>

        {/* Desktop Cart Sidebar (Hidden on Mobile) */}
        <div className="hidden md:flex w-96 bg-white shadow-xl flex-col border-l border-gray-200 h-full z-20">
            <div className="p-4 bg-gray-900 text-white flex items-center shadow-sm">
                <ShoppingCart size={20} className="mr-2 text-orange-500"/>
                <h2 className="font-bold text-lg">รายการขาย</h2>
            </div>
            {renderCartContent(false)}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {cart.length > 0 && (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.1)] border-t border-gray-200 z-30 p-3 ${safeAreaClass}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">{totalItems} รายการ</span>
                    <span className="text-xl font-bold text-orange-600">฿{totalAmount.toLocaleString()}</span>
                </div>
                <button 
                    onClick={() => setIsMobileCartOpen(true)}
                    className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg active:bg-gray-800 flex items-center justify-center transition-transform active:scale-95"
                >
                    ดูตะกร้า <ChevronUp size={18} className="ml-2"/>
                </button>
            </div>
        </div>
      )}

      {/* Mobile Cart Modal/Drawer */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="flex-1" onClick={() => setIsMobileCartOpen(false)}></div>
            <div className="bg-white rounded-t-2xl h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-lg flex items-center text-gray-800">
                        <ShoppingCart size={20} className="mr-2 text-orange-600"/> ตะกร้าสินค้า
                    </h3>
                    <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"><X size={20} className="text-gray-700"/></button>
                </div>
                {renderCartContent(true)}
            </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Payment Input Modal (For Cash) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">รับเงินสด</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleCashConfirm} className="p-6">
                <div className="text-center mb-6">
                    <p className="text-gray-500 text-sm mb-1">ยอดรวมที่ต้องชำระ</p>
                    <p className="text-4xl font-bold text-orange-600">฿{totalAmount.toLocaleString()}</p>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">รับเงินมา</label>
                    <div className="relative">
                        <input 
                            ref={cashInputRef}
                            type="number" 
                            inputMode="decimal" 
                            className="w-full text-right text-3xl font-bold p-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                            placeholder="0.00"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            min={totalAmount}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">฿</span>
                    </div>
                    {/* Quick Suggestions */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {[100, 500, 1000].map(amt => (
                            <button 
                                key={amt} 
                                type="button"
                                onClick={() => setCashReceived(amt.toString())}
                                className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                                {amt}
                            </button>
                        ))}
                         <button 
                                type="button"
                                onClick={() => setCashReceived(totalAmount.toString())}
                                className="py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-sm font-bold text-orange-700 transition-colors"
                            >
                                พอดี
                            </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center"
                    disabled={!cashReceived || parseFloat(cashReceived) < totalAmount}
                >
                    ยืนยันการชำระเงิน <ArrowRight className="ml-2"/>
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal / Receipt Summary */}
      {isSuccessModalOpen && completedSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up text-center">
                <div className="bg-green-600 p-6 text-white flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-inner">
                        <CheckCircle size={40} className="text-green-600" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold">ชำระเงินสำเร็จ!</h2>
                    <p className="opacity-90 text-sm mt-1">Ref: {completedSale.id}</p>
                </div>
                
                <div className="p-6 space-y-4">
                    {completedSale.paymentMethod === 'cash' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <div className="flex justify-between text-gray-500 mb-1 text-sm">
                                <span>ยอดรวม</span>
                                <span>฿{completedSale.finalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 mb-1 text-sm">
                                <span>รับเงิน</span>
                                <span>฿{parseFloat(cashReceived).toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-800">เงินทอน</span>
                                <span className="text-2xl font-bold text-red-600">
                                    ฿{(parseFloat(cashReceived) - completedSale.finalAmount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {completedSale.paymentMethod !== 'cash' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">ยอดชำระ ({completedSale.paymentMethod.toUpperCase()})</span>
                                <span className="text-xl font-bold text-orange-600">฿{completedSale.finalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={handlePrintReceipt}
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            <Printer size={18} className="mr-2"/> พิมพ์
                        </button>
                        <button 
                            onClick={handleCloseSuccess}
                            className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md active:scale-95"
                        >
                            ขายต่อ
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};