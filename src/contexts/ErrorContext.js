"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext({});

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error, type = 'error', duration = 5000) => {
    const errorObj = {
      id: Date.now() + Math.random(),
      message: typeof error === 'string' ? error : error.message,
      type, // 'error', 'warning', 'success', 'info'
      timestamp: new Date()
    };

    setErrors(prev => [...prev, errorObj]);

    // Auto-remove error after duration
    if (duration > 0) {
      setTimeout(() => {
        removeError(errorObj.id);
      }, duration);
    }

    return errorObj.id;
  }, []);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Helper functions for different error types
  const addSuccess = useCallback((message, duration = 3000) => {
    return addError(message, 'success', duration);
  }, [addError]);

  const addWarning = useCallback((message, duration = 4000) => {
    return addError(message, 'warning', duration);
  }, [addError]);

  const addInfo = useCallback((message, duration = 3000) => {
    return addError(message, 'info', duration);
  }, [addError]);

  // API error handler
  const handleAPIError = useCallback((error, customMessage = null) => {
    let message = customMessage;
    
    if (!message) {
      if (error.response) {
        // HTTP error responses
        switch (error.response.status) {
          case 401:
            message = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 403:
            message = 'Vous n\'avez pas les permissions pour cette action.';
            break;
          case 404:
            message = 'Ressource non trouvée.';
            break;
          case 500:
            message = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            message = error.response.data?.message || 'Une erreur s\'est produite.';
        }
      } else if (error.request) {
        // Network error
        message = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        // Other errors
        message = error.message || 'Une erreur inattendue s\'est produite.';
      }
    }

    return addError(message, 'error');
  }, [addError]);

  const value = {
    errors,
    addError,
    addSuccess,
    addWarning,
    addInfo,
    removeError,
    clearErrors,
    handleAPIError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
} 