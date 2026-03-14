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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";

interface Adjustment {
  id: string; product: string; warehouse: string; rack: string; systemStock: number; countedStock: number; reason: string; status: string;
}

const initial: Adjustment[] = [
  { id: "ADJ-001", product: "Steel Bolts", warehouse: "WH-A", rack: "A-1", systemStock: 1500, countedStock: 1485, reason: "Damaged items", status: "Pending" },
  { id: "ADJ-002", product: "LED Panels", warehouse: "WH-B", rack: "B-2", systemStock: 45, countedStock: 45, reason: "Audit check", status: "Applied" },
];

const AdjustmentsPage = () => {
  const { isManager } = useRole();
  const [items, setItems] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product: "", warehouse: "WH-A", rack: "", systemStock: 0, countedStock: 0, reason: "" });

  const handleCreate = () => {
    if (!form.product) { toast.error("Fill required fields"); return; }
    setItems(prev => [...prev, { id: `ADJ-${String(prev.length + 1).padStart(3, "0")}`, ...form, status: "Pending" }]);
    setDialogOpen(false);
    toast.success("Adjustment created");
  };

  const apply = (id: string) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, status: "Applied" } : a));
    toast.success("Adjustment applied");
  };

  return (
    <div className="page-container">
      <PageHeader title="Inventory Adjustments" description="Correct stock discrepancies" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ product: "", warehouse: "WH-A", rack: "", systemStock: 0, countedStock: 0, reason: "" }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Adjustment</Button> : undefined
      } />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Product</TableHead><TableHead>Location</TableHead>
            <TableHead>System</TableHead><TableHead>Counted</TableHead><TableHead>Diff</TableHead>
            <TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">{a.id}</TableCell>
                <TableCell className="font-medium">{a.product}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.warehouse} / {a.rack}</TableCell>
                <TableCell>{a.systemStock}</TableCell>
                <TableCell>{a.countedStock}</TableCell>
                <TableCell className={a.countedStock - a.systemStock < 0 ? "text-destructive" : "text-success"}>{a.countedStock - a.systemStock}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.reason}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell>
                  {a.status === "Pending" && isManager && <Button variant="outline" size="sm" onClick={() => apply(a.id)}>Apply</Button>}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Product</Label><Input value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Warehouse</Label><Input value={form.warehouse} onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))} /></div>
              <div><Label>Rack</Label><Input value={form.rack} onChange={e => setForm(f => ({ ...f, rack: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>System Stock</Label><Input type="number" value={form.systemStock} onChange={e => setForm(f => ({ ...f, systemStock: Number(e.target.value) }))} /></div>
              <div><Label>Counted Stock</Label><Input type="number" value={form.countedStock} onChange={e => setForm(f => ({ ...f, countedStock: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdjustmentsPage;
