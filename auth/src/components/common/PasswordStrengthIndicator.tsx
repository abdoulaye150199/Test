import React, { FC } from 'react';
import { PasswordStrength } from '../../utils/validation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showFeedback?: boolean;
}

export const PasswordStrengthIndicator: FC<PasswordStrengthIndicatorProps> = ({
  strength,
  showFeedback = true,
}) => {
  const getStrengthColor = () => {
    switch (strength.score) {
      case 'weak': return { bar: 'bg-red-500', text: 'text-red-500' };
      case 'medium': return { bar: 'bg-yellow-500', text: 'text-yellow-500' };
      case 'strong': return { bar: 'bg-green-500', text: 'text-green-500' };
      case 'very-strong': return { bar: 'bg-emerald-500', text: 'text-emerald-500' };
      default: return { bar: 'bg-gray-500', text: 'text-gray-500' };
    }
  };

  const getStrengthLabel = () => {
    switch (strength.score) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      case 'very-strong': return 'Très fort';
      default: return '';
    }
  };

  const colors = getStrengthColor();

  return (
    <div className="mt-2 space-y-1.5">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Force:</span>
          <span className={`text-xs font-medium ${colors.text}`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${colors.bar} transition-all duration-300`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Feedback Messages */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="bg-gray-800/50 rounded p-2 space-y-1">
          {strength.feedback.map((item, idx) => (
            <p key={idx} className="text-xs text-yellow-400 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
              {item}
            </p>
          ))}
        </div>
      )}

      {/* Success Message */}
      {strength.feedback.length === 0 && strength.score !== 'weak' && (
        <p className="text-xs text-green-500 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Mot de passe très fort
        </p>
      )}
    </div>
  );
};
