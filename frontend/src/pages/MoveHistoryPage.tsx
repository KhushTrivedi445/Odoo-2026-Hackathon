import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import api from "../services/api";

const MoveHistoryPage = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mov, prod] = await Promise.all([
          api.get("/stock-movements"),
          api.get("/products")
        ]);
        setMovements(mov.data);
        setProducts(prod.data);
      } catch (err) {
        console.error("Failed to load move history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProductName = (id: number) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : `Product #${id}`;
  };

  const filtered = movements.filter(m => {
    const prodName = getProductName(m.product_id);
    return (typeFilter === "All" || m.movement_type === typeFilter) &&
           (prodName.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="page-container">
      <PageHeader title="Move History" description="Complete stock movement ledger" />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or SKU..." className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "Receipt", "Transfer", "Delivery", "Adjustment"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading stock movements...</p>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Details</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((m, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="text-sm">{new Date(m.created_at).toLocaleString()}</TableCell>
                <TableCell><StatusBadge status={m.movement_type} /></TableCell>
                <TableCell className="font-medium">{getProductName(m.product_id)}</TableCell>
                <TableCell className={m.quantity < 0 ? "text-destructive" : ""}>{m.quantity}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.reference || "—"}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      )}
    </div>
  );
};

export default MoveHistoryPage;
