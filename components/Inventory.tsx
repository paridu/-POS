import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../services/mockDatabase';
import { Edit, Trash, Plus, Upload, X } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: '', price: 0, cost: 0, stock: 0, barcode: '', image: 'https://picsum.photos/200'
  });

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name || '',
      category: formData.category || 'ทั่วไป',
      price: Number(formData.price),
      cost: Number(formData.cost),
      stock: Number(formData.stock),
      barcode: formData.barcode || '',
      image: formData.image || 'https://picsum.photos/200',
    };

    db.saveProduct(newProduct);
    setProducts(db.getProducts());
    closeModal();
  };

  const handleDelete = (id: string) => {
    if(confirm('ยืนยันการลบสินค้า?')) {
      db.deleteProduct(id);
      setProducts(db.getProducts());
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: 0, cost: 0, stock: 0, barcode: '', image: 'https://picsum.photos/200' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Simulate Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload to S3. Here we just pretend.
    if (e.target.files && e.target.files[0]) {
        // Just keeping the placeholder or using a fake local URL if we implemented FileReader
        // For this demo, we'll stick to the placeholder URL or specific logic
        alert("Simulating S3 Upload... (Using placeholder for demo)");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">จัดการสินค้า (Inventory)</h2>
        <button onClick={() => openModal()} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700">
          <Plus size={18} className="mr-2"/> เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">รูปภาพ</th>
              <th className="p-4 text-sm font-semibold text-gray-600">ชื่อสินค้า</th>
              <th className="p-4 text-sm font-semibold text-gray-600">หมวดหมู่</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">ราคาขาย</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">ต้นทุน</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">สต็อก</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4"><img src={p.image} className="w-10 h-10 rounded object-cover bg-gray-200" alt=""/></td>
                <td className="p-4 font-medium text-gray-800">{p.name}</td>
                <td className="p-4 text-gray-500">{p.category}</td>
                <td className="p-4 text-right">฿{p.price}</td>
                <td className="p-4 text-right text-gray-400">฿{p.cost}</td>
                <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {p.stock}
                    </span>
                </td>
                <td className="p-4 flex justify-center space-x-2">
                  <button onClick={() => openModal(p)} className="p-2 text-orange-600 hover:bg-orange-50 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <button onClick={closeModal}><X size={20} className="text-gray-500"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                    <input required type="text" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                        <input type="text" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">บาร์โค้ด</label>
                        <input type="text" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย</label>
                        <input required type="number" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ต้นทุน</label>
                        <input required type="number" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก</label>
                        <input required type="number" className="w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
                    <div className="flex items-center space-x-4">
                        <img src={formData.image} className="w-16 h-16 rounded bg-gray-100 object-cover" alt="Preview" />
                        <label className="cursor-pointer bg-gray-100 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center">
                            <Upload size={14} className="mr-2"/> อัปโหลดรูป (S3)
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>
                
                <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">บันทึก</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};