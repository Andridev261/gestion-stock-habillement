export interface Product {
  id: string;
  reference: string;
  name: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  alertThreshold: number;
  lastEntry: string;
  lastExit: string;
  imageUrl?: string;
  description?: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  reference: string;
  performedBy: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  lowStock: boolean;
  sortBy: 'name' | 'price' | 'quantity';
  sortDirection: 'asc' | 'desc';
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  recentMovements: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}