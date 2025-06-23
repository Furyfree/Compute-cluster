import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types/components";

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-dtu-corporate-red text-dtu-white hover:bg-dtu-red focus:ring-dtu-corporate-red/50",
    secondary:
      "bg-dtu-grey text-dtu-black hover:bg-gray-300 focus:ring-dtu-grey/50",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
