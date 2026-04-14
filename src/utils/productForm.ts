import type { CreateProductInput, ProductFormValues } from '../types';
import { extractPriceNumber } from './currency';

export const PRODUCT_CATEGORIES = [
  'Vetements',
  'Chaussures',
  'Accessoires',
  'Autres',
] as const;

export const PRODUCT_AGE_RANGES = ['Adulte', 'Enfant'] as const;

export const createEmptyProductForm = (): ProductFormValues => ({
  name: '',
  category: '',
  price: '',
  quantity: '',
  ageRange: '',
  gender: '',
  images: [],
});

export const getGenderOptions = (ageRange: string): string[] => {
  if (ageRange === 'Adulte') {
    return ['Homme', 'Femme', 'Unisexe'];
  }

  if (ageRange === 'Enfant') {
    return ['Filles', 'Garcon', 'Unisexe'];
  }

  return [];
};

export const validateProductForm = (formData: ProductFormValues): Partial<Record<keyof ProductFormValues, string>> => {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};

  if (!formData.name.trim()) {
    errors.name = "Le nom de l'article est requis";
  }

  if (!formData.category) {
    errors.category = 'La categorie est requise';
  }

  if (!formData.price.trim()) {
    errors.price = 'Le prix est requis';
  } else {
    const priceNumber = extractPriceNumber(formData.price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      errors.price = 'Le prix doit etre un nombre valide';
    }
  }

  if (!formData.quantity.trim()) {
    errors.quantity = 'La quantite est requise';
  } else if (Number.isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
    errors.quantity = 'La quantite doit etre un nombre valide';
  }

  if (!formData.ageRange) {
    errors.ageRange = "La tranche d'age est requise";
  }

  if (!formData.gender) {
    errors.gender = 'La categorie de genre est requise';
  }

  return errors;
};

export const toCreateProductInput = (formData: ProductFormValues): CreateProductInput => ({
  name: formData.name.trim(),
  category: formData.category,
  price: extractPriceNumber(formData.price),
  quantity: Number(formData.quantity),
  ageRange: formData.ageRange,
  gender: formData.gender,
  images: formData.images,
});
