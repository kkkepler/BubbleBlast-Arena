"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export function SimpleDialog({ open, onOpenChange, children, className, hideCloseButton }: SimpleDialogProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("relative z-50 bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4", className)}>
        {children}
        {!hideCloseButton && (
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => onOpenChange(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function SimpleDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function SimpleDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-xl font-bold", className)}>{children}</h2>;
}

export function SimpleDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function SimpleDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)}>{children}</div>;
}
