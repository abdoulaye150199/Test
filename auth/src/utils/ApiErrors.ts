/**
 * Mappeur d'erreurs API sécurisé
 * Convertit les messages du backend en messages génériques
 * Évite : XSS, énumération d'utilisateurs, divulgation d'infos sensibles
 */

interface ErrorMapping {
  publicMessage: string;
  logMessage: string;
}

const SECURE_ERROR_MESSAGES: Record<number, ErrorMapping> = {
  // 4xx - Client errors
  400: {
    publicMessage: 'Données invalides',
    logMessage: 'Bad Request - Validation failed'
  },
  401: {
    publicMessage: 'Authentification échouée',
    logMessage: 'Unauthorized - Invalid credentials'
  },
  403: {
    publicMessage: 'Accès refusé',
    logMessage: 'Forbidden - Permission denied'
  },
  404: {
    publicMessage: 'Ressource non trouvée',
    logMessage: 'Not Found - Resource does not exist'
  },
  409: {
    publicMessage: 'Cette ressource existe déjà',
    logMessage: 'Conflict - Resource already exists'
  },
  429: {
    publicMessage: 'Trop de requêtes. Réessayez plus tard',
    logMessage: 'Too Many Requests - Rate limited'
  },

  // 5xx - Server errors
  500: {
    publicMessage: 'Erreur serveur. Veuillez réessayer',
    logMessage: 'Internal Server Error'
  },
  502: {
    publicMessage: 'Service temporairement indisponible',
    logMessage: 'Bad Gateway'
  },
  503: {
    publicMessage: 'Service temporairement indisponible',
    logMessage: 'Service Unavailable'
  },
  504: {
    publicMessage: 'Délai d\'attente dépassé. Veuillez réessayer',
    logMessage: 'Gateway Timeout'
  }
};

/**
 * Extrait un message d'erreur sûr basé sur le code HTTP
 * Rejette les messages du backend qui pourraient exposer des infos sensibles
 */
export function getSafeErrorMessage(
  status: number | null,
  backendMessage: string | null,
  defaultMessage: string
): string {
  // Si on a un mapping de statut, utiliser le message public sûr
  if (status && SECURE_ERROR_MESSAGES[status]) {
    return SECURE_ERROR_MESSAGES[status].publicMessage;
  }

  // Pour les autres statuts, utiliser un message générique
  if (status) {
    return defaultMessage;
  }

  // Si c'est une erreur réseau ou autre sans status
  return defaultMessage;
}

/**
 * Logs le message détaillé du backend (pour serveur/debug seulement)
 * À utiliser uniquement avec logger.error() ou errorMonitor
 */
export function getDetailedErrorLog(
  status: number | null,
  backendMessage: string | null
): string {
  if (status && SECURE_ERROR_MESSAGES[status]) {
    return SECURE_ERROR_MESSAGES[status].logMessage;
  }
  return backendMessage || 'Unknown error';
}

/**
 * Vérifie si un message du backend est "sûr" à afficher
 * (ne contient pas d'emails, données sensibles, etc.)
 */
export function isSafeToDisplayMessage(message: string): boolean {
  if (!message) return true;

  // Patterns sensibles à bloquer
  const dangerousPatterns = [
    /@/, // Email
    /\d{3}-\d{2}-\d{4}/, // SSN
    /\b\d{16}\b/, // Credit card
    /password|pwd|secret|token|key|api/i, // Sensitive keywords
  ];

  return !dangerousPatterns.some(pattern => pattern.test(message));
}

export default {
  getSafeErrorMessage,
  getDetailedErrorLog,
  isSafeToDisplayMessage
};
