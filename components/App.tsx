import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { AIAnalyst } from './components/AIAnalyst';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { Customers } from './components/Customers';
import { Transactions } from './components/Transactions';
import { ViewState, UserProfile } from './types';
import { LayoutDashboard, ShoppingCart, Package, Users, BrainCircuit, Menu, X, Settings as SettingsIcon, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Default to POS for everyone initially
  const [view, setView] = useState<ViewState>('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    localStorage.setItem('pos_user', JSON.stringify(userProfile));
    setUser(userProfile);
    // Force view to POS on login just in case
    setView('pos');
  };

  const handleLogout = () => {
    localStorage.removeItem('pos_user');
    setUser(null);
    setView('pos');
  };

  const renderView = () => {
    // Security Check: If user is staff, force POS view only
    if (user?.role === 'staff' && view !== 'pos') {
        return <POS />;
    }

    switch (view) {
      case 'pos': return <POS />;
      
      // Admin Only Routes
      case 'dashboard': return user?.role === 'admin' ? <Dashboard /> : <POS />;
      case 'inventory': return user?.role === 'admin' ? <Inventory /> : <POS />;
      case 'customers': return user?.role === 'admin' ? <Customers /> : <POS />;
      case 'transactions': return user?.role === 'admin' ? <Transactions /> : <POS />;
      case 'analysis': return user?.role === 'admin' ? <AIAnalyst /> : <POS />;
      case 'settings': return user?.role === 'admin' ? <Settings user={user!} onLogout={handleLogout} /> : <POS />;
      
      default: return <POS />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => { setView(id); setIsSidebarOpen(false); }}
      className={`flex items-center w-full px-6 py-4 text-left transition-colors ${
        view === id 
          ? 'bg-orange-600 text-white border-r-4 border-orange-800' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} className="mr-3 shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-0 z-50 pointer-events-none">
          <button 
            className="pointer-events-auto absolute top-2.5 right-3 p-2 bg-gray-800/90 text-white rounded-md shadow-lg backdrop-blur"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-gray-900">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            ประจันตคาม <span className="text-orange-500 ml-1">ขายดี</span>
          </h1>
        </div>
        
        <div className="flex flex-col h-[calc(100%-5rem)] justify-between">
            <nav className="mt-6 flex-1 overflow-y-auto">
              {/* POS is available for everyone */}
              <NavItem id="pos" label="ขายสินค้า" icon={ShoppingCart} />
              
              {/* Admin Only Menus */}
              {user.role === 'admin' && (
                <>
                  <NavItem id="dashboard" label="ภาพรวม" icon={LayoutDashboard} />
                  <NavItem id="inventory" label="คลังสินค้า" icon={Package} />
                  <NavItem id="customers" label="ลูกค้า" icon={Users} />
                  <NavItem id="transactions" label="ประวัติการขาย" icon={FileText} />
                  
                  <div className="my-4 border-t border-gray-800 mx-4"></div>
                  
                  <NavItem id="analysis" label="AI Analyst" icon={BrainCircuit} />
                </>
              )}
            </nav>

            <div className="p-4 border-t border-gray-800 bg-gray-800/50">
               {user.role === 'admin' ? (
                   <button 
                     onClick={() => { setView('settings'); setIsSidebarOpen(false); }}
                     className={`flex items-center w-full p-2 rounded-lg transition-colors ${view === 'settings' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}
                   >
                       <img src={user.imageUrl} className="w-8 h-8 rounded-full mr-3 border border-gray-600" alt="User" />
                       <div className="text-left flex-1 min-w-0">
                           <p className="text-sm font-medium truncate">{user.name}</p>
                           <div className="text-xs text-gray-400 flex items-center"><SettingsIcon size={10} className="mr-1"/> ตั้งค่า</div>
                       </div>
                   </button>
               ) : (
                   <div className="flex items-center w-full p-2">
                       <img src={user.imageUrl} className="w-8 h-8 rounded-full mr-3 border border-gray-600" alt="User" />
                       <div className="text-left flex-1 min-w-0">
                           <p className="text-sm font-medium truncate">{user.name}</p>
                           <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center mt-0.5">ออกจากระบบ</button>
                       </div>
                   </div>
               )}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        <main className="flex-1 overflow-auto bg-gray-100">
          {renderView()}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;