import type { CreateProductInput, DashboardOverview, Product, SaleItem } from '../../types';
import { shopEnv } from '../../config/env';
import { requestJson } from '../api/httpClient';
import {
  createLocalProduct,
  getLocalDashboardOverview,
  getLocalProducts,
  getLocalSales,
  updateLocalProduct,
  deleteLocalProduct,
} from './shopLocalData';
import { mapDashboardOverview, mapProduct, mapSaleItem } from './shopMappers';
import {
  createSupabaseProduct,
  getSupabaseDashboardOverview,
  getSupabaseProducts,
  getSupabaseSales,
} from './shopSupabase';

const withFallback = async <T>(
  operation: string,
  request: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> => {
  if (shopEnv.enableApiMocks) {
    return await fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.error(`[shopService] API request failed for ${operation}.`, error);
    throw error;
  }
};

const createProductPayload = (input: CreateProductInput): FormData => {
  const payload = new FormData();
  payload.append('name', input.name);
  payload.append('category', input.category);
  payload.append('price', String(input.price));
  payload.append('currencyCode', input.currencyCode);
  payload.append('quantity', String(input.quantity));
  payload.append('ageRange', input.ageRange);
  payload.append('gender', input.gender);

  input.images.forEach((image) => {
    payload.append('images', image);
  });

  return payload;
};

export const shopService = {
  async getDashboardOverview(): Promise<DashboardOverview> {
    if (shopEnv.useSupabase) {
      return getSupabaseDashboardOverview();
    }

    return withFallback(
      'getDashboardOverview',
      async () => {
        const response = await requestJson<unknown>('/dashboard');
        return mapDashboardOverview(response);
      },
      () => getLocalDashboardOverview()
    );
  },

  async getProducts(): Promise<Product[]> {
    if (shopEnv.useSupabase) {
      return getSupabaseProducts();
    }

    return withFallback(
      'getProducts',
      async () => {
        const response = await requestJson<unknown>('/products');
        const list = Array.isArray(response)
          ? response
          : Array.isArray((response as { data?: unknown[] })?.data)
            ? (response as { data: unknown[] }).data
            : [];

        return list.map(mapProduct);
      },
      () => getLocalProducts()
    );
  },

  async getSales(): Promise<SaleItem[]> {
    if (shopEnv.useSupabase) {
      return getSupabaseSales();
    }

    return withFallback(
      'getSales',
      async () => {
        const response = await requestJson<unknown>('/sales');
        const list = Array.isArray(response)
          ? response
          : Array.isArray((response as { data?: unknown[] })?.data)
            ? (response as { data: unknown[] }).data
            : [];

        return list.map(mapSaleItem);
      },
      () => getLocalSales()
    );
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    if (shopEnv.useSupabase) {
      return createSupabaseProduct(input);
    }

    return withFallback(
      'createProduct',
      async () => {
        const response = await requestJson<unknown>('/products', {
          method: 'POST',
          body: createProductPayload(input),
        });

        return mapProduct(response);
      },
      () => createLocalProduct(input)
    );
  },

  async updateProduct(productId: string, input: CreateProductInput): Promise<Product> {
    if (shopEnv.useSupabase) {
      // Assuming Supabase has update, but not implemented yet
      return withFallback(
        'updateProduct',
        async () => {
          const response = await requestJson<unknown>(`/products/${productId}`, {
            method: 'PUT',
            body: createProductPayload(input),
          });

          return mapProduct(response);
        },
        () => updateLocalProduct(productId, input)
      );
    }

    return withFallback(
      'updateProduct',
      async () => {
        const response = await requestJson<unknown>(`/products/${productId}`, {
          method: 'PUT',
          body: createProductPayload(input),
        });

        return mapProduct(response);
      },
      () => updateLocalProduct(productId, input)
    );
  },

  async deleteProduct(productId: string): Promise<void> {
    if (shopEnv.useSupabase) {
      // Assuming Supabase has delete, but not implemented yet
      return withFallback(
        'deleteProduct',
        async () => {
          await requestJson<unknown>(`/products/${productId}`, {
            method: 'DELETE',
          });
        },
        () => deleteLocalProduct(productId)
      );
    }

    return withFallback(
      'deleteProduct',
      async () => {
        await requestJson<unknown>(`/products/${productId}`, {
          method: 'DELETE',
        });
      },
      () => deleteLocalProduct(productId)
    );
  },
};
