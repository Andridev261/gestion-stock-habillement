import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { ChartData } from '../types';

const Reports = () => {
  const { products, stockMovements } = useProducts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'financial'>('inventory');
  
  // Chart data
  const [categoryData, setCategoryData] = useState<ChartData>({ labels: [], values: [] });
  const [valueData, setValueData] = useState<ChartData>({ labels: [], values: [] });
  const [movementData, setMovementData] = useState<ChartData>({ labels: [], values: [] });
  
  useEffect(() => {
    if (products.length > 0) {
      // Generate category distribution data
      const categoryMap = new Map<string, number>();
      
      products.forEach(product => {
        const currentCount = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, currentCount + 1);
      });
      
      setCategoryData({
        labels: Array.from(categoryMap.keys()),
        values: Array.from(categoryMap.values())
      });
      
      // Generate value by category data
      const valueMap = new Map<string, number>();
      
      products.forEach(product => {
        const currentValue = valueMap.get(product.category) || 0;
        valueMap.set(product.category, currentValue + (product.quantity * product.sellingPrice));
      });
      
      setValueData({
        labels: Array.from(valueMap.keys()),
        values: Array.from(valueMap.values())
      });
      
      // Generate movement data (last 7 days)
      const movementMap = new Map<string, { in: number; out: number }>();
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 6);
      
      // Initialize the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(oneWeekAgo.getDate() + i);
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        movementMap.set(dateString, { in: 0, out: 0 });
      }
      
      stockMovements.forEach(movement => {
        const movementDate = new Date(movement.date);
        if (movementDate >= oneWeekAgo && movementDate <= today) {
          const dateString = movementDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const currentData = movementMap.get(dateString) || { in: 0, out: 0 };
          
          if (movement.type === 'in') {
            currentData.in += movement.quantity;
          } else {
            currentData.out += movement.quantity;
          }
          
          movementMap.set(dateString, currentData);
        }
      });
      
      setMovementData({
        labels: Array.from(movementMap.keys()),
        values: Array.from(movementMap.values()).map(v => v.in - v.out)
      });
      
      setLoading(false);
    }
  }, [products, stockMovements]);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Inventory stats
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
  const averagePrice = products.length > 0 
    ? products.reduce((sum, product) => sum + product.sellingPrice, 0) / products.length
    : 0;
  const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.alertThreshold).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  
  // Most valuable products (top 5)
  const topValueProducts = [...products]
    .sort((a, b) => (b.quantity * b.sellingPrice) - (a.quantity * a.sellingPrice))
    .slice(0, 5);
  
  // Low stock products
  const lowStockProducts = products
    .filter(p => p.quantity <= p.alertThreshold)
    .sort((a, b) => (a.quantity / a.alertThreshold) - (b.quantity / b.alertThreshold));
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary-500 mr-2" />
        <span>Loading reports...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
        <button className="btn btn-outline">
          <Download size={16} className="mr-1" />
          Export Report
        </button>
      </div>
      
      {/* Report tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'inventory'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('inventory')}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Inventory Analysis
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'movements'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('movements')}
            >
              <LineChart size={18} className="inline mr-2" />
              Stock Movements
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'financial'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('financial')}
            >
              <PieChart size={18} className="inline mr-2" />
              Financial Analysis
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Inventory Analysis Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Key metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Products"
                  value={totalProducts.toString()}
                  icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
                  type="primary"
                />
                <MetricCard
                  title="Total Items"
                  value={totalItems.toString()}
                  icon={<TrendingUp className="h-6 w-6 text-green-500" />}
                  type="success"
                />
                <MetricCard
                  title="Low Stock Items"
                  value={lowStockCount.toString()}
                  icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  type="warning"
                />
                <MetricCard
                  title="Out of Stock"
                  value={outOfStockCount.toString()}
                  icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                  type="danger"
                />
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Category Distribution</h3>
                  <div className="aspect-w-16 aspect-h-9 h-64">
                    {/* This would be a chart in a real implementation */}
                    <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col justify-center items-center">
                      <PieChart className="h-16 w-16 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">
                        {categoryData.labels.map((label, i) => (
                          <span key={label} className="inline-block mx-1">
                            {label}: {categoryData.values[i]} items
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Inventory by Value</h3>
                  <div className="aspect-w-16 aspect-h-9 h-64">
                    {/* This would be a chart in a real implementation */}
                    <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col justify-center items-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">
                        {valueData.labels.map((label, i) => (
                          <span key={label} className="inline-block mx-1">
                            {label}: {formatCurrency(valueData.values[i])}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Low stock products */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Low Stock Items</h3>
                
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No products are currently at low stock levels
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock Level
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alert Threshold
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {lowStockProducts.map(product => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                to={`/products/${product.id}`}
                                className="text-primary-600 hover:text-primary-900 font-medium"
                              >
                                {product.name}
                              </Link>
                              <div className="text-xs text-gray-500">{product.reference}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.alertThreshold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.quantity <= 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Low Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Stock Movements Tab */}
          {activeTab === 'movements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Stock Movement Trends</h3>
                <div className="aspect-w-16 aspect-h-9 h-64">
                  {/* This would be a chart in a real implementation */}
                  <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col justify-center items-center">
                    <LineChart className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Last 7 days stock movement trends
                    </p>
                    <div className="mt-2">
                      {movementData.labels.map((label, i) => (
                        <span key={label} className="inline-block mx-1">
                          {label}: {movementData.values[i]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent movements table */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Recent Stock Movements</h3>
                  <Link 
                    to="/movements" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockMovements
                        .slice(0, 5)
                        .map(movement => (
                          <tr key={movement.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(movement.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                to={`/products/${movement.productId}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                {movement.productName}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {movement.type === 'in' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Stock In
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Stock Out
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                                {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {movement.reason}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Financial Analysis Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Key financial metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Inventory Value"
                  value={formatCurrency(totalValue)}
                  icon={<DollarSign className="h-6 w-6 text-green-500" />}
                  type="success"
                />
                <MetricCard
                  title="Average Product Price"
                  value={formatCurrency(averagePrice)}
                  icon={<DollarSign className="h-6 w-6 text-blue-500" />}
                  type="primary"
                />
                <MetricCard
                  title="Low Stock Value"
                  value={formatCurrency(
                    lowStockProducts.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0)
                  )}
                  icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  type="warning"
                />
                <MetricCard
                  title="Potential Revenue"
                  value={formatCurrency(totalValue)}
                  icon={<DollarSign className="h-6 w-6 text-purple-500" />}
                  type="info"
                />
              </div>
              
              {/* Most valuable products */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Most Valuable Inventory</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topValueProducts.map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              to={`/products/${product.id}`}
                              className="text-primary-600 hover:text-primary-900 font-medium"
                            >
                              {product.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {product.quantity} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(product.quantity * product.sellingPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Value by category */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Inventory Value by Category</h3>
                <div className="aspect-w-16 aspect-h-9 h-64">
                  {/* This would be a chart in a real implementation */}
                  <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col justify-center items-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Value distribution across product categories
                    </p>
                    <div className="mt-2">
                      {valueData.labels.map((label, i) => (
                        <span key={label} className="inline-block mx-1 my-1">
                          {label}: {formatCurrency(valueData.values[i])}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, type }) => {
  const types = {
    primary: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    danger: 'border-l-red-500',
    info: 'border-l-purple-500'
  };
  
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md border-l-4 ${types[type]}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Reports;