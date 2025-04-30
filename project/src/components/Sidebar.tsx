import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart3, 
  TrendingUp,
  Settings,
  X,
  ShoppingCart,
  ShirtIcon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700">
            <div className="flex items-center">
              <ShirtIcon className="h-8 w-8 text-secondary-400" />
              <span className="ml-2 text-lg font-semibold">SERA AKANJO</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
            <NavItem to="/products" icon={<ShoppingBag size={20} />} label="Produits" />
            <NavItem to="/movements" icon={<TrendingUp size={20} />} label="Mouvements de stock" />
            <NavItem to="/reports" icon={<BarChart3 size={20} />} label="Rapports & Analyses" />
            <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Commandes" />
            <NavItem to="/settings" icon={<Settings size={20} />} label="Paramètres" />
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-primary-700">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium">SA</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Gestion de Stock</p>
                <p className="text-xs text-primary-300">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-primary-700 text-white'
            : 'text-primary-100 hover:bg-primary-700 hover:text-white'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

export default Sidebar;