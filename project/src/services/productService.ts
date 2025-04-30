import { Product, StockMovement } from '../types';

// Simulate a database with localStorage
const PRODUCTS_STORAGE_KEY = 'sera-akanjo-products';
const MOVEMENTS_STORAGE_KEY = 'sera-akanjo-movements';

// Sample initial data
const sampleProducts: Product[] = [
  {
    id: '1',
    reference: 'TS-BLK-001',
    name: 'Premium T-Shirt',
    category: 'T-Shirts',
    size: 'M',
    color: 'Black',
    quantity: 25,
    purchasePrice: 12.99,
    sellingPrice: 24.99,
    alertThreshold: 5,
    lastEntry: '2025-05-15T10:30:00Z',
    lastExit: '2025-05-20T14:45:00Z',
    imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Premium quality cotton t-shirt in classic black',
    supplier: 'FashionWholesale Inc.',
    notes: 'Best seller in spring collection',
    createdAt: '2025-04-10T08:00:00Z',
    updatedAt: '2025-05-20T14:45:00Z'
  },
  {
    id: '2',
    reference: 'JN-BLU-002',
    name: 'Slim Fit Jeans',
    category: 'Pants',
    size: '32',
    color: 'Blue',
    quantity: 15,
    purchasePrice: 24.99,
    sellingPrice: 49.99,
    alertThreshold: 3,
    lastEntry: '2025-05-10T09:15:00Z',
    lastExit: '2025-05-19T16:30:00Z',
    imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Classic slim fit jeans with stretch fabric',
    supplier: 'DenimMakers Co.',
    createdAt: '2025-04-12T10:30:00Z',
    updatedAt: '2025-05-19T16:30:00Z'
  },
  {
    id: '3',
    reference: 'DR-RED-003',
    name: 'Summer Dress',
    category: 'Dresses',
    size: 'S',
    color: 'Red',
    quantity: 8,
    purchasePrice: 29.99,
    sellingPrice: 59.99,
    alertThreshold: 3,
    lastEntry: '2025-05-12T11:20:00Z',
    lastExit: '2025-05-21T13:10:00Z',
    imageUrl: 'https://images.pexels.com/photos/6069563/pexels-photo-6069563.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Light summer dress perfect for casual outings',
    supplier: 'StyleTrends Ltd.',
    notes: 'Popular among younger customers',
    createdAt: '2025-04-15T09:45:00Z',
    updatedAt: '2025-05-21T13:10:00Z'
  },
  {
    id: '4',
    reference: 'JK-BRN-004',
    name: 'Leather Jacket',
    category: 'Outerwear',
    size: 'L',
    color: 'Brown',
    quantity: 5,
    purchasePrice: 89.99,
    sellingPrice: 179.99,
    alertThreshold: 2,
    lastEntry: '2025-05-08T14:00:00Z',
    lastExit: '2025-05-18T15:25:00Z',
    imageUrl: 'https://images.pexels.com/photos/7679742/pexels-photo-7679742.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Premium leather jacket with comfortable lining',
    supplier: 'LeatherCraft Inc.',
    createdAt: '2025-04-18T11:15:00Z',
    updatedAt: '2025-05-18T15:25:00Z'
  },
  {
    id: '5',
    reference: 'SW-GRY-005',
    name: 'Wool Sweater',
    category: 'Sweaters',
    size: 'XL',
    color: 'Gray',
    quantity: 12,
    purchasePrice: 34.99,
    sellingPrice: 69.99,
    alertThreshold: 4,
    lastEntry: '2025-05-05T10:45:00Z',
    lastExit: '2025-05-17T11:50:00Z',
    imageUrl: 'https://images.pexels.com/photos/6310924/pexels-photo-6310924.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Warm wool sweater, perfect for cold weather',
    supplier: 'WinterWear Co.',
    createdAt: '2025-04-20T13:30:00Z',
    updatedAt: '2025-05-17T11:50:00Z'
  }
];

const sampleMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Premium T-Shirt',
    type: 'in',
    quantity: 10,
    date: '2025-05-15T10:30:00Z',
    reason: 'Restock',
    reference: 'PO-2025-001',
    performedBy: 'Admin'
  },
  {
    id: '2',
    productId: '1',
    productName: 'Premium T-Shirt',
    type: 'out',
    quantity: 2,
    date: '2025-05-20T14:45:00Z',
    reason: 'Sale',
    reference: 'SO-2025-023',
    performedBy: 'Admin'
  },
  {
    id: '3',
    productId: '2',
    productName: 'Slim Fit Jeans',
    type: 'in',
    quantity: 5,
    date: '2025-05-10T09:15:00Z',
    reason: 'Initial stock',
    reference: 'PO-2025-002',
    performedBy: 'Admin'
  },
  {
    id: '4',
    productId: '3',
    productName: 'Summer Dress',
    type: 'in',
    quantity: 8,
    date: '2025-05-12T11:20:00Z',
    reason: 'New inventory',
    reference: 'PO-2025-003',
    performedBy: 'Admin'
  },
  {
    id: '5',
    productId: '3',
    productName: 'Summer Dress',
    type: 'out',
    quantity: 2,
    date: '2025-05-21T13:10:00Z',
    reason: 'Sale',
    reference: 'SO-2025-024',
    performedBy: 'Admin'
  }
];

// Initialize storage with sample data if empty
const initStorage = () => {
  if (!localStorage.getItem(PRODUCTS_STORAGE_KEY)) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(sampleProducts));
  }
  
  if (!localStorage.getItem(MOVEMENTS_STORAGE_KEY)) {
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(sampleMovements));
  }
};

// Initialize on import
initStorage();

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Product CRUD operations
export const getProducts = async (): Promise<Product[]> => {
  await delay(500); // Simulate network delay
  const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getProductById = async (id: string): Promise<Product> => {
  await delay(300);
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  return product;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  await delay(500);
  const products = await getProducts();
  
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(
    PRODUCTS_STORAGE_KEY,
    JSON.stringify([...products, newProduct])
  );
  
  return newProduct;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, 'id'>>
): Promise<Product> => {
  await delay(500);
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  const updatedProduct: Product = {
    ...products[index],
    ...productData,
    updatedAt: new Date().toISOString()
  };
  
  products[index] = updatedProduct;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await delay(500);
  const products = await getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filteredProducts));
};

// Stock movement operations
export const getStockMovements = async (): Promise<StockMovement[]> => {
  await delay(500);
  const data = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addStockMovement = async (
  movement: Omit<StockMovement, 'id'>
): Promise<StockMovement> => {
  await delay(500);
  const movements = await getStockMovements();
  
  const newMovement: StockMovement = {
    ...movement,
    id: Date.now().toString()
  };
  
  localStorage.setItem(
    MOVEMENTS_STORAGE_KEY,
    JSON.stringify([...movements, newMovement])
  );
  
  return newMovement;
};

// Statistics and reporting
export const getProductStatistics = async () => {
  const products = await getProducts();
  const movements = await getStockMovements();
  
  return {
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + (product.quantity * product.sellingPrice), 0),
    lowStockCount: products.filter(p => p.quantity <= p.alertThreshold).length,
    outOfStockCount: products.filter(p => p.quantity === 0).length,
    recentMovements: movements.filter(m => {
      const movementDate = new Date(m.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return movementDate >= oneWeekAgo;
    }).length
  };
};