'use client';

import { useEffect, useState } from 'react';
import Toast, { ToastType } from './Toast';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-in-right"
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
}