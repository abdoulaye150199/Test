import React, { useState, FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../hooks/useAuth';
import { registerValidationSchema } from '../utils/validation';
import { AuthLayout } from '../components/layout/AuthLayout';
import {
  clearPendingBoutiqueUserData,
} from '../utils/pendingBoutiqueRegistration';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();
  const [isBoutique, setIsBoutique] = useState<boolean>(false);
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, registerValidationSchema);

  const handleContinueToBoutique = async (formValues: RegisterFormValues): Promise<void> => {
    const { confirmPassword, ...userData } = formValues;

    try {
      clearPendingBoutiqueUserData();
      await register({ ...userData, isBoutique: false });
      navigate('/register/boutique');
    } catch (error) {
    }
  };

  const handleRegister = async (formValues: RegisterFormValues): Promise<void> => {
    const { confirmPassword, ...userData } = formValues;
    
    try {
      clearPendingBoutiqueUserData();
      await register({ ...userData, isBoutique: false });
      navigate('/');
    } catch (error) {
    }
  };


  return (
    <AuthLayout>
      <div className="w-full space-y-1.5 sm:space-y-2 md:space-y-2.5">
        <div className="text-center">
          <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-primary">Inscription</h2>
        </div>

        {authError && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-white px-2.5 sm:px-3 py-1.5 rounded relative text-xs sm:text-sm" role="alert">
            <span className="block sm:inline">{authError}</span>
          </div>
        )}

        <form
          className="mt-1 sm:mt-1.5 md:mt-2 space-y-1.5 sm:space-y-2"
          onSubmit={handleSubmit(isBoutique ? handleContinueToBoutique : handleRegister)}
        >
          <div className="space-y-1 sm:space-y-1.5">
            <Input
              label="Nom complet"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
              placeholder="votre nom complet"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              placeholder="votre@email.com"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
              placeholder="••••••••"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 py-0.5 xs:py-1 sm:py-1.5">
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  id="isBoutique"
                  checked={isBoutique}
                  onChange={(e) => setIsBoutique(e.target.checked)}
                  className="peer sr-only"
                />
                <label 
                  htmlFor="isBoutique" 
                  className="relative flex items-center justify-center w-4.5 h-4.5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-md cursor-pointer transition-all duration-300
                    bg-white/10 backdrop-blur-md border border-white/20
                    peer-checked:bg-[#287460]/20 peer-checked:border-[#287460] peer-checked:shadow-[0_0_12px_rgba(40,116,96,0.3)]
                    hover:bg-white/15 hover:border-white/30
                    peer-focus-visible:ring-2 peer-focus-visible:ring-[#287460]/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent"
                >
                  <svg 
                    className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-[#287460] transition-all duration-300 ${
                      isBoutique ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </label>
              </div>
              <label 
                htmlFor="isBoutique" 
                className="text-xs xs:text-xs sm:text-sm font-medium text-white/90 cursor-pointer select-none whitespace-nowrap"
              >
                Je suis une boutique
              </label>
            </div>
            <p className="text-[0.688rem] xs:text-xs sm:text-sm text-gray-400 whitespace-nowrap">
              Déjà inscrit?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                Se connecter
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {isBoutique ? 'Continuer' : "S'inscrire"}
          </Button>

        </form>
      </div>
    </AuthLayout>
  );
};
