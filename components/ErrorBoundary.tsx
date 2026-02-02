import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly declare state and props as class members to fix "Property does not exist on type 'ErrorBoundary'" errors.
  // In some environments, the generic inheritance from React.Component might not be correctly inferred.
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    // Fix: Initializing state and ensuring props are correctly bound.
    this.state = {
      hasError: false,
      error: undefined,
    };
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  private handleReload = () => {
    // A more aggressive recovery: clear local storage which might contain corrupt data
    try {
        console.warn("Attempting recovery: Clearing local storage...");
        localStorage.clear();
    } catch (e) {
        console.error("Could not clear local storage:", e);
    } finally {
        // Reload the page
        window.location.reload();
    }
  }

  render() {
    // Fix: Accessing state which is now explicitly declared.
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.006h-4.992v4.992h4.992z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ocurrió un problema</h2>
            <p className="text-gray-600 max-w-sm mx-auto mb-8">Parece que algo no cargó correctamente. Esto puede suceder después de una actualización. Presiona el botón para recargar y solucionar el problema.</p>
            <button 
              onClick={this.handleReload}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
              Recargar Página
            </button>
             <details className="mt-6 text-left text-xs text-gray-500 bg-gray-100 p-2 rounded w-full max-w-sm">
                <summary className="cursor-pointer">Detalles técnicos (opcional)</summary>
                <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                    {this.state.error?.toString()}
                </pre>
            </details>
        </div>
      );
    }

    // Fix: Accessing props which is now explicitly declared.
    return this.props.children;
  }
}

export default ErrorBoundary;