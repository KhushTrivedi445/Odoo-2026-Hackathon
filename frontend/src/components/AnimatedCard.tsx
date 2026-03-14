import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className, delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -2, boxShadow: "0 8px 30px -12px hsl(var(--primary) / 0.15)" }}
    onClick={onClick}
    className={cn("bg-card border border-border/50 rounded-lg p-6 cursor-pointer transition-colors", className)}
  >
    {children}
  </motion.div>
);
