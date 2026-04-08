/**
 * Retry Interceptor for Axios
 * Gère les retries automatiques avec exponential backoff
 */

import { AxiosInstance } from 'axios';

export interface RetryConfig {
  maxRetries: number;
  retryableStatuses: number[];
  backoffMs: number;
}

export class RetryInterceptor {
  constructor(
    private httpClient: AxiosInstance,
    private config: RetryConfig
  ) {
    this.setupInterceptor();
  }

  /**
   * Vérifie si une erreur est retryable (erreurs réseau)
   */
  private isRetryableError(error: any): boolean {
    if (!error.response) {
      const code = error.code;
      return (
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET' ||
        code === 'ENETUNREACH'
      );
    }
    return false;
  }

  /**
   * Enregistre le nombre de retries sur la config de la requête
   */
  private setupInterceptor(): void {
    this.httpClient.interceptors.response.use(
      response => response,
      error => {
        const config = error.config;

        // Initialiser le compteur de retry
        if (!config || config.retryCount === undefined) {
          config.retryCount = 0;
        }

        config.retryCount += 1;

        // Déterminer si on doit retry
        const shouldRetry =
          config.retryCount <= this.config.maxRetries &&
          (this.isRetryableError(error) ||
            (error.response && this.config.retryableStatuses.includes(error.response.status)));

        if (shouldRetry) {
          const backoffDelay = this.config.backoffMs * Math.pow(2, config.retryCount - 1);

          console.warn(
            `[Retry] ${error.response?.status || error.code} at ${config.url}. ` +
            `Attempt ${config.retryCount}/${this.config.maxRetries}. Waiting ${backoffDelay}ms...`
          );

          return new Promise(resolve => setTimeout(resolve, backoffDelay)).then(
            () => this.httpClient(config)
          );
        }

        return Promise.reject(error);
      }
    );
  }
}
