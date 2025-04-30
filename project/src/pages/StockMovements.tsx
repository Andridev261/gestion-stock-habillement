import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { Product, StockMovement } from '../types';

const StockMovements = () => {
  const { stockMovements, products, loading, addMovement } = useProducts();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  });
  
  // New movement form state
  const [newMovement, setNewMovement] = useState<{
    productId: string;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    reference: string;
  }>({
    productId: '',
    type: 'in',
    quantity: 1,
    reason: '',
    reference: ''
  });
  
  // Filter movements based on search and filter criteria
  const filteredMovements = stockMovements
    .filter(movement => {
      // Apply type filter
      if (filter !== 'all' && movement.type !== filter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !movement.reference.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply date filters
      const movementDate = new Date(movement.date);
      if (dateRange.from && new Date(dateRange.from) > movementDate) {
        return false;
      }
      if (dateRange.to && new Date(dateRange.to) < movementDate) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle form submission for new movement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMovement.productId || newMovement.quantity <= 0 || !newMovement.reason) {
      return; // Form validation failed
    }
    
    const selectedProduct = products.find(p => p.id === newMovement.productId);
    
    if (!selectedProduct) {
      return;
    }
    
    // Prevent stock from going negative
    if (newMovement.type === 'out' && selectedProduct.quantity < newMovement.quantity) {
      alert(`Cannot remove more than available stock (${selectedProduct.quantity} units)`);
      return;
    }
    
    try {
      await addMovement({
        productId: newMovement.productId,
        productName: selectedProduct.name,
        type: newMovement.type,
        quantity: newMovement.quantity,
        reason: newMovement.reason,
        reference: newMovement.reference || `MOV-${Date.now()}`,
        date: new Date().toISOString(),
        performedBy: 'Admin'
      });
      
      // Reset form and close modal
      setNewMovement({
        productId: '',
        type: 'in',
        quantity: 1,
        reason: '',
        reference: ''
      });
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add movement:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Stock Movements</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} className="mr-1" />
          Add Movement
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by product name or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'in' | 'out')}
              className="form-input"
            >
              <option value="all">All Movements</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            
            <button
              className="btn btn-outline"
            >
              <Filter size={16} className="mr-1" />
              More Filters
            </button>
          </div>
        </div>
        
        {/* Date filters */}
        <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              id="date-from"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              id="date-to"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-outline"
              onClick={() => setDateRange({ from: '', to: '' })}
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>
      
      {/* Movements List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading movements...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-10">
            <Package className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No movements found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || filter !== 'all' || dateRange.from || dateRange.to
                ? 'Try adjusting your search or filter criteria'
                : 'Add stock movements to track your inventory changes'}
            </p>
            <div className="mt-6">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} className="mr-1" />
                Add Movement
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.date).toLocaleDateString()} 
                      <span className="text-gray-500 ml-1">
                        {new Date(movement.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.type === 'in' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp size={12} className="mr-1" />
                          Stock In
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TrendingDown size={12} className="mr-1" />
                          Stock Out
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/products/${movement.productId}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {movement.productName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Stock Movement</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    id="product"
                    value={newMovement.productId}
                    onChange={(e) => setNewMovement({ ...newMovement, productId: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.reference})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Movement Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="type"
                        value="in"
                        checked={newMovement.type === 'in'}
                        onChange={() => setNewMovement({ ...newMovement, type: 'in' })}
                      />
                      <span className="ml-2">Stock In</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="type"
                        value="out"
                        checked={newMovement.type === 'out'}
                        onChange={() => setNewMovement({ ...newMovement, type: 'out' })}
                      />
                      <span className="ml-2">Stock Out</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={newMovement.quantity}
                    onChange={(e) => setNewMovement({ 
                      ...newMovement, 
                      quantity: parseInt(e.target.value) || 0 
                    })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <select
                    id="reason"
                    value={newMovement.reason}
                    onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select a reason</option>
                    {newMovement.type === 'in' ? (
                      <>
                        <option value="Initial Stock">Initial Stock</option>
                        <option value="Restock">Restock</option>
                        <option value="Return">Return</option>
                        <option value="Inventory Adjustment">Inventory Adjustment</option>
                      </>
                    ) : (
                      <>
                        <option value="Sale">Sale</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Lost">Lost</option>
                        <option value="Sample">Sample</option>
                        <option value="Inventory Adjustment">Inventory Adjustment</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    id="reference"
                    placeholder={newMovement.type === 'in' ? "PO-123" : "SO-123"}
                    value={newMovement.reference}
                    onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovements;