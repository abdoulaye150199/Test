import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EllipsisVertical, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import Tabs, { Tab } from '../common/Tabs';
import Pagination from '../common/Pagination';
import ProductDetailsModal from '../common/ProductDetailsModal';
import type { Product, ProductFilter } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { shopService } from '../../services/shop/shopService';

const ITEMS_PER_PAGE = 6;

interface ProductsTableProps {
  products: Product[];
  onProductsChange?: () => Promise<void>;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onProductsChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs: Tab[] = [
    { id: 'all', label: 'Produits', count: localProducts.length },
    { id: 'in_stock', label: 'En Stocks', count: localProducts.filter(p => p.status === 'in_stock').length },
    { id: 'low_stock', label: 'Stock Faible', count: localProducts.filter(p => p.status === 'low_stock').length },
    { id: 'out_of_stock', label: 'Stocks Épuisés', count: localProducts.filter(p => p.status === 'out_of_stock').length }
  ];

  const filteredProducts = useMemo(() => {
    return localProducts.filter(product => {
      const matchesStatus = activeTab === 'all' || product.status === activeTab;
      
      const matchesSearch = searchQuery === '' || 
        product.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [localProducts, activeTab, searchQuery]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return <span className="badge-success">En Stocks</span>;
      case 'out_of_stock':
        return <span className="badge-error">Épuisé</span>;
      case 'low_stock':
        return <span className="badge-warning">Stock Faible</span>;
      default:
        return null;
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = (product: Product) => {
    console.log('Modifier', product);
    setOpenMenuId(null);
    // Naviguer vers le formulaire d'édition avec le produit en query params
    navigate('/produits/ajouter', { state: { editProduct: product } });
  };

  const handleDelete = async (product: Product) => {
    setIsDeleting(true);
    setMessage(null);

    // Suppression optimiste
    setLocalProducts(prev => prev.filter(p => p.id !== product.id));

    try {
      await shopService.deleteProduct(product.id);
      setMessage(`Le produit "${product.name}" a été supprimé avec succès.`);
      setOpenMenuId(null);
      // Recharger les produits en arrière-plan pour synchroniser
      if (onProductsChange) {
        await onProductsChange();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Remettre le produit en cas d'erreur
      setLocalProducts(prev => [...prev, product].sort((a, b) => a.name.localeCompare(b.name)));
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      setMessage(`Impossible de supprimer "${product.name}". ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const ActionMenu: React.FC<{ product: Product }> = ({ product }) => {
    const isOpen = openMenuId === product.id;

    return (
      <div className="relative" ref={isOpen ? menuRef : null}>
        <button
          onClick={() => setOpenMenuId(isOpen ? null : product.id)}
          className="icon-btn"
          title="Plus d'options"
        >
          <EllipsisVertical size={16} />
        </button>

        {isOpen && (
          <div className="absolute -right-2 top-8 z-50 w-48 rounded-lg border border-(--color-border) bg-white shadow-xl">
            <button
              onClick={() => {
                handleViewDetails(product);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-(--color-text-primary) hover:bg-(--color-surface-hover) border-b border-(--color-border) transition-colors"
            >
              <Eye size={16} />
              Voir détails
            </button>
            <button
              onClick={() => {
                handleEdit(product);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-(--color-text-primary) hover:bg-(--color-surface-hover) border-b border-(--color-border) transition-colors"
            >
              <Edit2 size={16} />
              Modifier
            </button>
            <button
              onClick={() => {
                handleDelete(product);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="table-container">
      <div className="flex flex-col gap-3 border-b border-(--color-border) p-3 md:flex-row md:items-center md:justify-between md:gap-6 md:p-4">
        <div className="flex-1 min-w-0">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(tabId) => setActiveTab(tabId as ProductFilter)} 
          />
        </div>
        
        <div className="relative w-full md:w-80">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)"
          />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent transition-all"
          />
        </div>
      </div>

      {message && (
        <div className={`mx-3 md:mx-4 p-3 rounded-lg text-sm ${
          message.includes('supprimé') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {paginatedProducts.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-(--color-text-secondary)">
          {searchQuery ? 'Aucun produit trouvé pour votre recherche' : 'Aucun produit trouvé'}
        </div>
      ) : (
        <>
          <div className="divide-y divide-(--color-border) md:hidden">
            {paginatedProducts.map((product) => (
              <article key={product.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-(--color-secondary)">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xs text-(--color-text-tertiary)">IMG</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-(--color-text-primary)">{product.name}</p>
                      <p className="truncate text-xs text-(--color-text-secondary)">{product.category}</p>
                    </div>
                  </div>
                  <ActionMenu product={product} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(product.status)}
                  <span className="rounded-full bg-(--color-surface-hover) px-3 py-1 text-xs font-medium text-(--color-text-secondary)">
                    Ref: {product.reference}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-(--color-surface-hover) px-3 py-2">
                    <p className="text-2xs uppercase tracking-wide text-(--color-text-tertiary)">Prix</p>
                    <p className="mt-1 font-semibold text-(--color-text-primary)">
                      {formatCurrency(product.price, product.currencyCode)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-(--color-surface-hover) px-3 py-2">
                    <p className="text-2xs uppercase tracking-wide text-(--color-text-tertiary)">Stock</p>
                    <p className="mt-1 font-semibold text-(--color-text-primary)">{product.stock}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto table-responsive md:block">
        <table className="table">
          <thead>
            <tr>
              <th className="text-xs md:text-sm">Références</th>
              <th className="hidden sm:table-cell text-xs md:text-sm">Product</th>
              <th className="hidden md:table-cell text-xs md:text-sm">Catégories produits</th>
              <th className="text-xs md:text-sm">Qté</th>
              <th className="hidden lg:table-cell text-xs md:text-sm">Statut Stock</th>
              <th className="text-xs md:text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td className="font-medium text-xs md:text-sm">{product.reference}</td>
                <td className="hidden sm:table-cell">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-(--color-secondary) flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xs md:text-xs text-(--color-text-tertiary)">
                          IMG
                        </span>
                      )}
                    </div>
                    <span className="text-xs md:text-sm truncate">{product.name}</span>
                  </div>
                </td>
                <td className="hidden md:table-cell text-xs md:text-sm text-(--color-text-secondary)">{product.category}</td>
                <td className="font-medium text-xs md:text-sm">{product.stock}</td>
                <td className="hidden lg:table-cell text-xs md:text-sm">{getStatusBadge(product.status)}</td>
                <td>
                  <ActionMenu product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </>
      )}

      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="px-3 md:px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredProducts.length}
          />
        </div>
      )}

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProductsTable;
