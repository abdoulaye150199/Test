const PENDING_BOUTIQUE_USER_KEY = 'kukuza.pending-boutique-user';

export interface PendingBoutiqueUserData {
  name: string;
  email: string;
  password: string;
}

const isPendingBoutiqueUserData = (
  value: unknown
): value is PendingBoutiqueUserData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.password === 'string'
  );
};

export const savePendingBoutiqueUserData = (
  data: PendingBoutiqueUserData
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_BOUTIQUE_USER_KEY,
    JSON.stringify(data)
  );
};

export const loadPendingBoutiqueUserData =
  (): PendingBoutiqueUserData | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const rawValue = window.sessionStorage.getItem(PENDING_BOUTIQUE_USER_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue);
      return isPendingBoutiqueUserData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

export const clearPendingBoutiqueUserData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_BOUTIQUE_USER_KEY);
};
