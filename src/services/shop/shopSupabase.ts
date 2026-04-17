import type { CreateProductInput, DashboardOverview, Product, SaleItem } from '../../types';
import { getSupabaseClient } from '../supabase/client';
import { mapProduct } from './shopMappers';

type ProductRow = {
  id: string;
  owner_id: string;
  shop_id?: string | null;
  reference: string;
  name: string;
  category: string;
  price: number;
  currency_code?: string | null;
  stock: number;
  image?: string | null;
  images?: string[] | null;
  age_range?: string | null;
  gender?: string | null;
  status: Product['status'];
  created_at?: string | null;
  updated_at?: string | null;
};

const nowIso = (): string => new Date().toISOString();
const PRODUCT_SELECT_BASE =
  'id, owner_id, shop_id, reference, name, category, price, stock, image, images, age_range, gender, status, created_at, updated_at';
const PRODUCT_SELECT_WITH_CURRENCY =
  'id, owner_id, shop_id, reference, name, category, price, currency_code, stock, image, images, age_range, gender, status, created_at, updated_at';

const isMissingCurrencyColumnError = (error: { message?: string } | null): boolean =>
  typeof error?.message === 'string' && error.message.toLowerCase().includes('currency_code');

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier du produit.'));
    reader.readAsDataURL(file);
  });

const resolveProductStatus = (stock: number): Product['status'] => {
  if (stock <= 0) {
    return 'out_of_stock';
  }

  if (stock <= 10) {
    return 'low_stock';
  }

  return 'in_stock';
};

const getCurrentUserId = async (): Promise<string> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    throw new Error('Utilisateur Supabase introuvable.');
  }

  return data.user.id;
};

const getCurrentShopId = async (userId: string): Promise<string | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Impossible de charger la boutique Supabase.');
  }

  return (data as { id?: string } | null)?.id ?? null;
};

const buildDashboardFromProducts = (products: Product[]): DashboardOverview => {
  const totalInventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
    const value = products
      .filter((product) => product.createdAt.toDateString() === date.toDateString())
      .reduce((sum, product) => sum + product.price * product.stock, 0);

    return {
      label,
      value,
      date,
    };
  });

  const visitsData = [
    { day: 'Lun', visits: 0 },
    { day: 'Mar', visits: 0 },
    { day: 'Mer', visits: 0 },
    { day: 'Jeu', visits: 0 },
    { day: 'Ven', visits: 0 },
    { day: 'Sam', visits: 0 },
    { day: 'Dim', visits: 0 },
  ];

  return {
    stats: {
      totalRevenue: totalInventoryValue,
      revenueChange: 0,
      dailyRevenue: 0,
      dailyRevenueChange: 0,
      totalSales: products.length,
      salesChange: 0,
      activeUsers: products.length > 0 ? 1 : 0,
      usersChange: 0,
    },
    salesData: lastSevenDays,
    visitsData,
  };
};

export const getSupabaseProducts = async (): Promise<Product[]> => {
  const supabase = getSupabaseClient();
  const userId = await getCurrentUserId();
  const initialResponse = await supabase
    .from('products')
    .select(PRODUCT_SELECT_WITH_CURRENCY)
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  let data = initialResponse.data as ProductRow[] | null;
  let error = initialResponse.error;

  if (error && isMissingCurrencyColumnError(error)) {
    const fallbackResponse = await supabase
      .from('products')
      .select(PRODUCT_SELECT_BASE)
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    data = fallbackResponse.data as ProductRow[] | null;
    error = fallbackResponse.error;
  }

  if (error) {
    throw new Error(error.message || 'Impossible de charger les produits depuis Supabase.');
  }

  return Array.isArray(data)
    ? data.map((row) =>
        mapProduct({
          ...row,
          ageRange: (row as ProductRow).age_range,
          createdAt: (row as ProductRow).created_at,
          updatedAt: (row as ProductRow).updated_at,
        })
      )
    : [];
};

export const createSupabaseProduct = async (input: CreateProductInput): Promise<Product> => {
  const supabase = getSupabaseClient();
  const userId = await getCurrentUserId();
  const shopId = await getCurrentShopId(userId);
  const imageValues = await Promise.all(input.images.map(fileToDataUrl));
  const stock = input.quantity;
  const now = nowIso();
  const payload = {
    owner_id: userId,
    shop_id: shopId,
    reference: `KZ-${Date.now()}`,
    name: input.name,
    category: input.category,
    price: input.price,
    currency_code: input.currencyCode,
    stock,
    image: imageValues[0] ?? null,
    images: imageValues,
    age_range: input.ageRange,
    gender: input.gender,
    status: resolveProductStatus(stock),
    created_at: now,
    updated_at: now,
  };

  const initialResponse = await supabase
    .from('products')
    .insert(payload)
    .select(PRODUCT_SELECT_WITH_CURRENCY)
    .single();

  let data = initialResponse.data as ProductRow | null;
  let error = initialResponse.error;

  if (error && isMissingCurrencyColumnError(error)) {
    const { currency_code: _currencyCode, ...legacyPayload } = payload;
    const fallbackResponse = await supabase
      .from('products')
      .insert(legacyPayload)
      .select(PRODUCT_SELECT_BASE)
      .single();

    data = fallbackResponse.data as ProductRow | null;
    error = fallbackResponse.error;
  }

  if (error || !data) {
    throw new Error(error?.message || 'Impossible d enregistrer le produit dans Supabase.');
  }

  return {
    ...mapProduct({
      ...data,
      ageRange: (data as ProductRow).age_range,
      createdAt: (data as ProductRow).created_at,
      updatedAt: (data as ProductRow).updated_at,
    }),
    currencyCode: (data as ProductRow).currency_code ?? input.currencyCode,
  };
};

export const getSupabaseDashboardOverview = async (): Promise<DashboardOverview> => {
  const products = await getSupabaseProducts();
  return buildDashboardFromProducts(products);
};

export const getSupabaseSales = async (): Promise<SaleItem[]> => [];
