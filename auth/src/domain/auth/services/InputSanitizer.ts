
class InputSanitizer {
  private static readonly MAX_INPUT_LENGTH = 1000;
  private static readonly ENTITY_MAP: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#x27;',
    '"': '&quot;',
    '&': '&amp;'
  };

  static sanitize(input: unknown): string {
    if (typeof input !== 'string') {
      return String(input).substring(0, this.MAX_INPUT_LENGTH);
    }

    return input
      .trim()
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Scripts
      .replace(/javascript:/gi, '') // URLs javascript
      .replace(/data:\s*text\/html/gi, '') // Data URLs dangereuses
      .replace(/on\w+\s*=/gi, '') // Event handlers
      .replace(/[<>'"&]/g, (char) => this.ENTITY_MAP[char] || char) // Encoder les caractères spéciaux
      .substring(0, this.MAX_INPUT_LENGTH); // Limiter la longueur
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }
}

export { InputSanitizer };
