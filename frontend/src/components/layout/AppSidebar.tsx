import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, FileInput, Truck, ArrowLeftRight,
  ClipboardList, History, Settings, User, Box, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Receipts", icon: FileInput, path: "/receipts" },
  { label: "Delivery Orders", icon: Truck, path: "/deliveries" },
  { label: "Transfers", icon: ArrowLeftRight, path: "/transfers" },
  { label: "Adjustments", icon: ClipboardList, path: "/adjustments" },
  { label: "Move History", icon: History, path: "/move-history" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Profile", icon: User, path: "/profile" },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 bottom-0 z-40 glass-panel border-r flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b border-border/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Box className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-foreground text-sm"
          >
            CoreInventory
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="h-12 flex items-center justify-center border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};
