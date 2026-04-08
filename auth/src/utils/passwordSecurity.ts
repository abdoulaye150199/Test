
const WEAK_PASSWORDS = new Set([
  'password', 'password123', '12345678', '123456789',
  'qwerty', 'abc123', '123123', '1234567',
  '000000', '111111', '123456', 'password1',
  'welcome', 'monkey', '1234', 'dragon',
  'master', 'sunshine', 'letmein', 'trustno1',
  'princess', 'admin', 'pass', 'login',
  '666666', '123321', 'passw0rd',

  '111111', '222222', '333333', '444444', '555555',
  '666666', '777777', '888888', '999999', '000000',

  'abcdef', 'abcdef123', '123456789', '987654321',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',

  'password2', 'password3', 'password4', 'password5',
  'admin123', 'user123', 'test123',

  '!@#$%^', 'qazwsx', 'qweasd', '123qwe',

  'john', 'jane', 'michael', 'robert', 'james',
  'william', 'david', 'richard', 'charles', 'joseph',
  '1234', '2020', '2021', '2022', '2023', '2024',
  '1980', '1990', '2000', '2010',

  'user', 'admin', 'test', 'guest', 'demo',
  'root', 'toor', 'pass', 'passwd', 'temp',
]);

export const isWeakPassword = (password: string): boolean => {
  return WEAK_PASSWORDS.has(password.toLowerCase());
};

export const validatePasswordStrength = (password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length < 8) feedback.push('Au moins 8 caractères requis');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Ajouter des minuscules');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Ajouter des majuscules');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Ajouter des chiffres');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Ajouter des caractères spéciaux pour plus de sécurité');

  if (isWeakPassword(password)) {
    feedback.unshift('Ce mot de passe est trop courant');
    score = Math.max(0, score - 2);
  }

  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Éviter les caractères répétitifs');
    score = Math.max(0, score - 1);
  }

  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Éviter les séquences de caractères');
    score = Math.max(0, score - 1);
  }

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
};

export default {
  isWeakPassword,
  validatePasswordStrength,
};
