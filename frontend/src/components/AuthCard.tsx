import { cn } from "@/lib/utils";
import { AuthCardProps } from "@/types/components";

export default function AuthCard({
  children,
  title,
  subtitle,
  className,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div
        className={cn(
          "bg-white p-8 rounded-lg shadow-md w-full max-w-sm",
          className,
        )}
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
