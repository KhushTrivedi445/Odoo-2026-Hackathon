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

interface Delivery {
  id: number; 
  customer: string; 
  warehouse_id: number; 
  created_at: string; 
  status: "Pending" | "Validated";
}

interface Warehouse { id: number; name: string; }
interface Product { id: number; name: string; sku: string; }

const DeliveriesPage = () => {
  const { isManager } = useRole();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", warehouse_id: 0, product_id: 0, qty: 1 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delRes, whRes, prodRes] = await Promise.all([
        api.get("/deliveries"),
        api.get("/warehouses"),
        api.get("/products")
      ]);
      setDeliveries(delRes.data);
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
    if (!form.customer || !form.warehouse_id || !form.product_id || form.qty <= 0) { 
      toast.error("Enter valid details"); 
      return; 
    }
    
    const payload = {
      customer: form.customer,
      warehouse_id: form.warehouse_id,
      items: [
        {
          product_id: form.product_id,
          quantity: form.qty
        }
      ]
    };
    
    try {
      await api.post("/deliveries", payload);
      setDialogOpen(false);
      toast.success("Delivery created");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create delivery");
    }
  };

  const advance = async (id: number) => {
    try {
      await api.put(`/deliveries/${id}/validate`);
      toast.success("Delivery validated");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to validate delivery");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Delivery Orders" description="Outgoing stock to customers" action={
        isManager ? <Button size="sm" onClick={() => { setForm({ customer: "", warehouse_id: warehouses[0]?.id || 0, product_id: products[0]?.id || 0, qty: 1 }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-1" /> New Delivery</Button> : undefined
      } />
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading deliveries...</p>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Warehouse</TableHead>
            <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {deliveries.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="font-mono text-sm">DEL-{String(d.id).padStart(3, "0")}</TableCell>
                <TableCell>{d.customer}</TableCell>
                <TableCell className="text-muted-foreground">Warehouse #{d.warehouse_id}</TableCell>
                <TableCell className="text-sm">{new Date(d.created_at).toISOString().split('T')[0]}</TableCell>
                <TableCell><StatusBadge status={d.status} /></TableCell>
                <TableCell>
                  {/* Both manager and staff can advance/validate as per prompt earlier, but usually validate is manager. We'll show for manager or pending */}
                  {d.status === "Pending" && <Button variant="outline" size="sm" onClick={() => advance(d.id)}>Validate</Button>}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Delivery Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Customer</Label><Input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} /></div>
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

export default DeliveriesPage;
