import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface PropsType {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className }: PropsType) {
  return <h1 className={twMerge("", className)}>{children}</h1>;
}

export function H2({ children, className }: PropsType) {
  return <h2 className={twMerge("", className)}>{children}</h2>;
}

export function H3({ children, className }: PropsType) {
  return <h3 className={twMerge("", className)}>{children}</h3>;
}

export function H4({ children, className }: PropsType) {
  return <h4 className={twMerge("", className)}>{children}</h4>;
}

export function H5({ children, className }: PropsType) {
  return <h5 className={twMerge("", className)}>{children}</h5>;
}

export function P({ children, className }: PropsType) {
  return <p className={twMerge("", className)}>{children}</p>;
}
