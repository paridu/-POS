import React, { useState, useEffect, useRef } from 'react';
import { AppConfig, UserProfile } from '../types';
import { db } from '../services/mockDatabase';
import { Save, LogOut, Database, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [config, setConfig] = useState<AppConfig>({
    storeName: 'ประจันตคามขายดี'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBackup = () => {
    const dataStr = db.backupData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pos_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (db.restoreData(content)) {
            alert("กู้คืนข้อมูลสำเร็จ! ระบบจะรีเฟรช");
            window.location.reload();
        } else {
            alert("เกิดข้อผิดพลาด: ไฟล์ไม่ถูกต้อง");
        }
    };
    reader.readAsText(file);
  };

  const handleClearDb = () => {
      if(confirm('คำเตือน: ข้อมูลยอดขาย สินค้า และลูกค้าทั้งหมดจะถูกลบ! คุณแน่ใจหรือไม่?')) {
          if(confirm('ยืนยันครั้งที่ 2: ข้อมูลจะหายไปถาวร!')) {
              db.clearDatabase();
              alert('ล้างข้อมูลเรียบร้อย');
              window.location.reload();
          }
      }
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
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
           <button 
            onClick={handleSave}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-orange-700 flex justify-center items-center mt-4"
            >
            <Save size={20} className="mr-2"/> บันทึกข้อมูลร้าน
            </button>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-blue-100">
          <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center">
            <Database size={20} className="mr-2 text-blue-600"/> 
            จัดการฐานข้อมูล (Local Database)
          </h3>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
             <p className="font-semibold mb-1">สถานะ: ทำงานแบบ Offline</p>
             ข้อมูลทั้งหมดถูกเก็บอยู่ในอุปกรณ์นี้ แนะนำให้ทำการสำรองข้อมูล (Backup) เป็นประจำเพื่อป้องกันข้อมูลสูญหายกรณีล้างเครื่อง
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button 
                onClick={handleBackup}
                className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
                <Download size={18} className="mr-2"/> สำรองข้อมูล (Backup)
            </button>
            <button 
                onClick={handleRestoreClick}
                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
            >
                <Upload size={18} className="mr-2"/> กู้คืนข้อมูล (Restore)
            </button>
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
            />
          </div>

          <div className="border-t pt-4 mt-2">
               <button 
                onClick={handleClearDb}
                className="w-full flex items-center justify-center text-red-500 hover:text-red-700 px-4 py-2 text-sm transition-colors"
            >
                <Trash2 size={16} className="mr-2"/> ล้างข้อมูลทั้งหมด (Reset Database)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};