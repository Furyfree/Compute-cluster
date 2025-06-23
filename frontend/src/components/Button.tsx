import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-dtu-corporateRed text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-black hover:bg-gray-200",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
