import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
import api from "../services/api";

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  reorder_level: number;
  stock: number;
  warehouse_id: number;
  warehouse?: Warehouse;
}

const rackCapacities: Record<string, number> = {
  "A-1": 2000, "A-2": 2000, "B-1": 1500, "B-2": 1500, "C-1": 1000,
};

// Removed initialProducts mockup

const categories = ["All", "Hardware", "Electronics", "Raw Materials", "Furniture", "Consumables"];

const ProductsPage = () => {
  const { isManager } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", category: "Hardware", unit: "pcs", reorder_level: 10, warehouse_id: 0, stock: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, whRes] = await Promise.all([
        api.get("/products"),
        api.get("/warehouses")
      ]);
      setProducts(prodRes.data);
      setWarehouses(whRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalStock = (p: Product) => p.stock;

  const filtered = products.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    (p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ sku: "", name: "", category: "Hardware", unit: "pcs", reorder_level: 10, warehouse_id: warehouses[0]?.id || 0, stock: 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ 
      sku: p.sku, name: p.name, category: p.category, unit: p.unit, 
      reorder_level: p.reorder_level, warehouse_id: p.warehouse_id, stock: p.stock 
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.sku || !form.name || !form.category || !form.unit) { toast.error("Fill required fields (SKU, Name, Category, Unit)"); return; }
    if (Number(form.stock) < 0) { toast.error("Stock cannot be negative"); return; }
    if (!form.warehouse_id) { toast.error("Please select a warehouse"); return; }

    const payload = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      unit: form.unit,
      reorder_level: Number(form.reorder_level),
      stock: Number(form.stock),
      warehouse_id: Number(form.warehouse_id)
    };

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Product save error:", error.response?.data || error);
      toast.error(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete product");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Products" description="Manage your product catalog" action={
        isManager ? <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Product</Button> : undefined
      } />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU or name..." className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="table-sticky-header">
              <TableHead>SKU</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
              <TableHead>Unit</TableHead><TableHead>Stock</TableHead><TableHead>Reorder Level</TableHead>
              {isManager && <TableHead className="w-20">Actions</TableHead>}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => {
              const stock = p.stock || 0;
              const isLow = stock <= p.reorder_level;
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.unit}</TableCell>
                  <TableCell className={isLow ? "text-warning font-medium" : ""}>{stock}{isLow && " ⚠️"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.reorder_level}</TableCell>
                  {isManager && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailProduct(p)}>
                      <MapPin className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div><Label>Reorder Level</Label><Input type="number" min="0" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: Number(e.target.value) }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Warehouse</Label>
                <Select value={form.warehouse_id ? form.warehouse_id.toString() : ""} onValueChange={v => setForm(f => ({ ...f, warehouse_id: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Select a warehouse" /></SelectTrigger>
                  <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Current Stock</Label><Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value === '' ? 0 : Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Stock Availability — {detailProduct?.name}</DialogTitle></DialogHeader>
          {detailProduct && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">SKU: {detailProduct.sku} · Category: {detailProduct.category}</div>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Warehouse</TableHead><TableHead>Qty</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                     <TableCell>{detailProduct.warehouse?.name || `Warehouse #${detailProduct.warehouse_id}`}</TableCell>
                     <TableCell>{detailProduct.stock}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t border-border">
                    <TableCell>Total</TableCell>
                    <TableCell>{totalStock(detailProduct)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {totalStock(detailProduct) <= detailProduct.reorder_level && (
                <div className="text-warning text-sm font-medium">⚠️ Low Stock: {detailProduct.name} — Current: {totalStock(detailProduct)}, Reorder Level: {detailProduct.reorder_level}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
