import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types/components";

export default function Button({
  className,
  variant = "red",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    red: "bg-dtu-corporate-red text-dtu-white hover:bg-dtu-red focus:ring-dtu-corporate-red/50",
    grey: "bg-dtu-grey text-dtu-black hover:bg-gray-300 focus:ring-dtu-grey/50",
    green:
      "bg-dtu-green text-dtu-white hover:bg-dtu-green-300 focus:ring-dtu-green/50",
    orange:
      "bg-dtu-orange text-dtu-white hover:bg-dtu-orange-300 focus:ring-dtu-orange/50",
  };

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed hover:bg-current"
    : "";

  return (
    <button
      className={cn(base, variants[variant], disabledStyles, className)}
      disabled={disabled}
      {...props}
    />
  );
}
