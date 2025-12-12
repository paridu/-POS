import React, { useState } from 'react';
import { analyzeBusinessData } from '../services/geminiService';
import { Bot, Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const AIAnalyst: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'สวัสดีครับ ผมคือผู้ช่วย AI วิเคราะห์ร้านค้าของคุณ วันนี้อยากทราบข้อมูลด้านไหนครับ? (เช่น สินค้าขายดี, แนวโน้มยอดขาย)' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await analyzeBusinessData(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-4">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white flex items-center">
        <Bot size={24} className="mr-3" />
        <div>
            <h2 className="font-bold">AI Business Analyst</h2>
            <p className="text-xs text-orange-100">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center">
              <Loader size={16} className="animate-spin text-orange-600 mr-2" />
              <span className="text-sm text-gray-500">กำลังวิเคราะห์ข้อมูล...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="ถามเกี่ยวกับยอดขาย หรือสต็อก..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};