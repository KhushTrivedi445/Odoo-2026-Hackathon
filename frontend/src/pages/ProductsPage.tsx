import { useState } from "react";
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

interface LocationStock {
  warehouse: string;
  rack: string;
  qty: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  locations: LocationStock[];
}

const rackCapacities: Record<string, number> = {
  "A-1": 2000, "A-2": 2000, "B-1": 1500, "B-2": 1500, "C-1": 1000,
};

const initialProducts: Product[] = [
  { id: "1", sku: "SKU-001", name: "Steel Bolts", category: "Hardware", unit: "pcs", reorderLevel: 100, locations: [{ warehouse: "WH-A", rack: "A-1", qty: 1200 }, { warehouse: "WH-A", rack: "A-2", qty: 300 }] },
  { id: "2", sku: "SKU-002", name: "LED Panel 60x60", category: "Electronics", unit: "pcs", reorderLevel: 10, locations: [{ warehouse: "WH-B", rack: "B-1", qty: 45 }] },
  { id: "3", sku: "SKU-003", name: "Copper Wire 2.5mm", category: "Raw Materials", unit: "m", reorderLevel: 500, locations: [{ warehouse: "WH-A", rack: "A-1", qty: 2000 }, { warehouse: "WH-B", rack: "B-2", qty: 1200 }] },
  { id: "4", sku: "SKU-004", name: "Office Chair Pro", category: "Furniture", unit: "pcs", reorderLevel: 5, locations: [{ warehouse: "WH-C", rack: "C-1", qty: 8 }] },
  { id: "5", sku: "SKU-005", name: "Thermal Paste", category: "Consumables", unit: "tubes", reorderLevel: 20, locations: [{ warehouse: "WH-B", rack: "B-1", qty: 120 }] },
  { id: "6", sku: "SKU-006", name: "Circuit Board v3", category: "Electronics", unit: "pcs", reorderLevel: 50, locations: [{ warehouse: "WH-A", rack: "A-2", qty: 340 }] },
];

const categories = ["All", "Hardware", "Electronics", "Raw Materials", "Furniture", "Consumables"];
const warehouses = ["WH-A", "WH-B", "WH-C"];
const racksByWarehouse: Record<string, string[]> = {
  "WH-A": ["A-1", "A-2"],
  "WH-B": ["B-1", "B-2"],
  "WH-C": ["C-1"],
};

const ProductsPage = () => {
  const { isManager } = useRole();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", category: "Hardware", unit: "pcs", reorderLevel: 10, warehouse: "WH-A", rack: "A-1", stock: 0 });

  const totalStock = (p: Product) => p.locations.reduce((s, l) => s + l.qty, 0);

  const filtered = products.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    (p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ sku: "", name: "", category: "Hardware", unit: "pcs", reorderLevel: 10, warehouse: "WH-A", rack: "A-1", stock: 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    const loc = p.locations[0] || { warehouse: "WH-A", rack: "A-1", qty: 0 };
    setForm({ sku: p.sku, name: p.name, category: p.category, unit: p.unit, reorderLevel: p.reorderLevel, warehouse: loc.warehouse, rack: loc.rack, stock: totalStock(p) });
    setDialogOpen(true);
  };

  const getRackUsage = (rack: string, excludeProductId?: string) => {
    return products.reduce((sum, p) => {
      if (excludeProductId && p.id === excludeProductId) return sum;
      return sum + p.locations.filter(l => l.rack === rack).reduce((s, l) => s + l.qty, 0);
    }, 0);
  };

  const handleSave = () => {
    if (!form.sku || !form.name) { toast.error("Fill required fields"); return; }

    const capacity = rackCapacities[form.rack] || 1000;
    const currentUsage = getRackUsage(form.rack, editing?.id);
    if (currentUsage + form.stock > capacity) {
      toast.error("This rack is full. Please choose another rack.");
      return;
    }

    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? {
        ...p, sku: form.sku, name: form.name, category: form.category, unit: form.unit, reorderLevel: form.reorderLevel,
        locations: [{ warehouse: form.warehouse, rack: form.rack, qty: form.stock }],
      } : p));
      toast.success("Product updated");
    } else {
      setProducts(prev => [...prev, {
        id: Date.now().toString(), sku: form.sku, name: form.name, category: form.category, unit: form.unit, reorderLevel: form.reorderLevel,
        locations: [{ warehouse: form.warehouse, rack: form.rack, qty: form.stock }],
      }]);
      toast.success("Product created");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success("Product deleted");
  };

  const availableRacks = racksByWarehouse[form.warehouse] || [];

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
              const stock = totalStock(p);
              const isLow = stock <= p.reorderLevel;
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.unit}</TableCell>
                  <TableCell className={isLow ? "text-warning font-medium" : ""}>{stock}{isLow && " ⚠️"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.reorderLevel}</TableCell>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
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
            <div><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Warehouse</Label>
                <Select value={form.warehouse} onValueChange={v => setForm(f => ({ ...f, warehouse: v, rack: racksByWarehouse[v]?.[0] || "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{warehouses.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Rack</Label>
                <Select value={form.rack} onValueChange={v => setForm(f => ({ ...f, rack: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{availableRacks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Availability Detail Dialog */}
      <Dialog open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Stock Availability — {detailProduct?.name}</DialogTitle></DialogHeader>
          {detailProduct && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">SKU: {detailProduct.sku} · Category: {detailProduct.category}</div>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Warehouse</TableHead><TableHead>Rack</TableHead><TableHead>Qty</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {detailProduct.locations.map((loc, i) => (
                    <TableRow key={i}>
                      <TableCell>{loc.warehouse}</TableCell>
                      <TableCell>{loc.rack}</TableCell>
                      <TableCell>{loc.qty}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t border-border">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell>{totalStock(detailProduct)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {totalStock(detailProduct) <= detailProduct.reorderLevel && (
                <div className="text-warning text-sm font-medium">⚠️ Low Stock: {detailProduct.name} — Current: {totalStock(detailProduct)}, Reorder Level: {detailProduct.reorderLevel}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
