"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (type === "loading") return; // Don't auto-close loading toasts
    
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    loading: "⏳",
  };

  const colors = {
    success: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    error: "from-red-500/20 to-rose-500/20 border-red-500/30",
    info: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    loading: "from-purple-500/20 to-blue-500/20 border-purple-500/30",
  };

  const textColors = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-blue-400",
    loading: "text-purple-400",
  };

  return (
    <div
      className={`glass-strong border rounded-xl p-4 min-w-[300px] max-w-md shadow-2xl backdrop-blur-xl
        ${colors[type]} ${isExiting ? "animate-slide-out" : "animate-slide-in"}
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${type === "loading" ? "animate-spin" : ""}`}>
          {icons[type]}
        </span>
        <p className={`flex-1 font-medium ${textColors[type]}`}>{message}</p>
        {type !== "loading" && (
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Hook to manage toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateToast = (id: string, message: string, type: ToastType) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, type } : t))
    );
  };

  return { toasts, addToast, removeToast, updateToast };
}
