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

interface Receipt {
  id: number; 
  supplier: string; 
  warehouse_id: number; 
  created_at: string; 
  status: "Pending" | "Validated";
}

interface Warehouse { id: number; name: string; }
interface Product { id: number; name: string; sku: string; }

const ReceiptsPage = () => {
  const { isManager } = useRole();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ supplier: "", warehouse_id: 0, product_id: 0, qty: 1 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, whRes, prodRes] = await Promise.all([
        api.get("/receipts"),
        api.get("/warehouses"),
        api.get("/products")
      ]);
      setReceipts(recRes.data);
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
    if (!form.supplier || !form.warehouse_id || !form.product_id || form.qty <= 0) { 
      toast.error("Enter valid details"); 
      return; 
    }
    
    // Construct single-item receipt just to make it easy to demo
    const payload = {
      supplier: form.supplier,
      warehouse_id: form.warehouse_id,
      items: [
        {
          product_id: form.product_id,
          expected_qty: form.qty,
          received_qty: form.qty
        }
      ]
    };
    
    try {
      await api.post("/receipts", payload);
      setDialogOpen(false);
      toast.success("Receipt created");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create receipt");
    }
  };

  const validate = async (id: number) => {
    try {
      await api.put(`/receipts/${id}/validate`);
      toast.success("Receipt validated");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to validate receipt");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Receipts" description="Incoming stock from suppliers" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ supplier: "", warehouse_id: warehouses[0]?.id || 0, product_id: products[0]?.id || 0, qty: 1 }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Receipt</Button> : undefined
      } />
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading receipts...</p>
        </div>
      ) : (
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
                <TableCell className="font-mono text-sm">REC-{String(r.id).padStart(3, "0")}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell className="text-muted-foreground">Warehouse #{r.warehouse_id}</TableCell>
                <TableCell className="text-sm">{new Date(r.created_at).toISOString().split('T')[0]}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell>
                  {r.status === "Pending" && isManager && (
                    <Button variant="outline" size="sm" onClick={() => validate(r.id)}>
                      Validate
                    </Button>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Receipt</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
            <div><Label>Warehouse</Label>
              <Select value={form.warehouse_id ? form.warehouse_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, warehouse_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product</Label>
              <Select value={form.product_id ? form.product_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, product_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptsPage;
