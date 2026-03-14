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

interface Receipt {
  id: string; supplier: string; warehouse: string; date: string; status: "Draft" | "Waiting" | "Done";
}

const initialReceipts: Receipt[] = [
  { id: "REC-001", supplier: "Supplier A", warehouse: "WH-A", date: "2026-03-14", status: "Draft" },
  { id: "REC-002", supplier: "Supplier B", warehouse: "WH-B", date: "2026-03-13", status: "Waiting" },
  { id: "REC-003", supplier: "Supplier A", warehouse: "WH-A", date: "2026-03-12", status: "Done" },
];

const ReceiptsPage = () => {
  const { isManager } = useRole();
  const [receipts, setReceipts] = useState(initialReceipts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ supplier: "", warehouse: "WH-A" });

  const handleCreate = () => {
    if (!form.supplier) { toast.error("Enter supplier"); return; }
    setReceipts(prev => [...prev, {
      id: `REC-${String(prev.length + 1).padStart(3, "0")}`,
      supplier: form.supplier, warehouse: form.warehouse,
      date: new Date().toISOString().slice(0, 10), status: "Draft",
    }]);
    setDialogOpen(false);
    toast.success("Receipt created");
  };

  const validate = (id: string) => {
    setReceipts(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = r.status === "Draft" ? "Waiting" : "Done";
      return { ...r, status: next as Receipt["status"] };
    }));
    toast.success("Status updated");
  };

  return (
    <div className="page-container">
      <PageHeader title="Receipts" description="Incoming stock from suppliers" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ supplier: "", warehouse: "WH-A" }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Receipt</Button> : undefined
      } />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Supplier</TableHead><TableHead>Warehouse</TableHead>
            <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {receipts.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">{r.id}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell className="text-muted-foreground">{r.warehouse}</TableCell>
                <TableCell className="text-sm">{r.date}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell>
                  {r.status !== "Done" && isManager && (
                    <Button variant="outline" size="sm" onClick={() => validate(r.id)}>
                      {r.status === "Draft" ? "Submit" : "Confirm"}
                    </Button>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Receipt</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
            <div><Label>Warehouse</Label>
              <Select value={form.warehouse} onValueChange={v => setForm(f => ({ ...f, warehouse: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="WH-A">WH-A</SelectItem><SelectItem value="WH-B">WH-B</SelectItem><SelectItem value="WH-C">WH-C</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptsPage;
