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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
import api from "../services/api";

interface Adjustment {
  id: number; 
  product_id: number; 
  warehouse_id: number; 
  system_stock: number; 
  counted_stock: number; 
  reason: string; 
  status: string;
  created_at: string;
}

interface Warehouse { id: number; name: string; }
interface Product { id: number; name: string; sku: string; stock: number; }

const AdjustmentsPage = () => {
  const { isManager } = useRole();
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: 0, warehouse_id: 0, system_stock: 0, counted_stock: 0, reason: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adjRes, whRes, prodRes] = await Promise.all([
        api.get("/adjustments"),
        api.get("/warehouses"),
        api.get("/products")
      ]);
      setAdjustments(adjRes.data);
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
    if (!form.product_id || !form.warehouse_id) { 
      toast.error("Fill required fields"); 
      return; 
    }
    
    const payload = {
      product_id: form.product_id,
      warehouse_id: form.warehouse_id,
      system_stock: form.system_stock,
      counted_stock: form.counted_stock,
      reason: form.reason
    };
    
    try {
      await api.post("/adjustments", payload);
      setDialogOpen(false);
      toast.success("Adjustment created and applied");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create adjustment");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Inventory Adjustments" description="Correct stock discrepancies" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ product_id: products[0]?.id || 0, warehouse_id: warehouses[0]?.id || 0, system_stock: products[0]?.stock || 0, counted_stock: 0, reason: "" }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Adjustment</Button> : undefined
      } />
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading adjustments...</p>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Product</TableHead><TableHead>Warehouse</TableHead>
            <TableHead>System</TableHead><TableHead>Counted</TableHead><TableHead>Diff</TableHead>
            <TableHead>Reason</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {adjustments.map((a, i) => {
              const prod = products.find(p => p.id === a.product_id);
              return (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">ADJ-{String(a.id).padStart(3, "0")}</TableCell>
                <TableCell className="font-medium">{prod ? prod.name : `Product #${a.product_id}`}</TableCell>
                <TableCell className="text-sm text-muted-foreground">Warehouse #{a.warehouse_id}</TableCell>
                <TableCell>{a.system_stock}</TableCell>
                <TableCell>{a.counted_stock}</TableCell>
                <TableCell className={a.counted_stock - a.system_stock < 0 ? "text-destructive" : "text-success"}>{a.counted_stock - a.system_stock}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.reason}</TableCell>
                <TableCell><StatusBadge status={a.status || "Applied"} /></TableCell>
              </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <Select value={form.product_id ? form.product_id.toString() : ""} onValueChange={v => {
                const prod = products.find(p => p.id === Number(v));
                setForm(f => ({ ...f, product_id: Number(v), system_stock: prod?.stock || 0 }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select value={form.warehouse_id ? form.warehouse_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, warehouse_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>System Stock</Label><Input type="number" disabled value={form.system_stock} /></div>
              <div><Label>Counted Stock</Label><Input type="number" min="0" value={form.counted_stock} onChange={e => setForm(f => ({ ...f, counted_stock: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create & Apply</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdjustmentsPage;
