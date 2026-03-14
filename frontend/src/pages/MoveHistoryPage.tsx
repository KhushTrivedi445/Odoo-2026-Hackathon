import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const movements = [
  { date: "2026-03-14", type: "Receipt", product: "Steel Bolts", sku: "SKU-001", qty: 500, from: "Supplier A", to: "WH-A" },
  { date: "2026-03-14", type: "Transfer", product: "LED Panels", sku: "SKU-042", qty: 100, from: "WH-A", to: "WH-B" },
  { date: "2026-03-13", type: "Delivery", product: "Power Cables", sku: "SKU-018", qty: 200, from: "WH-B", to: "Customer X" },
  { date: "2026-03-13", type: "Adjustment", product: "Circuit Boards", sku: "SKU-007", qty: -5, from: "WH-C", to: "—" },
  { date: "2026-03-12", type: "Receipt", product: "Copper Wire", sku: "SKU-055", qty: 1000, from: "Supplier B", to: "WH-A" },
  { date: "2026-03-11", type: "Transfer", product: "Office Chairs", sku: "SKU-004", qty: 10, from: "WH-A", to: "WH-C" },
  { date: "2026-03-10", type: "Delivery", product: "Thermal Paste", sku: "SKU-005", qty: 50, from: "WH-A", to: "Customer Y" },
];

const MoveHistoryPage = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = movements.filter(m =>
    (typeFilter === "All" || m.type === typeFilter) &&
    (m.product.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase()))
  );

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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow className="table-sticky-header">
            <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Product</TableHead>
            <TableHead>SKU</TableHead><TableHead>Qty</TableHead><TableHead>From</TableHead><TableHead>To</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((m, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                <TableCell className="text-sm">{m.date}</TableCell>
                <TableCell><StatusBadge status={m.type} /></TableCell>
                <TableCell className="font-medium">{m.product}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{m.sku}</TableCell>
                <TableCell>{m.qty}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.from}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{m.to}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default MoveHistoryPage;
