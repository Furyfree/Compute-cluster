"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-dtu-corporate-red border-t-transparent",
        sizeClasses[size],
        className,
      )}
    />
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {spinner}
      {text && (
        <p className="text-dtu-black dark:text-dtu-white text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dtu-white dark:bg-zinc-900 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Loading overlay component
export function LoadingOverlay({
  isLoading,
  children,
  text = "Loading...",
}: {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

// Skeleton loading component
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-zinc-700",
        className,
      )}
      {...props}
    />
  );
}
