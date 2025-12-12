import React, { useState, useEffect } from 'react';
import { AppConfig, UserProfile } from '../types';
import { Save, LogOut, FileSpreadsheet, Link } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [config, setConfig] = useState<AppConfig>({
    storeName: 'ประจันตคามขายดี',
    googleSheetUrl: '',
    autoSync: false
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('pos_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('pos_config', JSON.stringify(config));
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ตั้งค่าระบบ (Settings)</h2>

      <div className="grid gap-6 max-w-2xl mx-auto">
        {/* User Profile */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={user.imageUrl} alt={user.name} className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center"
          >
            <LogOut size={18} className="mr-2"/> ออกจากระบบ
          </button>
        </div>

        {/* General Config */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">ข้อมูลร้านค้า</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า</label>
            <input 
              type="text" 
              value={config.storeName}
              onChange={(e) => setConfig({...config, storeName: e.target.value})}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Google Sheet Integration */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center">
            <FileSpreadsheet size={20} className="mr-2 text-green-600"/> 
            เชื่อมต่อ Google Sheets
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
             <p className="font-semibold mb-1">วิธีเชื่อมต่อ:</p>
             1. สร้าง Google Sheet สำหรับรับข้อมูล<br/>
             2. สร้าง Apps Script (Extensions > Apps Script) เพื่อรับ POST request<br/>
             3. Deploy เป็น Web App และนำ URL มาวางช่องด้านล่าง
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Link size={14} className="mr-1"/> Google Script Web App URL
            </label>
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/..."
              value={config.googleSheetUrl}
              onChange={(e) => setConfig({...config, googleSheetUrl: e.target.value})}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center">
            <input 
              id="autosync"
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({...config, autoSync: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="autosync" className="ml-2 block text-sm text-gray-900">
              ซิงค์ข้อมูลการขายอัตโนมัติเมื่อปิดการขาย
            </label>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700 flex justify-center items-center"
        >
          <Save size={20} className="mr-2"/> บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
};