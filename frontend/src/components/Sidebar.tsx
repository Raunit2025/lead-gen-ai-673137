import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bookmark, 
  LayoutDashboard, 
  Settings, 
  Zap,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { authService } from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { icon: Search, label: 'Find Leads', path: '/search' },
    { icon: Bookmark, label: 'Saved Leads', path: '/dashboard' },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: clear and navigate anyway if it fails
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-border flex flex-col">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="text-primary-foreground w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">LeadGen AI</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className={clsx(
              "w-4 h-4 opacity-0 transition-all duration-200",
              "group-hover:opacity-100 group-hover:translate-x-1"
            )} />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
