"use client";
import React from 'react';
import { cn } from '@/lib/utils';

export const Avatar = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt, className, ...props }: { src?: string; alt?: string; className?: string }) => (
  <img src={src} alt={alt} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
);

export const AvatarFallback = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex h-full w-full items-center justify-center bg-muted", className)} {...props}>
    {children}
  </div>
);
