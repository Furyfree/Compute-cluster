import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "red" | "grey" | "green" | "orange";
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "underline";
}

export interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}
