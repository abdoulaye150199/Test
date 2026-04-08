import type { CreateProductInput, DashboardOverview, Product, SaleItem } from '../../types';
import {
  loadStoredAppState,
  saveStoredAppState,
  type StoredAppState,
  type StoredProduct,
} from '../../../shared/session/appStateStorage';
import { mapDashboardOverview, mapProduct, mapSaleItem } from './shopMappers';

const getLocalData = (): StoredAppState => loadStoredAppState();

const resolveProductStatus = (stock: number): StoredProduct['status'] => {
  if (stock <= 0) {
    return 'out_of_stock';
  }

  if (stock <= 10) {
    return 'low_stock';
  }

  return 'in_stock';
};

const fileToDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier du produit.'));
    reader.readAsDataURL(file);
  });

const buildStoredProduct = async (input: CreateProductInput): Promise<StoredProduct> => {
  const now = new Date().toISOString();
  const productId = `local-product-${Date.now()}`;
  const serializedImages = await Promise.all(input.images.map(fileToDataUrl));
  const stock = input.quantity;

  return {
    id: productId,
    reference: `KZ-${Date.now()}`,
    name: input.name,
    category: input.category,
    price: input.price,
    stock,
    image: serializedImages[0],
    images: serializedImages,
    ageRange: input.ageRange,
    gender: input.gender,
    status: resolveProductStatus(stock),
    createdAt: now,
    updatedAt: now,
  };
};

export const getLocalDashboardOverview = (): DashboardOverview =>
  mapDashboardOverview(getLocalData().dashboard ?? {});

export const getLocalProducts = (): Product[] =>
  Array.isArray(getLocalData().products) ? getLocalData().products.map(mapProduct) : [];

export const getLocalSales = (): SaleItem[] =>
  Array.isArray(getLocalData().sales) ? getLocalData().sales.map(mapSaleItem) : [];

export const createLocalProduct = async (input: CreateProductInput): Promise<Product> => {
  const currentState = getLocalData();
  const storedProduct = await buildStoredProduct(input);

  saveStoredAppState({
    ...currentState,
    products: [storedProduct, ...(Array.isArray(currentState.products) ? currentState.products : [])],
  });

  return mapProduct(storedProduct);
};
