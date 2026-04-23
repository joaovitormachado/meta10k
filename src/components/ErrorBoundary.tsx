import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card p-6 rounded-xl shadow-xl border border-destructive/20 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Ops! Algo deu errado.</h2>
            <p className="text-sm text-muted-foreground">
              Um erro inesperado travou a tela. Por favor, tente recarregar a página.
            </p>
            
            {this.state.error && (
              <div className="text-left bg-muted p-4 rounded-lg overflow-auto max-h-40 text-xs font-mono text-muted-foreground break-all">
                {this.state.error.message}
              </div>
            )}
            
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
