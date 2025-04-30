import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, editProduct } = useProducts();
  
  const [product, setProduct] = useState({
    reference: '',
    name: '',
    category: '',
    size: '',
    color: '',
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    alertThreshold: 5,
    imageUrl: '',
    description: '',
    supplier: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProduct(id);
        
        if (data) {
          // Extract only the editable fields
          const {
            reference,
            name,
            category,
            size,
            color,
            quantity,
            purchasePrice,
            sellingPrice,
            alertThreshold,
            imageUrl,
            description,
            supplier,
            notes
          } = data;
          
          setProduct({
            reference,
            name,
            category,
            size,
            color,
            quantity,
            purchasePrice,
            sellingPrice,
            alertThreshold,
            imageUrl: imageUrl || '',
            description: description || '',
            supplier: supplier || '',
            notes: notes || ''
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, getProduct]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      setProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!product.reference.trim()) newErrors.reference = 'Reference is required';
    if (!product.name.trim()) newErrors.name = 'Product name is required';
    if (!product.category.trim()) newErrors.category = 'Category is required';
    if (!product.size.trim()) newErrors.size = 'Size is required';
    if (!product.color.trim()) newErrors.color = 'Color is required';
    
    // Numeric validation
    if (product.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (product.purchasePrice <= 0) newErrors.purchasePrice = 'Purchase price must be greater than 0';
    if (product.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
    if (product.alertThreshold < 0) newErrors.alertThreshold = 'Alert threshold cannot be negative';
    
    // Business logic validation
    if (product.sellingPrice <= product.purchasePrice) {
      newErrors.sellingPrice = 'Selling price should be greater than purchase price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await editProduct(id, {
        ...product,
        updatedAt: new Date().toISOString()
      });
      
      navigate(`/products/${id}`);
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to update product. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Product</h3>
          <p className="mt-1 text-gray-500">{error}</p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to={`/products/${id}`} 
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800">Basic Information</h2>
              
              <div>
                <label htmlFor="reference" className="form-label">
                  Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={product.reference}
                  onChange={handleChange}
                  className={`form-input ${errors.reference ? 'border-red-500' : ''}`}
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-500">{errors.reference}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="name" className="form-label">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="category" className="form-label">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className={`form-input ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a category</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Sweaters">Sweaters</option>
                  <option value="Accessories">Accessories</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="form-label">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={product.size}
                    onChange={handleChange}
                    className={`form-input ${errors.size ? 'border-red-500' : ''}`}
                  />
                  {errors.size && (
                    <p className="mt-1 text-sm text-red-500">{errors.size}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="color" className="form-label">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={product.color}
                    onChange={handleChange}
                    className={`form-input ${errors.color ? 'border-red-500' : ''}`}
                  />
                  {errors.color && (
                    <p className="mt-1 text-sm text-red-500">{errors.color}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="form-label">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={product.imageUrl}
                  onChange={handleChange}
                  className="form-input"
                />
                {product.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                ></textarea>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-800">Inventory Details</h2>
              
              <div>
                <label htmlFor="quantity" className="form-label">
                  Current Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={product.quantity}
                  onChange={handleChange}
                  min="0"
                  className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  To record stock movements, use the Stock Movements page
                </p>
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="purchasePrice" className="form-label">
                    Purchase Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      value={product.purchasePrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`form-input pl-7 ${errors.purchasePrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="mt-1 text-sm text-red-500">{errors.purchasePrice}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="sellingPrice" className="form-label">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      value={product.sellingPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`form-input pl-7 ${errors.sellingPrice ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-500">{errors.sellingPrice}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="alertThreshold" className="form-label">
                  Alert Threshold <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="alertThreshold"
                  name="alertThreshold"
                  value={product.alertThreshold}
                  onChange={handleChange}
                  min="0"
                  className={`form-input ${errors.alertThreshold ? 'border-red-500' : ''}`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll receive an alert when stock falls below this number
                </p>
                {errors.alertThreshold && (
                  <p className="mt-1 text-sm text-red-500">{errors.alertThreshold}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="supplier" className="form-label">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={product.supplier}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={product.notes}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              to={`/products/${id}`} 
              className="btn btn-outline"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;