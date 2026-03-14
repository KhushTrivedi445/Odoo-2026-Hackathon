import { useAuth } from "@/contexts/AuthContext";

export const useRole = () => {
  const { user } = useAuth();
  const role = user?.role || "Staff";
  const isManager = role === "Manager";
  const isStaff = role === "Staff";
  return { role, isManager, isStaff };
};
