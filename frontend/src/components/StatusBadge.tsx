import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  waiting: "bg-warning/10 text-warning",
  picking: "bg-warning/10 text-warning",
  packed: "bg-primary/10 text-primary",
  done: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  applied: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground")}>
    {status}
  </span>
);
