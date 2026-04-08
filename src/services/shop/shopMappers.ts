import type {
  ChartDataPoint,
  DashboardOverview,
  DashboardStats,
  Product,
  ProductStatus,
  SaleItem,
  SaleStatus,
  VisitsData,
} from '../../types';

const createFallbackId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return new Date();
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
};

const normalizeProductStatus = (value: unknown, stock: number): ProductStatus => {
  if (value === 'in_stock' || value === 'out_of_stock' || value === 'low_stock') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();

    if (['in-stock', 'available', 'available_stock'].includes(normalized)) {
      return 'in_stock';
    }

    if (['out-of-stock', 'unavailable', 'sold_out'].includes(normalized)) {
      return 'out_of_stock';
    }

    if (['low-stock', 'low'].includes(normalized)) {
      return 'low_stock';
    }
  }

  if (stock <= 0) {
    return 'out_of_stock';
  }

  if (stock <= 10) {
    return 'low_stock';
  }

  return 'in_stock';
};

const normalizeSaleStatus = (value: unknown): SaleStatus => {
  if (value === 'completed' || value === 'pending' || value === 'cancelled') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();

    if (['complete', 'paid', 'success'].includes(normalized)) {
      return 'completed';
    }

    if (['waiting', 'processing'].includes(normalized)) {
      return 'pending';
    }
  }

  return 'cancelled';
};

export const mapProduct = (input: unknown): Product => {
  const source = (input ?? {}) as Record<string, unknown>;
  const stock = parseNumber(source.stock ?? source.quantity);

  return {
    id: String(source.id ?? createFallbackId('product')),
    reference: String(source.reference ?? source.referenceCode ?? source.ref ?? 'N/A'),
    name: String(source.name ?? source.title ?? 'Produit sans nom'),
    category: String(source.category ?? source.categoryName ?? 'Non classe'),
    price: parseNumber(source.price),
    stock,
    images: Array.isArray(source.images)
      ? source.images.filter((image): image is string => typeof image === 'string')
      : [],
    image: typeof source.image === 'string' ? source.image : typeof source.imageUrl === 'string' ? source.imageUrl : undefined,
    ageRange: typeof source.ageRange === 'string' ? source.ageRange : undefined,
    gender: typeof source.gender === 'string' ? source.gender : undefined,
    status: normalizeProductStatus(source.status, stock),
    createdAt: parseDate(source.createdAt ?? source.created_at),
    updatedAt: parseDate(source.updatedAt ?? source.updated_at),
  };
};

export const mapSaleItem = (input: unknown): SaleItem => {
  const source = (input ?? {}) as Record<string, unknown>;
  const quantity = parseNumber(source.quantity, 1);
  const unitPrice = parseNumber(source.unitPrice ?? source.unit_price);
  const totalPrice = parseNumber(source.totalPrice ?? source.total_price, quantity * unitPrice);

  return {
    id: String(source.id ?? createFallbackId('sale')),
    productName: String(source.productName ?? source.product_name ?? source.product ?? 'Produit'),
    reference: String(source.reference ?? source.referenceCode ?? 'N/A'),
    quantity,
    unitPrice,
    totalPrice,
    customer: String(source.customer ?? source.customerName ?? 'Client'),
    date: parseDate(source.date ?? source.createdAt ?? source.created_at),
    status: normalizeSaleStatus(source.status),
  };
};

const mapDashboardStats = (input: unknown): DashboardStats => {
  const source = (input ?? {}) as Record<string, unknown>;

  return {
    totalRevenue: parseNumber(source.totalRevenue ?? source.total_revenue),
    revenueChange: parseNumber(source.revenueChange ?? source.revenue_change),
    dailyRevenue: parseNumber(source.dailyRevenue ?? source.daily_revenue),
    dailyRevenueChange: parseNumber(source.dailyRevenueChange ?? source.daily_revenue_change),
    totalSales: parseNumber(source.totalSales ?? source.total_sales),
    salesChange: parseNumber(source.salesChange ?? source.sales_change),
    activeUsers: parseNumber(source.activeUsers ?? source.active_users),
    usersChange: parseNumber(source.usersChange ?? source.users_change),
  };
};

const mapChartPoint = (input: unknown): ChartDataPoint => {
  const source = (input ?? {}) as Record<string, unknown>;

  return {
    label: String(source.label ?? source.name ?? source.day ?? source.month ?? ''),
    value: parseNumber(source.value ?? source.amount ?? source.total),
    date: source.date ? parseDate(source.date) : undefined,
  };
};

const mapVisitsPoint = (input: unknown): VisitsData => {
  const source = (input ?? {}) as Record<string, unknown>;

  return {
    day: String(source.day ?? source.label ?? ''),
    visits: parseNumber(source.visits ?? source.value),
  };
};

export const mapDashboardOverview = (input: unknown): DashboardOverview => {
  const source = (input ?? {}) as Record<string, unknown>;
  const salesCandidate = source.salesData ?? source.sales_data;
  const visitsCandidate = source.visitsData ?? source.visits_data;
  const salesSource: unknown[] = Array.isArray(salesCandidate) ? salesCandidate : [];
  const visitsSource: unknown[] = Array.isArray(visitsCandidate) ? visitsCandidate : [];

  return {
    stats: mapDashboardStats(source.stats ?? source),
    salesData: salesSource.map(mapChartPoint),
    visitsData: visitsSource.map(mapVisitsPoint),
  };
};
