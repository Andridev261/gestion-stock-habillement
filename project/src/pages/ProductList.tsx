import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Download,
  ShoppingBag
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { Product, ProductFilters } from '../types';

const ProductList = () => {
  const { 
    filteredProducts, 
    loading, 
    error, 
    filters, 
    setFilters,
    clearFilters,
    getProducts 
  } = useProducts();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Reset selected products when filtered products change
  useEffect(() => {
    setSelectedProducts([]);
  }, [filteredProducts]);
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };
  
  // Handle sort direction toggle
  const handleSort = (sortBy: 'name' | 'price' | 'quantity') => {
    if (filters.sortBy === sortBy) {
      setFilters({ 
        sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
      });
    } else {
      setFilters({ 
        sortBy, 
        sortDirection: 'asc' 
      });
    }
  };
  
  // Handle checkbox selection
  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };
  
  // Generate CSV data for export
  const exportToCSV = () => {
    const productsToExport = filteredProducts.filter(p => 
      selectedProducts.length === 0 || selectedProducts.includes(p.id)
    );
    
    const headers = [
      'Reference',
      'Name',
      'Category',
      'Size',
      'Color',
      'Quantity',
      'Purchase Price',
      'Selling Price',
      'Alert Threshold'
    ].join(',');
    
    const rows = productsToExport.map(p => [
      p.reference,
      `"${p.name}"`,
      `"${p.category}"`,
      p.size,
      p.color,
      p.quantity,
      p.purchasePrice,
      p.sellingPrice,
      p.alertThreshold
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sera-akanjo-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render product list
  const renderProductList = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <RefreshCw className="animate-spin h-8 w-8 text-primary-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button 
            className="mt-2 btn btn-outline"
            onClick={() => getProducts()}
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">
            {filters.search ? 'Try adjusting your search or filter criteria' : 'Add some products to your inventory'}
          </p>
          <div className="mt-6">
            <Link to="/products/add" className="btn btn-primary">
              <Plus size={16} className="mr-1" />
              Add New Product
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="table-container bg-white">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">
                <input 
                  type="checkbox" 
                  checked={selectedProducts.length === filteredProducts.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="w-1/6">Reference</th>
              <th className="w-1/5">
                <button 
                  className="group inline-flex items-center"
                  onClick={() => handleSort('name')}
                >
                  Product Name
                  {filters.sortBy === 'name' ? (
                    filters.sortDirection === 'asc' ? (
                      <ArrowUp size={14} className="ml-1 text-primary-500" />
                    ) : (
                      <ArrowDown size={14} className="ml-1 text-primary-500" />
                    )
                  ) : (
                    <ArrowUp size={14} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              </th>
              <th>Size</th>
              <th>Color</th>
              <th>
                <button 
                  className="group inline-flex items-center"
                  onClick={() => handleSort('quantity')}
                >
                  Stock
                  {filters.sortBy === 'quantity' ? (
                    filters.sortDirection === 'asc' ? (
                      <ArrowUp size={14} className="ml-1 text-primary-500" />
                    ) : (
                      <ArrowDown size={14} className="ml-1 text-primary-500" />
                    )
                  ) : (
                    <ArrowUp size={14} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              </th>
              <th>
                <button 
                  className="group inline-flex items-center"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {filters.sortBy === 'price' ? (
                    filters.sortDirection === 'asc' ? (
                      <ArrowUp size={14} className="ml-1 text-primary-500" />
                    ) : (
                      <ArrowDown size={14} className="ml-1 text-primary-500" />
                    )
                  ) : (
                    <ArrowUp size={14} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              </th>
              <th className="w-1/8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <ProductRow 
                key={product.id} 
                product={product} 
                isSelected={selectedProducts.includes(product.id)}
                onSelect={handleSelectProduct}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <Link to="/products/add" className="btn btn-primary">
          <Plus size={16} className="mr-1" />
          Add Product
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleSearch}
              className="form-input pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-1" />
              Filters
            </button>
            
            <button
              className="btn btn-outline"
              onClick={exportToCSV}
              disabled={loading}
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Sweaters">Sweaters</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="price-range" className="form-label">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    id="min-price"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ 
                      minPrice: e.target.value ? Number(e.target.value) : 0 
                    })}
                    className="form-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    id="max-price"
                    placeholder="Max"
                    value={filters.maxPrice !== Infinity ? filters.maxPrice : ''}
                    onChange={(e) => setFilters({ 
                      maxPrice: e.target.value ? Number(e.target.value) : Infinity 
                    })}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Stock Status</label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="in-stock"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({ inStock: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700">
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="low-stock"
                      checked={filters.lowStock}
                      onChange={(e) => setFilters({ lowStock: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="low-stock" className="ml-2 text-sm text-gray-700">
                      Low Stock Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="btn btn-outline mr-2"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-800">
            {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'} selected
          </span>
          <div className="space-x-2">
            <button className="btn btn-outline">
              <Download size={16} className="mr-1" />
              Export Selected
            </button>
            <button className="btn btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500">
              <Trash2 size={16} className="mr-1" />
              Delete Selected
            </button>
          </div>
        </div>
      )}
      
      {/* Product list */}
      <div className="pb-4">
        {renderProductList()}
      </div>
      
      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredProducts.length}</span> products
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn btn-outline px-3 py-1">Previous</button>
            <button className="btn btn-primary px-3 py-1">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, isSelected, onSelect }) => {
  const stockStatus = () => {
    if (product.quantity <= 0) {
      return <span className="badge bg-red-100 text-red-800">Out of Stock</span>;
    } else if (product.quantity <= product.alertThreshold) {
      return <span className="badge bg-yellow-100 text-yellow-800">Low Stock</span>;
    } else {
      return <span className="badge bg-green-100 text-green-800">In Stock</span>;
    }
  };
  
  return (
    <tr className={isSelected ? 'bg-primary-50' : undefined}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {product.reference}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {product.imageUrl && (
            <div className="flex-shrink-0 h-10 w-10 mr-3">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-10 w-10 rounded-md object-cover"
              />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-xs text-gray-500">{product.category}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {product.size}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div 
            className="h-4 w-4 rounded-full mr-2" 
            style={{ backgroundColor: product.color.toLowerCase() !== 'white' ? product.color.toLowerCase() : '#E5E7EB', 
                    border: product.color.toLowerCase() === 'white' ? '1px solid #D1D5DB' : 'none' }}
          ></div>
          <span className="text-sm text-gray-700">{product.color}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{product.quantity}</span>
          <div className="mt-1">{stockStatus()}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            ${product.sellingPrice.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">
            Cost: ${product.purchasePrice.toFixed(2)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Link
            to={`/products/${product.id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            <Eye size={18} />
          </Link>
          <Link
            to={`/products/edit/${product.id}`}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit size={18} />
          </Link>
          <button
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductList;