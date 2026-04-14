import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import ImageUpload from '../components/common/ImageUpload';
import type { ProductFormValues, Product } from '../types';
import { shopService } from '../services/shop/shopService';
import { useAppSession } from '../../shared/session/AppSessionContext';
import {
  createEmptyProductForm,
  getGenderOptions,
  PRODUCT_AGE_RANGES,
  PRODUCT_CATEGORIES,
  toCreateProductInput,
  validateProductForm,
} from '../utils/productForm';
import { getCurrencyByCountry, formatPrice } from '../utils/currency';

const AddProductPage: React.FC = () => {
  const location = useLocation();
  const editProduct = (location.state as { editProduct?: Product })?.editProduct;
  const { shop } = useAppSession();
  const [formData, setFormData] = useState<ProductFormValues>(createEmptyProductForm());
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);

  const currency = getCurrencyByCountry(shop?.country);

  // Préremplir le formulaire si on est en édition
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        category: editProduct.category,
        price: formatPrice(String(editProduct.price), shop?.country),
        quantity: String(editProduct.stock),
        ageRange: editProduct.ageRange || '',
        gender: editProduct.gender || '',
        images: [],
      });
      if (editProduct.image) {
        setMainPreviewUrl(editProduct.image);
      }
    }
  }, [editProduct, shop?.country]);

  const handleInputChange = (field: keyof ProductFormValues, value: string) => {
    let normalizedValue = value;
    
    if (field === 'category' || field === 'ageRange' || field === 'gender') {
      normalizedValue = value.trim();
    } else if (field === 'price') {
      normalizedValue = formatPrice(value, shop?.country);
    }

    setFormData((previous) => {
      const nextFormData = { ...previous, [field]: normalizedValue };
      if (field === 'ageRange') {
        nextFormData.gender = '';
      }
      return nextFormData;
    });

    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: '' }));
    }

    if (field === 'ageRange' && errors.gender) {
      setErrors((previous) => ({ ...previous, gender: '' }));
    }
  };

  const handleImagesChange = (images: File[]) => {
    setFormData((previous) => ({ ...previous, images }));
    if (errors.images) {
      setErrors((previous) => ({ ...previous, images: '' }));
    }
  };

  const handleReset = () => {
    setFormData(createEmptyProductForm());
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const validateCurrentForm = (): boolean => {
    const nextErrors = validateProductForm(formData);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitProduct = async (successMessage: string) => {
    if (!validateCurrentForm()) {
      setSubmitSuccess(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const input = toCreateProductInput(formData);
      
      if (editProduct) {
        // Mode édition
        await shopService.updateProduct(editProduct.id, input);
        setSubmitSuccess(successMessage || 'Produit mis à jour avec succès.');
      } else {
        // Mode création
        await shopService.createProduct(input);
        handleReset();
        setSubmitSuccess(successMessage || 'Produit enregistré.');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible de sauvegarder le produit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    void submitProduct('Produit enregistre. Vous pouvez en ajouter un autre.');
  };

  const handlePublish = () => {
    void submitProduct('Produit publie avec succes.');
  };

  useEffect(() => {
    if (formData.images.length === 0) {
      setMainPreviewUrl(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(formData.images[0]);
    setMainPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [formData.images]);

  const genderOptions = getGenderOptions(formData.ageRange);

  return (
    <DashboardLayout activePath="/produits/ajouter">
      <div className="max-w-7xl mx-auto px-0">
        <h1 className="text-xl md:text-2xl font-bold text-(--color-text-primary) mb-6 md:mb-8">
          {editProduct ? `Modifier: ${editProduct.name}` : 'Ajouter vos produits'}
        </h1>

        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {submitSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Nom de l'article <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.name ? 'border-red-500' : 'border-(--color-border)'
                    }`}
                    placeholder="Entrez le nom du produit"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Categorie de l'article <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(event) => handleInputChange('category', event.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.category ? 'border-red-500' : 'border-(--color-border)'
                    }`}
                  >
                    <option value="">Selectionnez une categorie</option>
                    {PRODUCT_CATEGORIES.map((category) => {
                      const categoryValue = category.trim();
                      return (
                        <option key={categoryValue} value={categoryValue}>
                          {category}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Prix de l'article <span className="text-red-500">*</span>
                    <span className="text-(--color-text-tertiary) font-normal ml-1">({currency.symbol})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(event) => handleInputChange('price', event.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.price ? 'border-red-500' : 'border-(--color-border)'
                    }`}
                    placeholder="Entrez le prix"
                  />
                  <p className="text-xs text-(--color-text-tertiary) mt-1">{currency.name} ({currency.code})</p>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Quantite d'article <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(event) => handleInputChange('quantity', event.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.quantity ? 'border-red-500' : 'border-(--color-border)'
                    }`}
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Tranche d'age <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ageRange}
                    onChange={(event) => handleInputChange('ageRange', event.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.ageRange ? 'border-red-500' : 'border-(--color-border)'
                    }`}
                  >
                    <option value="">Selectionnez une tranche d'age</option>
                    {PRODUCT_AGE_RANGES.map((ageRange) => (
                      <option key={ageRange} value={ageRange}>
                        {ageRange}
                      </option>
                    ))}
                  </select>
                  {errors.ageRange && <p className="text-xs text-red-500 mt-1">{errors.ageRange}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                    Choisissez une categorie de genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(event) => handleInputChange('gender', event.target.value)}
                    disabled={!formData.ageRange}
                    className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all ${
                      errors.gender ? 'border-red-500' : 'border-(--color-border)'
                    } ${!formData.ageRange ? 'opacity-50 cursor-not-allowed bg-(--color-secondary)' : ''}`}
                  >
                    <option value="">Selectionnez un genre</option>
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                  {!formData.ageRange && (
                    <p className="text-xs text-(--color-text-secondary) mt-1">
                      Veuillez d'abord selectionner une tranche d'age
                    </p>
                  )}
                  {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-(--color-border)">
                <h3 className="text-base md:text-lg font-semibold text-(--color-text-primary) mb-4">
                  Images du produit
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <p className="text-sm text-(--color-text-secondary)">
                    Importer les images du produit :
                  </p>
                  <button
                    type="button"
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                    className="btn-primary flex items-center justify-center gap-2 sm:flex-none"
                    disabled={isSubmitting}
                  >
                    + Ajouter une image
                  </button>
                </div>

                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                />
              </div>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary flex-1"
                  disabled={isSubmitting}
                >
                  {editProduct ? 'Annuler' : 'Réinitialiser'}
                </button>
                {editProduct ? (
                  <button
                    type="button"
                    onClick={() => void submitProduct('Produit mis à jour avec succès.')}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddAnother}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enregistrement...' : 'Ajouter un autre'}
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Publication...' : 'Publier le produit'}
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-base md:text-lg font-semibold text-(--color-text-primary) mb-4">
                Apercu principal
              </h3>
              <div className="aspect-square rounded-xl bg-(--color-secondary) flex items-center justify-center overflow-hidden">
                {mainPreviewUrl ? (
                  <img
                    src={mainPreviewUrl}
                    alt="Preview principale"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 md:p-8">
                    <svg
                      className="w-16 md:w-24 h-16 md:h-24 mx-auto text-(--color-text-tertiary) mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs md:text-sm text-(--color-text-tertiary)">
                      Aucune image selectionnee
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={editProduct ? () => void submitProduct('Produit mis à jour avec succès.') : handlePublish}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (editProduct ? 'Mise à jour...' : 'Publication...') : (editProduct ? 'Sauvegarder' : 'Publier le produit')}
                <ArrowRight size={18} />
              </button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProductPage;
