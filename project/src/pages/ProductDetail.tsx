import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
  Tag,
  Truck
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { Product, StockMovement } from '../types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, stockMovements, removeProduct } = useProducts();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, getProduct]);
  
  // Filter movements for this product
  const productMovements = stockMovements.filter(
    movement => movement.productId === id
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await removeProduct(id);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Product</h3>
          <p className="mt-1 text-gray-500">{error || 'Product not found'}</p>
          <div className="mt-6">
            <Link to="/products" className="btn btn-primary">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/products" 
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Product Details</h1>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            to={`/products/edit/${id}`}
            className="btn btn-outline"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Product details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product image and basic info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Ref: {product.reference}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="text-sm font-medium">{product.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Color</p>
                  <div className="flex items-center">
                    <div 
                      className="h-4 w-4 rounded-full mr-2" 
                      style={{ backgroundColor: product.color.toLowerCase() !== 'white' ? product.color.toLowerCase() : '#E5E7EB', 
                               border: product.color.toLowerCase() === 'white' ? '1px solid #D1D5DB' : 'none' }}
                    ></div>
                    <span className="text-sm font-medium">{product.color}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Supplier</p>
                  <p className="text-sm font-medium">{product.supplier || 'N/A'}</p>
                </div>
              </div>
              
              {product.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              )}
              
              {product.notes && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm mt-1">{product.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Stock and price info + movements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card stat-card-primary">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className="mt-1 text-2xl font-semibold">{product.quantity}</p>
                </div>
                <div className="bg-primary-100 p-2 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-sm font-medium ${
                  product.quantity <= 0 ? 'text-red-600' : 
                  product.quantity <= product.alertThreshold ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {product.quantity <= 0 ? 'Out of Stock' : 
                   product.quantity <= product.alertThreshold ? 'Low Stock' : 
                   'In Stock'}
                </span>
              </div>
            </div>
            
            <div className="stat-card stat-card-secondary">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selling Price</p>
                  <p className="mt-1 text-2xl font-semibold">${product.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="bg-secondary-100 p-2 rounded-lg">
                  <Tag className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Cost: ${product.purchasePrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="stat-card stat-card-warning">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="mt-1 text-2xl font-semibold">
                    ${(product.quantity * product.sellingPrice).toFixed(2)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Profit Margin: {((product.sellingPrice - product.purchasePrice) / product.sellingPrice * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Alert and timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-md font-medium">Stock Alert Settings</h3>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Alert when stock falls below: <span className="font-medium">{product.alertThreshold} units</span>
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      product.quantity <= 0 ? 'bg-red-500' : 
                      product.quantity <= product.alertThreshold ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (product.quantity / product.alertThreshold) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-md font-medium">Last Activity</h3>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Last Stock Entry</p>
                  <p className="text-sm font-medium">
                    {product.lastEntry ? new Date(product.lastEntry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Stock Exit</p>
                  <p className="text-sm font-medium">
                    {product.lastExit ? new Date(product.lastExit).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stock movements */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Stock Movement History</h3>
              <Link 
                to="/movements" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All Movements
              </Link>
            </div>
            
            {productMovements.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No recorded stock movements for this product
              </div>
            ) : (
              <div className="space-y-3">
                {productMovements.map((movement) => (
                  <div key={movement.id} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {movement.type === 'in' ? (
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 p-2 rounded-full mr-3">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {movement.type === 'in' ? 'Stock Added' : 'Stock Removed'}
                          </p>
                          <p className="text-sm text-gray-600">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity} units
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(movement.date).toLocaleDateString()} • {movement.reference}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-center space-x-2">
              <Link 
                to="/movements" 
                className="btn btn-outline"
              >
                View All Movements
              </Link>
              <Link 
                to="/stock-movement/add" 
                className="btn btn-primary"
              >
                <TrendingUp size={16} className="mr-1" />
                Record Movement
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-medium">{product.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;