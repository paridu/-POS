import React, { useState, useEffect } from 'react';
import { Sale, Customer } from '../types';
import { db } from '../services/mockDatabase';
import { exportToCSV } from '../services/googleSheetService';
import { Search, FileText, Download, User, ChevronRight, X, Printer } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    // Load sales and sort by newest first
    const loadedSales = db.getSales().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSales(loadedSales);
    setCustomers(db.getCustomers());
  }, []);

  const getCustomerName = (id?: string) => {
    if (!id) return '-';
    const c = customers.find(cust => cust.id === id);
    return c ? c.name : 'Unknown';
  };

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(s.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (sale: Sale) => {
     // Reuse the print logic or create a helper (Simplified here)
     alert("กำลังสั่งพิมพ์ใบเสร็จสำหรับบิล " + sale.id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3 text-orange-600"/> ประวัติการขาย (Transactions)
            </h2>
            <p className="text-sm text-gray-500 mt-1">รายการขายทั้งหมด {sales.length} รายการ</p>
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
            <button 
                onClick={() => exportToCSV(sales)}
                className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 shadow-sm transition-colors"
            >
                <Download size={16} className="mr-2"/> Export CSV
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="ค้นหาเลขที่บิล หรือ ชื่อลูกค้า..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">วันที่ / เวลา</th>
                <th className="p-4 text-sm font-semibold text-gray-600">เลขที่บิล</th>
                <th className="p-4 text-sm font-semibold text-gray-600">ลูกค้า</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">วิธีชำระ</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">ยอดรวม</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">ตัวเลือก</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredSales.length > 0 ? (
                    filteredSales.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 group transition-colors cursor-pointer" onClick={() => setSelectedSale(s)}>
                        <td className="p-4 text-gray-600 text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800">{new Date(s.date).toLocaleDateString('th-TH')}</span>
                                <span className="text-xs text-gray-400">{new Date(s.date).toLocaleTimeString('th-TH')}</span>
                            </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-orange-600 font-medium">{s.id}</td>
                        <td className="p-4 text-sm">
                            {s.customerId ? (
                                <div className="flex items-center text-blue-600">
                                    <User size={14} className="mr-1"/>
                                    {getCustomerName(s.customerId)}
                                </div>
                            ) : (
                                <span className="text-gray-400 text-xs italic">ลูกค้าทั่วไป</span>
                            )}
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs uppercase font-semibold
                                ${s.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 
                                  s.paymentMethod === 'qrcode' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                {s.paymentMethod}
                            </span>
                        </td>
                        <td className="p-4 text-right font-bold text-gray-800">฿{s.finalAmount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                             <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                                 <ChevronRight size={18}/>
                             </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="p-10 text-center text-gray-400">
                            ไม่พบข้อมูลการขาย
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-orange-600 text-white">
              <div>
                  <h3 className="font-bold text-lg flex items-center">รายละเอียดบิล</h3>
                  <p className="text-xs opacity-80 font-mono">{selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-1 hover:bg-orange-700 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
                <div className="flex justify-between items-end mb-4 pb-4 border-b border-dashed border-gray-300">
                    <div>
                        <p className="text-sm text-gray-500">วันที่ทำรายการ</p>
                        <p className="font-medium">{new Date(selectedSale.date).toLocaleString('th-TH')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">พนักงานขาย</p>
                        <p className="font-medium">Admin User</p>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">รายการสินค้า</p>
                    {selectedSale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <div className="flex-1">
                                <span className="text-gray-800">{item.productName}</span>
                                <div className="text-xs text-gray-500">฿{item.price} x {item.quantity}</div>
                            </div>
                            <span className="font-medium text-gray-800">฿{item.subtotal.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">วิธีชำระเงิน</span>
                        <span className="font-medium uppercase">{selectedSale.paymentMethod}</span>
                    </div>
                    {selectedSale.customerId && (
                        <div className="flex justify-between text-sm">
                             <span className="text-gray-600">สมาชิก</span>
                             <span className="font-medium text-blue-600">{getCustomerName(selectedSale.customerId)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                        <span className="font-bold text-lg text-gray-800">ยอดสุทธิ</span>
                        <span className="font-bold text-2xl text-orange-600">฿{selectedSale.finalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex space-x-3">
                 <button 
                    onClick={() => handlePrint(selectedSale)}
                    className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-100 flex justify-center items-center"
                >
                    <Printer size={18} className="mr-2"/> พิมพ์ใบเสร็จ
                </button>
                <button 
                    onClick={() => setSelectedSale(null)}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-md transition-colors"
                >
                    ปิดหน้าต่าง
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};