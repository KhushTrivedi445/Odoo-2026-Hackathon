import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { motion } from "framer-motion";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
