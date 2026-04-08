import React, { useState, useRef, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShopName: string;
  currentShopLogo: string | null;
  onSave: (shopName: string, shopLogo: File | null) => void;
}

const EditShopModal: React.FC<EditShopModalProps> = ({
  isOpen,
  onClose,
  currentShopName,
  currentShopLogo,
  onSave
}) => {
  const [shopName, setShopName] = useState(currentShopName);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentShopLogo);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShopName(currentShopName);
      setLogoFile(null);
      setLogoPreview(currentShopLogo);
      setError('');
    }
  }, [isOpen, currentShopName, currentShopLogo]);

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Seuls les fichiers JPG, JPEG, PNG et WEBP sont autorisés');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('La taille du logo ne doit pas dépasser 2 Mo');
      return;
    }

    setError('');
    setLogoFile(file);
  };

  const handleSave = () => {
    if (!shopName.trim()) {
      setError('Le nom de la boutique est requis');
      return;
    }

    onSave(shopName.trim(), logoFile);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-9998"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal Box */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in pointer-events-auto">
          {/* Header with close button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              title="Fermer"
            >
              <X size={20} className="text-(--color-text-secondary)" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden bg-black flex items-center justify-center cursor-pointer border-4 border-white shadow-lg"
                  onClick={handleLogoClick}
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo de la boutique" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-lg font-bold">
                      {shopName.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Edit icon overlay */}
                <button
                  onClick={handleLogoClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow border-2 border-gray-100"
                  title="Changer le logo"
                >
                  <Edit2 size={16} className="text-(--color-text-primary)" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Shop Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-(--color-text-primary) mb-2">
                Nom de la marque
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-(--color-secondary) border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all"
                  placeholder="Entrez le nom de la boutique"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('input[type="text"]');
                    input?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
                  title="Modifier"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-(--color-secondary) text-(--color-text-primary) rounded-lg font-medium text-sm hover:bg-(--color-secondary-dark) transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-(--color-primary) text-white rounded-lg font-medium text-sm hover:bg-(--color-primary-hover) transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditShopModal;
