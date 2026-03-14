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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";

interface Transfer {
  id: string; product: string; fromWh: string; fromRack: string; toWh: string; toRack: string; qty: number; status: string;
}

const initial: Transfer[] = [
  { id: "TRF-001", product: "Steel Bolts", fromWh: "WH-A", fromRack: "A-1", toWh: "WH-B", toRack: "B-3", qty: 200, status: "Pending" },
  { id: "TRF-002", product: "LED Panels", fromWh: "WH-B", fromRack: "B-2", toWh: "WH-C", toRack: "C-1", qty: 50, status: "Confirmed" },
];

const TransfersPage = () => {
  const { isManager } = useRole();
  const [items, setItems] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product: "", fromWh: "WH-A", fromRack: "", toWh: "WH-B", toRack: "", qty: 0 });

  const handleCreate = () => {
    if (!form.product || !form.qty) { toast.error("Fill required fields"); return; }
    setItems(prev => [...prev, { id: `TRF-${String(prev.length + 1).padStart(3, "0")}`, ...form, status: "Pending" }]);
    setDialogOpen(false);
    toast.success("Transfer created");
  };

  const confirm = (id: string) => {
    setItems(prev => prev.map(t => t.id === id ? { ...t, status: "Confirmed" } : t));
    toast.success("Transfer confirmed");
  };

  return (
    <div className="page-container">
      <PageHeader title="Transfers" description="Move inventory between warehouses" action={
        <Button size="sm" onClick={() => { setForm({ product: "", fromWh: "WH-A", fromRack: "", toWh: "WH-B", toRack: "", qty: 0 }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Transfer</Button>
      } />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Product</TableHead><TableHead>From</TableHead>
            <TableHead>To</TableHead><TableHead>Qty</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((t, i) => (
              <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">{t.id}</TableCell>
                <TableCell className="font-medium">{t.product}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.fromWh} / {t.fromRack}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.toWh} / {t.toRack}</TableCell>
                <TableCell>{t.qty}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell>{t.status === "Pending" && isManager && <Button variant="outline" size="sm" onClick={() => confirm(t.id)}>Confirm</Button>}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Transfer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Product</Label><Input value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Warehouse</Label><Select value={form.fromWh} onValueChange={v => setForm(f => ({ ...f, fromWh: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="WH-A">WH-A</SelectItem><SelectItem value="WH-B">WH-B</SelectItem><SelectItem value="WH-C">WH-C</SelectItem></SelectContent></Select></div>
              <div><Label>From Rack</Label><Input value={form.fromRack} onChange={e => setForm(f => ({ ...f, fromRack: e.target.value }))} placeholder="A-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>To Warehouse</Label><Select value={form.toWh} onValueChange={v => setForm(f => ({ ...f, toWh: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="WH-A">WH-A</SelectItem><SelectItem value="WH-B">WH-B</SelectItem><SelectItem value="WH-C">WH-C</SelectItem></SelectContent></Select></div>
              <div><Label>To Rack</Label><Input value={form.toRack} onChange={e => setForm(f => ({ ...f, toRack: e.target.value }))} placeholder="B-3" /></div>
            </div>
            <div><Label>Quantity</Label><Input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransfersPage;
