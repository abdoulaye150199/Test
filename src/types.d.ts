
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'staff';
  avatar?: string;
}

export interface Boutique {
  id: string;
  name: string;
  logo?: string;
  owner: User;
  address?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: string;
  price: number;
  currencyCode?: string;
  stock: number;
  image?: string;
  images?: string[];
  ageRange?: string;
  gender?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  dailyRevenue: number;
  dailyRevenueChange: number;
  totalSales: number;
  salesChange: number;
  activeUsers: number;
  usersChange: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface SalesReport {
  period: 'day' | 'week' | 'month' | 'year';
  data: ChartDataPoint[];
}

export interface VisitsData {
  day: string;
  visits: number;
}

export type ProductStatus = 'in_stock' | 'out_of_stock' | 'low_stock';

export type ProductFilter = 'all' | ProductStatus;

export type TimeFilter = 'day' | 'week' | 'month' | 'year';

export type SaleStatus = 'completed' | 'pending' | 'cancelled';

export interface SaleItem {
  id: string;
  productName: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customer: string;
  date: Date;
  status: SaleStatus;
}

export interface DashboardOverview {
  stats: DashboardStats;
  salesData: ChartDataPoint[];
  visitsData: VisitsData[];
}

export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  currencyCode: string;
  quantity: number;
  ageRange: string;
  gender: string;
  images: File[];
}

export interface ProductFormValues {
  name: string;
  category: string;
  price: string;
  currencyCode: string;
  quantity: string;
  ageRange: string;
  gender: string;
  images: File[];
}
