import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { db } from '../services/mockDatabase';
import { Search, Plus, Edit, Trash, User, Phone, Trophy, X, Save } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', phone: '', points: 0
  });

  useEffect(() => {
    setCustomers(db.getCustomers());
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: editingCustomer ? editingCustomer.id : `c${Date.now()}`,
      name: formData.name || '',
      phone: formData.phone || '',
      points: Number(formData.points) || 0,
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0
    };

    db.saveCustomer(newCustomer);
    setCustomers(db.getCustomers());
    closeModal();
  };

  const handleDelete = (id: string) => {
    if(confirm('ยืนยันการลบข้อมูลลูกค้า? ประวัติการซื้อและการสะสมแต้มจะหายไป')) {
      db.deleteCustomer(id);
      setCustomers(db.getCustomers());
    }
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', points: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="mr-3 text-orange-600"/> จัดการสมาชิก (Customers)
        </h2>
        <button onClick={() => openModal()} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 shadow-sm w-full md:w-auto justify-center">
          <Plus size={18} className="mr-2"/> เพิ่มลูกค้าใหม่
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="ค้นหาจากชื่อ หรือ เบอร์โทรศัพท์..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">ลูกค้า</th>
                <th className="p-4 text-sm font-semibold text-gray-600">เบอร์โทรศัพท์</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">แต้มสะสม</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">ยอดซื้อรวม</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 group transition-colors">
                        <td className="p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">
                                    {c.name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{c.name}</span>
                            </div>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-sm">
                            <div className="flex items-center">
                                <Phone size={14} className="mr-2 opacity-50"/>
                                {c.phone}
                            </div>
                        </td>
                        <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Trophy size={12} className="mr-1"/>
                                {c.points}
                            </span>
                        </td>
                        <td className="p-4 text-right font-medium text-gray-700">฿{c.totalSpent.toLocaleString()}</td>
                        <td className="p-4 flex justify-center space-x-2">
                        <button onClick={() => openModal(c)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash size={16}/></button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                            ไม่พบข้อมูลลูกค้า
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                  {editingCustomer ? <Edit size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>}
                  {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        type="text" 
                        placeholder="เช่น คุณสมชาย ใจดี"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        type="tel" 
                        placeholder="08xxxxxxxx"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow font-mono" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <label className="block text-sm font-medium text-yellow-800 mb-1 flex items-center">
                        <Trophy size={16} className="mr-1"/> แต้มสะสม (แก้ไขโดยผู้ดูแล)
                    </label>
                    <input 
                        type="number" 
                        className="w-full border border-yellow-200 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-shadow bg-white" 
                        value={formData.points} 
                        onChange={e => setFormData({...formData, points: Number(e.target.value)})} 
                    />
                    <p className="text-xs text-yellow-600 mt-1">แต้มปกติจะเพิ่มอัตโนมัติจากการซื้อสินค้า (10 บาท = 1 แต้ม)</p>
                </div>
                
                <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">ยกเลิก</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-md transition-colors flex justify-center items-center">
                        <Save size={18} className="mr-2"/> บันทึก
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};