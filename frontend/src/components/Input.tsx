import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { InputProps } from "@/types/components";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = "default", ...props }, ref) => {
    const baseStyles = "w-full transition-colors focus:outline-none";

    const variants = {
      default:
        "mt-1 border rounded-md p-2 bg-white text-gray-700 focus:ring-2 focus:ring-dtu-blue border-gray-300",
      underline:
        "px-0 py-3 text-gray-900 placeholder-gray-500 border-0 border-b border-gray-300 focus:border-dtu-blue bg-transparent",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            baseStyles,
            variants[variant],
            error && "border-red-500",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
