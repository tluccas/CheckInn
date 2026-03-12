import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  hoverable = false,
}: CardProps) {
  const Wrapper = hoverable ? motion.div : "div";
  const hoverProps = hoverable
    ? {
        whileHover: { y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Wrapper
      className={`bg-white rounded-xl border border-[var(--color-secondary)]/90 shadow-xl p-6 ${className}`}
      {...hoverProps}
    >
      {children}
    </Wrapper>
  );
}
