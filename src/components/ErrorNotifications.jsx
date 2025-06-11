"use client";

import { useError } from "@/contexts/ErrorContext";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorNotifications() {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: "text-green-600",
          button: "text-green-500 hover:text-green-700"
        };
      case 'warning':
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: "text-yellow-600",
          button: "text-yellow-500 hover:text-yellow-700"
        };
      case 'info':
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: "text-blue-600",
          button: "text-blue-500 hover:text-blue-700"
        };
      default:
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: "text-red-600",
          button: "text-red-500 hover:text-red-700"
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-full">
      {errors.map((error) => {
        const styles = getStyles(error.type);
        const Icon = () => getIcon(error.type);

        return (
          <div
            key={error.id}
            className={`
              animate-in slide-in-from-right duration-300
              p-4 border rounded-lg shadow-md
              ${styles.container}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={styles.icon}>
                <Icon />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">
                  {error.message}
                </p>
                {error.timestamp && (
                  <p className="text-xs opacity-75 mt-1">
                    {error.timestamp.toLocaleTimeString('fr-FR')}
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeError(error.id)}
                className={`
                  p-1 h-auto min-w-0 hover:bg-transparent
                  ${styles.button}
                `}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
} 