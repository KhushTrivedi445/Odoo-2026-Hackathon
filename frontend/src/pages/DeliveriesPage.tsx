import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";

interface Delivery {
  id: string; customer: string; warehouse: string; date: string; status: "Draft" | "Picking" | "Packed" | "Done";
}

const initial: Delivery[] = [
  { id: "DEL-001", customer: "Customer X", warehouse: "WH-A", date: "2026-03-14", status: "Draft" },
  { id: "DEL-002", customer: "Customer Y", warehouse: "WH-B", date: "2026-03-13", status: "Picking" },
  { id: "DEL-003", customer: "Customer Z", warehouse: "WH-A", date: "2026-03-12", status: "Done" },
];

const nextStatus: Record<string, Delivery["status"]> = { Draft: "Picking", Picking: "Packed", Packed: "Done" };

const DeliveriesPage = () => {
  const { isManager } = useRole();
  const [items, setItems] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", warehouse: "WH-A" });

  const handleCreate = () => {
    if (!form.customer) { toast.error("Enter customer"); return; }
    setItems(prev => [...prev, { id: `DEL-${String(prev.length + 1).padStart(3, "0")}`, customer: form.customer, warehouse: form.warehouse, date: new Date().toISOString().slice(0, 10), status: "Draft" }]);
    setDialogOpen(false);
    toast.success("Delivery created");
  };

  const advance = (id: string) => {
    setItems(prev => prev.map(d => d.id === id && d.status !== "Done" ? { ...d, status: nextStatus[d.status] } : d));
    toast.success("Status updated");
  };

  return (
    <div className="page-container">
      <PageHeader title="Delivery Orders" description="Outgoing stock to customers" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ customer: "", warehouse: "WH-A" }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Delivery</Button> : undefined
      } />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Warehouse</TableHead>
            <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">{d.id}</TableCell>
                <TableCell>{d.customer}</TableCell>
                <TableCell className="text-muted-foreground">{d.warehouse}</TableCell>
                <TableCell className="text-sm">{d.date}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell>
                  {/* Staff CAN advance workflow, only create is restricted */}
                  {d.status !== "Done" && <Button variant="outline" size="sm" onClick={() => advance(d.id)}>Advance</Button>}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Delivery Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Customer</Label><Input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} /></div>
            <div><Label>Warehouse</Label><Input value={form.warehouse} onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveriesPage;
