import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { db } from '../services/mockDatabase';
import { exportToCSV, syncToGoogleSheets } from '../services/googleSheetService';
import { TrendingUp, Package, DollarSign, AlertTriangle, Download, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const sales = db.getSales();
  const products = db.getProducts();

  // Load config for sheet url
  const config = JSON.parse(localStorage.getItem('pos_config') || '{}');

  // Calculate stats
  const totalRevenue = sales.reduce((sum, s) => sum + s.finalAmount, 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const totalSalesCount = sales.length;

  // Prepare chart data (Last 7 days or simply by grouping dummy dates if mocking)
  const salesByDate = useMemo(() => {
    const grouped: Record<string, number> = {};
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
      grouped[date] = (grouped[date] || 0) + sale.finalAmount;
    });
    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  }, [sales]);

  const handleSync = async () => {
    if(!config.googleSheetUrl) return alert("กรุณาตั้งค่า Google Sheet URL ที่หน้าตั้งค่า");
    const result = await syncToGoogleSheets(sales, config.googleSheetUrl);
    alert(result.message);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-full pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">แดชบอร์ดภาพรวม</h2>
        
        <div className="flex space-x-2">
            <button 
                onClick={handleSync}
                className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 shadow-sm"
            >
                <RefreshCw size={16} className="mr-2"/> Sync Sheet
            </button>
            <button 
                onClick={() => exportToCSV(sales)}
                className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 shadow-sm"
            >
                <Download size={16} className="mr-2"/> Export CSV
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">ยอดขายรวม</p>
            <p className="text-2xl font-bold text-gray-800">฿{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">จำนวนบิลขาย</p>
            <p className="text-2xl font-bold text-gray-800">{totalSalesCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-red-100 rounded-full text-red-600 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">สินค้าใกล้หมด</p>
            <p className="text-2xl font-bold text-red-600">{lowStockCount} รายการ</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" /> แนวโน้มยอดขาย
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `฿${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">สินค้าขายดี (Top 5)</h3>
          <div className="flex flex-col space-y-3">
             {products.sort((a,b) => b.stock - a.stock).slice(0,5).map((p, idx) => (
               <div key={p.id} className="flex justify-between items-center border-b pb-2">
                 <div className="flex items-center">
                   <span className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center mr-3">{idx + 1}</span>
                   <span className="text-gray-700">{p.name}</span>
                 </div>
                 <span className="font-mono text-gray-500">Stock: {p.stock}</span>
               </div>
             ))}
             <p className="text-xs text-gray-400 text-center mt-2">* แสดงตามจำนวนสต็อกคงเหลือในตัวอย่าง</p>
          </div>
        </div>
      </div>
    </div>
  );
};
