import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, StockMovement, ProductFilters } from '../types';
import { 
  getProducts as fetchProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getStockMovements,
  addStockMovement
} from '../services/productService';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  filteredProducts: Product[];
  stockMovements: StockMovement[];
  filters: ProductFilters;
  getProducts: () => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  editProduct: (id: string, product: Omit<Product, 'id'>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  getMovements: () => Promise<void>;
  addMovement: (movement: Omit<StockMovement, 'id'>) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  getLowStockProducts: () => Product[];
  getTotalInventoryValue: () => number;
}

const defaultFilters: ProductFilters = {
  search: '',
  category: '',
  minPrice: 0,
  maxPrice: Infinity,
  inStock: true,
  lowStock: false,
  sortBy: 'name',
  sortDirection: 'asc'
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProductFilters>(defaultFilters);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Load initial data
  useEffect(() => {
    getProducts();
    getMovements();
  }, []);

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.reference.toLowerCase().includes(searchLower) ||
          product.color.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply price range filter
    filtered = filtered.filter(
      product => 
        product.sellingPrice >= filters.minPrice && 
        product.sellingPrice <= filters.maxPrice
    );
    
    // Apply stock filters
    if (filters.inStock) {
      filtered = filtered.filter(product => product.quantity > 0);
    }
    
    if (filters.lowStock) {
      filtered = filtered.filter(product => product.quantity <= product.alertThreshold);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'price':
          compareValue = a.sellingPrice - b.sellingPrice;
          break;
        case 'quantity':
          compareValue = a.quantity - b.quantity;
          break;
        default:
          compareValue = 0;
      }
      
      return filters.sortDirection === 'asc' ? compareValue : -compareValue;
    });
    
    setFilteredProducts(filtered);
  };

  const getProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      return await getProductById(id);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const newProduct = await createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editProduct = async (id: string, product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const updatedProduct = await updateProduct(id, product);
      setProducts(prev => 
        prev.map(p => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeProduct = async (id: string): Promise<void> => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getMovements = async (): Promise<void> => {
    try {
      const movements = await getStockMovements();
      setStockMovements(movements);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addMovement = async (movement: Omit<StockMovement, 'id'>): Promise<void> => {
    try {
      const newMovement = await addStockMovement(movement);
      setStockMovements(prev => [...prev, newMovement]);
      
      // Update product quantity
      const productId = movement.productId;
      const quantityChange = movement.type === 'in' ? movement.quantity : -movement.quantity;
      
      setProducts(prev => 
        prev.map(p => {
          if (p.id === productId) {
            const newQuantity = p.quantity + quantityChange;
            const lastEntry = movement.type === 'in' ? new Date().toISOString() : p.lastEntry;
            const lastExit = movement.type === 'out' ? new Date().toISOString() : p.lastExit;
            
            return {
              ...p,
              quantity: newQuantity,
              lastEntry,
              lastExit
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const setFilters = (newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState(defaultFilters);
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter(product => product.quantity <= product.alertThreshold);
  };

  const getTotalInventoryValue = (): number => {
    return products.reduce((total, product) => total + (product.sellingPrice * product.quantity), 0);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        filteredProducts,
        stockMovements,
        filters,
        getProducts,
        getProduct,
        addProduct,
        editProduct,
        removeProduct,
        getMovements,
        addMovement,
        setFilters,
        clearFilters,
        getLowStockProducts,
        getTotalInventoryValue
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};