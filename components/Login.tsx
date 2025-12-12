import React from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Simulate Google Login Process
    const mockUser: UserProfile = {
      id: 'google_123',
      name: 'Admin User',
      email: 'admin@prachantakham.com',
      imageUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
    };
    
    // Simulate network delay
    setTimeout(() => {
      onLogin(mockUser);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">ประจันตคามขายดี</h1>
          <p className="text-blue-100">ระบบจัดการร้านค้าอัจฉริยะ</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">เข้าสู่ระบบ</h2>
            <p className="text-gray-500 text-sm mt-1">กรุณาล็อกอินด้วยบัญชี Google เพื่อใช้งาน</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm group"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-6 h-6 mr-3"
            />
            <span>Sign in with Google</span>
          </button>

          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; 2024 ประจันตคามขายดี System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};