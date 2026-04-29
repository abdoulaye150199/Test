import type { CreateProductInput, DashboardOverview, Product, SaleItem } from '../../types';
import {
  loadStoredAppState,
  saveStoredAppState,
  type StoredAppState,
  type StoredProduct,
} from '../../../shared/session/appStateStorage';
import { mapDashboardOverview, mapProduct, mapSaleItem } from './shopMappers';

const getLocalData = (): StoredAppState => loadStoredAppState();

const getCurrentShopId = (state: StoredAppState): string | null => state.shop?.id ?? null;

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
  const currentState = getLocalData();
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
    currencyCode: input.currencyCode,
    stock,
    image: serializedImages[0],
    images: serializedImages,
    ageRange: input.ageRange,
    gender: input.gender,
    shopId: currentState.shop?.id ?? null,
    status: resolveProductStatus(stock),
    createdAt: now,
    updatedAt: now,
  };
};

export const getLocalDashboardOverview = (): DashboardOverview =>
  mapDashboardOverview(getLocalData().dashboard ?? {});

export const getLocalProducts = (): Product[] => {
  const currentState = getLocalData();
  const currentShopId = getCurrentShopId(currentState);
  const products = Array.isArray(currentState.products) ? currentState.products : [];

  const filteredProducts = currentShopId
    ? products.filter((product) => product.shopId == null || product.shopId === currentShopId)
    : products;

  return filteredProducts.map(mapProduct);
};

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

export const updateLocalProduct = async (productId: string, input: CreateProductInput): Promise<Product> => {
  const currentState = getLocalData();
  const currentShopId = getCurrentShopId(currentState);
  const products = Array.isArray(currentState.products) ? currentState.products : [];
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    throw new Error('Produit non trouvé');
  }

  const existingProduct = products[productIndex];
  if (currentShopId && existingProduct.shopId && existingProduct.shopId !== currentShopId) {
    throw new Error('Produit non trouvé');
  }

  const serializedImages = input.images.length > 0 
    ? await Promise.all(input.images.map(fileToDataUrl))
    : (existingProduct.images || []);

  const updatedProduct: StoredProduct = {
    ...existingProduct,
    name: input.name,
    category: input.category,
    price: input.price,
    currencyCode: input.currencyCode,
    stock: input.quantity,
    images: serializedImages,
    image: serializedImages[0] || existingProduct.image,
    ageRange: input.ageRange,
    gender: input.gender,
    status: resolveProductStatus(input.quantity),
    updatedAt: new Date().toISOString(),
  };

  const updatedProducts = [...products];
  updatedProducts[productIndex] = updatedProduct;

  saveStoredAppState({
    ...currentState,
    products: updatedProducts,
  });

  return mapProduct(updatedProduct);
};

export const deleteLocalProduct = async (productId: string): Promise<void> => {
  const currentState = getLocalData();
  const currentShopId = getCurrentShopId(currentState);
  const products = Array.isArray(currentState.products) ? currentState.products : [];
  const existingProduct = products.find((p) => p.id === productId);

  if (!existingProduct || (currentShopId && existingProduct.shopId && existingProduct.shopId !== currentShopId)) {
    throw new Error('Produit non trouvé');
  }

  const filteredProducts = products.filter(p => p.id !== productId);

  saveStoredAppState({
    ...currentState,
    products: filteredProducts,
  });
};
