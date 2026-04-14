import React from 'react';
import { X } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !product) return null;

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      onDelete?.(product);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl border border-(--color-border) bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-(--color-border) bg-white p-6">
            <h2 className="text-xl font-bold text-(--color-text-primary)">Détails du produit</h2>
            <button
              onClick={onClose}
              className="icon-btn"
              title="Fermer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image */}
            {product.image && (
              <div className="flex justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-64 w-64 rounded-lg object-cover border border-(--color-border)"
                />
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Référence
                </p>
                <p className="text-lg font-medium text-(--color-text-primary) mt-1">
                  {product.reference}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Nom du produit
                </p>
                <p className="text-lg font-medium text-(--color-text-primary) mt-1">
                  {product.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Catégorie
                </p>
                <p className="text-lg font-medium text-(--color-text-primary) mt-1">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Prix
                </p>
                <p className="text-lg font-medium text-(--color-text-primary) mt-1">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Stock disponible
                </p>
                <p className="text-lg font-medium text-(--color-text-primary) mt-1">
                  {product.stock} unités
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                  Statut
                </p>
                <div className="mt-1">
                  {product.status === 'in_stock' && (
                    <span className="badge-success">En Stock</span>
                  )}
                  {product.status === 'out_of_stock' && (
                    <span className="badge-error">Épuisé</span>
                  )}
                  {product.status === 'low_stock' && (
                    <span className="badge-warning">Stock Faible</span>
                  )}
                </div>
              </div>
            </div>

            {/* Données additionnelles */}
            {(product.ageRange || product.gender) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-(--color-border)">
                {product.ageRange && (
                  <div>
                    <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                      Tranche d'âge
                    </p>
                    <p className="text-base font-medium text-(--color-text-primary) mt-1">
                      {product.ageRange}
                    </p>
                  </div>
                )}
                {product.gender && (
                  <div>
                    <p className="text-sm font-semibold text-(--color-text-secondary) uppercase tracking-wide">
                      Genre
                    </p>
                    <p className="text-base font-medium text-(--color-text-primary) mt-1">
                      {product.gender}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-(--color-border) text-2xs text-(--color-text-tertiary)">
              <div>
                <p className="font-semibold">Créé le</p>
                <p>{new Date(product.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="font-semibold">Modifié le</p>
                <p>{new Date(product.updatedAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex gap-3 border-t border-(--color-border) bg-white p-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-(--color-border) rounded-lg text-sm font-medium text-(--color-text-primary) hover:bg-(--color-surface-hover) transition-colors"
            >
              Fermer
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(product);
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-(--color-primary) rounded-lg text-sm font-medium text-white hover:bg-(--color-primary-dark) transition-colors"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsModal;
