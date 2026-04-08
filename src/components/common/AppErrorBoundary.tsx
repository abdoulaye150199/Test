import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Une erreur inattendue est survenue.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Runtime error', error, errorInfo);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f8f9fa',
          color: '#1a1a1a',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            padding: '24px',
          }}
        >
          <h1 style={{ margin: '0 0 12px', fontSize: '24px', lineHeight: 1.2 }}>
            L'application a rencontre une erreur
          </h1>
          <p style={{ margin: '0 0 12px', color: '#4b5563' }}>
            Recharge la page. Si le probleme continue, verifie les variables Supabase et la console du navigateur.
          </p>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '12px',
              color: '#111827',
            }}
          >
            {this.state.errorMessage}
          </pre>
        </div>
      </div>
    );
  }
}
