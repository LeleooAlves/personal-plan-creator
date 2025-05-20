
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, User, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('workouts');

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso.",
    });
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Personal Trainer</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-gray-800"
        >
          <LogOut size={20} />
        </Button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <nav className="bg-black text-white p-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex justify-around">
          <NavLink 
            to="/workouts" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-4 rounded-md ${
                isActive ? 'text-primary' : 'text-white hover:text-primary'
              }`
            }
            onClick={() => setActiveTab('workouts')}
          >
            <ClipboardList size={24} />
            <span className="text-xs mt-1">Treinos</span>
          </NavLink>
          
          <NavLink 
            to="/exercises" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-4 rounded-md ${
                isActive ? 'text-primary' : 'text-white hover:text-primary'
              }`
            }
            onClick={() => setActiveTab('exercises')}
          >
            <Dumbbell size={24} />
            <span className="text-xs mt-1">Exercícios</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-4 rounded-md ${
                isActive ? 'text-primary' : 'text-white hover:text-primary'
              }`
            }
            onClick={() => setActiveTab('profile')}
          >
            <User size={24} />
            <span className="text-xs mt-1">Perfil</span>
          </NavLink>
        </div>
      </nav>
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-black text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Personal Trainer</h1>
          
          <nav className="space-y-2">
            <NavLink 
              to="/workouts" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md ${
                  isActive ? 'bg-primary text-white' : 'text-white hover:bg-gray-800'
                }`
              }
            >
              <ClipboardList size={20} className="mr-3" />
              <span>Treinos</span>
            </NavLink>
            
            <NavLink 
              to="/exercises" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md ${
                  isActive ? 'bg-primary text-white' : 'text-white hover:bg-gray-800'
                }`
              }
            >
              <Dumbbell size={20} className="mr-3" />
              <span>Exercícios</span>
            </NavLink>
            
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-md ${
                  isActive ? 'bg-primary text-white' : 'text-white hover:bg-gray-800'
                }`
              }
            >
              <User size={20} className="mr-3" />
              <span>Perfil</span>
            </NavLink>
          </nav>
        </div>
        
        <div className="absolute bottom-8 w-full px-6">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-white hover:bg-gray-800"
          >
            <LogOut size={20} className="mr-3" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
      
      {/* Padding for desktop layout */}
      <div className="hidden md:block w-64"></div>
    </div>
  );
};

export default MainLayout;
