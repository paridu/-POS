import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = (role: 'admin' | 'staff') => {
    setLoading(true);
    // Simulate Login Process
    const mockUser: UserProfile = role === 'admin' ? {
      id: 'admin_01',
      name: 'เจ้าของร้าน (Admin)',
      email: 'owner@shop.com',
      imageUrl: 'https://ui-avatars.com/api/?name=Owner&background=ea580c&color=fff',
      role: 'admin'
    } : {
      id: 'staff_01',
      name: 'พนักงานขาย (Staff)',
      email: 'staff@shop.com',
      imageUrl: 'https://ui-avatars.com/api/?name=Staff&background=3b82f6&color=fff',
      role: 'staff'
    };
    
    // Simulate network delay
    setTimeout(() => {
      onLogin(mockUser);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-900 p-8 text-center border-b-4 border-orange-500">
          <h1 className="text-3xl font-bold text-white mb-2">ประจันตคาม <span className="text-orange-500">ขายดี</span></h1>
          <p className="text-gray-400">ระบบจัดการร้านค้า POS</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">เลือกสถานะเข้าใช้งาน</h2>
            <p className="text-gray-500 text-sm mt-1">กรุณาเลือกรูปแบบการเข้าสู่ระบบ</p>
          </div>

          <div className="space-y-3">
            <button 
                onClick={() => handleLogin('admin')}
                disabled={loading}
                className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
                <ShieldCheck className="w-6 h-6 mr-3" />
                <div className="text-left">
                    <div className="text-sm">เข้าสู่ระบบ</div>
                    <div className="text-xs font-normal opacity-90">เจ้าของร้าน (Admin) - จัดการได้ทุกอย่าง</div>
                </div>
            </button>

            <button 
                onClick={() => handleLogin('staff')}
                disabled={loading}
                className="w-full flex items-center justify-center bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-bold py-4 px-4 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
                <User className="w-6 h-6 mr-3 text-blue-600" />
                <div className="text-left">
                    <div className="text-sm">เข้าสู่ระบบ</div>
                    <div className="text-xs font-normal text-gray-500">พนักงาน (Staff) - ขายหน้าร้านเท่านั้น</div>
                </div>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; 2024 ประจันตคามขายดี System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};