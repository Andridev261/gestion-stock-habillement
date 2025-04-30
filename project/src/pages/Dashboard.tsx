import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar, 
  ShoppingCart, 
  ArrowRight
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { getProductStatistics } from '../services/productService';
import { DashboardStats, Product, StockMovement } from '../types';

const Dashboard = () => {
  const { products, stockMovements, getLowStockProducts } = useProducts();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    recentMovements: 0
  });
  
  useEffect(() => {
    const loadStats = async () => {
      const statistics = await getProductStatistics();
      setStats(statistics);
    };
    
    loadStats();
  }, [products, stockMovements]);
  
  const lowStockItems = getLowStockProducts();
  
  const recentMovements = [...stockMovements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tableau de bord</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Produits"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6 text-blue-500" />}
          change="+3%"
          type="primary"
        />
        
        <StatCard 
          title="Valeur Stock"
          value={`${stats.totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
          change="+5.2%"
          type="secondary"
        />
        
        <StatCard 
          title="Stock Faible"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
          change="-2"
          type="warning"
        />
        
        <StatCard 
          title="Mouvements Récents"
          value={stats.recentMovements}
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          change="+12"
          type="info"
        />
      </div>
      
      {/* Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Alertes Stock Faible</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              Voir Tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun produit en stock faible
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map(product => (
                <LowStockItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Stock Movements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Mouvements Récents</h2>
            <Link to="/movements" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
              Voir Tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {recentMovements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun mouvement de stock récent
            </div>
          ) : (
            <div className="space-y-3">
              {recentMovements.map(movement => (
                <MovementItem key={movement.id} movement={movement} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Actions Rapides</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/products/add" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Ajouter Produit</h3>
              <p className="text-xs text-gray-500">Créer un nouveau produit</p>
            </div>
          </Link>
          
          <Link 
            to="/movements" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Mouvements</h3>
              <p className="text-xs text-gray-500">Gérer les mouvements</p>
            </div>
          </Link>
          
          <Link 
            to="/reports" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Rapports</h3>
              <p className="text-xs text-gray-500">Voir les statistiques</p>
            </div>
          </Link>
          
          <Link 
            to="/orders" 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <ShoppingCart className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Commandes</h3>
              <p className="text-xs text-gray-500">Gérer les commandes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change: string;
  type: 'primary' | 'secondary' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, type }) => {
  const types = {
    primary: 'stat-card-primary',
    secondary: 'stat-card-secondary',
    warning: 'stat-card-warning',
    info: 'border-l-purple-500'
  };
  
  return (
    <div className={`stat-card ${types[type]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${
          change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
        }`}>
          {change}
        </span>
        <span className="text-gray-500 ml-1">depuis la semaine dernière</span>
      </div>
    </div>
  );
};

interface LowStockItemProps {
  product: Product;
}

const LowStockItem: React.FC<LowStockItemProps> = ({ product }) => {
  const percentLeft = (product.quantity / product.alertThreshold) * 100;
  
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-800">{product.name}</h3>
          <p className="text-xs text-gray-500">Réf: {product.reference}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-red-600">
            {product.quantity} / {product.alertThreshold} unités
          </div>
          <Link 
            to={`/products/${product.id}`} 
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Voir Détails
          </Link>
        </div>
      </div>
      
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${
            percentLeft <= 25 ? 'bg-red-500' : percentLeft <= 50 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, percentLeft)}%` }}
        ></div>
      </div>
    </div>
  );
};

interface MovementItemProps {
  movement: StockMovement;
}

const MovementItem: React.FC<MovementItemProps> = ({ movement }) => {
  const date = new Date(movement.date);
  const formattedDate = date.toLocaleDateString('fr-FR', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            movement.type === 'in' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <TrendingUp className={`h-4 w-4 ${
              movement.type === 'in' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-800">{movement.productName}</h3>
            <p className="text-xs text-gray-500">{movement.reason}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            movement.type === 'in' ? 'text-green-600' : 'text-red-600'
          }`}>
            {movement.type === 'in' ? '+' : '-'}{movement.quantity} unités
          </div>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;