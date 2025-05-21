import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, User, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('workouts');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso.",
    });
    navigate('/');
  };

  const NavItems = () => (
    <>
      <NavLink 
        to="/workouts" 
        className={({ isActive }) => 
          cn(
            "flex items-center px-4 py-3 rounded-md transition-colors",
            isActive 
              ? "bg-primary text-white" 
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          )
        }
        onClick={() => setActiveTab('workouts')}
      >
        <ClipboardList size={20} className="mr-3" />
        <span>Treinos</span>
      </NavLink>
      
      <NavLink 
        to="/exercises" 
        className={({ isActive }) => 
          cn(
            "flex items-center px-4 py-3 rounded-md transition-colors",
            isActive 
              ? "bg-primary text-white" 
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          )
        }
        onClick={() => setActiveTab('exercises')}
      >
        <Dumbbell size={20} className="mr-3" />
        <span>Exercícios</span>
      </NavLink>
      
      <NavLink 
        to="/profile" 
        className={({ isActive }) => 
          cn(
            "flex items-center px-4 py-3 rounded-md transition-colors",
            isActive 
              ? "bg-primary text-white" 
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          )
        }
        onClick={() => setActiveTab('profile')}
      >
        <User size={20} className="mr-3" />
        <span>Perfil</span>
      </NavLink>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Personal Trainer</h1>
          </div>
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span className="sr-only">Sair</span>
            </Button>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex-1 p-6">
              <nav className="space-y-2">
                <NavItems />
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut size={20} className="mr-3" />
                <span>Sair</span>
              </Button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <div className="flex justify-around items-center h-16">
            <NavLink 
              to="/workouts" 
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center py-2 px-4 h-full",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                )
              }
              onClick={() => setActiveTab('workouts')}
            >
              <ClipboardList size={24} />
              <span className="text-xs mt-1">Treinos</span>
            </NavLink>
            
            <NavLink 
              to="/exercises" 
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center py-2 px-4 h-full",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                )
              }
              onClick={() => setActiveTab('exercises')}
            >
              <Dumbbell size={24} />
              <span className="text-xs mt-1">Exercícios</span>
            </NavLink>
            
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                cn(
                  "flex flex-col items-center justify-center py-2 px-4 h-full",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                )
              }
              onClick={() => setActiveTab('profile')}
            >
              <User size={24} />
              <span className="text-xs mt-1">Perfil</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
};

export default MainLayout;
