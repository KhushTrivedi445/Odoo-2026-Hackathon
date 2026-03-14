import { useState, useEffect } from "react";
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
import api from "../services/api";

interface Transfer {
  id: number; 
  product_id: number; 
  from_warehouse_id: number; 
  to_warehouse_id: number; 
  quantity: number; 
  status: "Pending" | "Completed";
  created_at: string;
}

interface Warehouse { id: number; name: string; }
interface Product { id: number; name: string; sku: string; }

const TransfersPage = () => {
  const { isManager } = useRole();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: 0, from_warehouse_id: 0, to_warehouse_id: 0, quantity: 1 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trfRes, whRes, prodRes] = await Promise.all([
        api.get("/transfers"),
        api.get("/warehouses"),
        api.get("/products")
      ]);
      setTransfers(trfRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.product_id || !form.from_warehouse_id || !form.to_warehouse_id || form.quantity <= 0) { 
      toast.error("Enter valid details"); 
      return; 
    }

    if (form.from_warehouse_id === form.to_warehouse_id) {
      toast.error("Source and destination warehouses must be different");
      return;
    }
    
    const payload = {
      product_id: form.product_id,
      from_warehouse_id: form.from_warehouse_id,
      to_warehouse_id: form.to_warehouse_id,
      quantity: form.quantity
    };
    
    try {
      await api.post("/transfers", payload);
      setDialogOpen(false);
      toast.success("Transfer created");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create transfer");
    }
  };

  const confirm = async (id: number) => {
    try {
      await api.put(`/transfers/${id}/confirm`);
      toast.success("Transfer confirmed");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to confirm transfer");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Transfers" description="Move inventory between warehouses" action={
        <Button size="sm" onClick={() => { setForm({ product_id: products[0]?.id || 0, from_warehouse_id: warehouses[0]?.id || 0, to_warehouse_id: warehouses[1]?.id || warehouses[0]?.id || 0, quantity: 1 }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Transfer</Button>
      } />
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading transfers...</p>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Product</TableHead><TableHead>From</TableHead>
            <TableHead>To</TableHead><TableHead>Qty</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {transfers.map((t, i) => {
              const prod = products.find(p => p.id === t.product_id);
              const fromWh = warehouses.find(w => w.id === t.from_warehouse_id);
              const toWh = warehouses.find(w => w.id === t.to_warehouse_id);
              return (
              <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">TRF-{String(t.id).padStart(3, "0")}</TableCell>
                <TableCell className="font-medium">{prod ? prod.name : `Product #${t.product_id}`}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fromWh ? fromWh.name : `WH #${t.from_warehouse_id}`}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{toWh ? toWh.name : `WH #${t.to_warehouse_id}`}</TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell>{t.status === "Pending" && <Button variant="outline" size="sm" onClick={() => confirm(t.id)}>Confirm</Button>}</TableCell>
              </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Transfer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <Select value={form.product_id ? form.product_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, product_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From Warehouse</Label>
                <Select value={form.from_warehouse_id ? form.from_warehouse_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, from_warehouse_id: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Warehouse</Label>
                <Select value={form.to_warehouse_id ? form.to_warehouse_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, to_warehouse_id: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Quantity</Label><Input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransfersPage;
