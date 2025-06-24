import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types/components";

export default function Button({
  className,
  variant = "red",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    red: "bg-dtu-corporate-red text-dtu-white hover:bg-dtu-red focus:ring-dtu-corporate-red/50",
    grey: "bg-dtu-grey text-dtu-black hover:bg-gray-300 focus:ring-dtu-grey/50",
    green:
      "bg-dtu-green text-dtu-white hover:bg-dtu-green-300 focus:ring-dtu-green/50",
    orange:
      "bg-dtu-orange text-dtu-white hover:bg-dtu-orange-300 focus:ring-dtu-orange/50",
    blue: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed hover:bg-current"
    : "";

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        disabledStyles,
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
