import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, AlertTriangle, FileInput, Truck, ArrowLeftRight } from "lucide-react";
import { AnimatedCard } from "@/components/AnimatedCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const kpis = [
  { label: "Total Products", value: 248, icon: Package, path: "/products", color: "text-primary" },
  { label: "Low Stock Items", value: 12, icon: AlertTriangle, path: "/products?filter=low", color: "text-warning" },
  { label: "Pending Receipts", value: 5, icon: FileInput, path: "/receipts", color: "text-success" },
  { label: "Pending Deliveries", value: 8, icon: Truck, path: "/deliveries", color: "text-destructive" },
  { label: "Internal Transfers", value: 3, icon: ArrowLeftRight, path: "/transfers", color: "text-primary" },
];

const barData = [
  { name: "WH-A", stock: 1240 }, { name: "WH-B", stock: 890 },
  { name: "WH-C", stock: 650 }, { name: "WH-D", stock: 430 },
];

const pieData = [
  { name: "Electronics", value: 35 }, { name: "Furniture", value: 25 },
  { name: "Consumables", value: 20 }, { name: "Raw Materials", value: 20 },
];
const COLORS = ["hsl(239,84%,67%)", "hsl(160,84%,39%)", "hsl(38,92%,50%)", "hsl(240,5%,65%)"];

const recentActivity = [
  { date: "2026-03-14", type: "Receipt", product: "Steel Bolts", sku: "SKU-001", qty: 500, from: "Supplier A", to: "WH-A" },
  { date: "2026-03-14", type: "Transfer", product: "LED Panels", sku: "SKU-042", qty: 100, from: "WH-A", to: "WH-B" },
  { date: "2026-03-13", type: "Delivery", product: "Power Cables", sku: "SKU-018", qty: 200, from: "WH-B", to: "Customer X" },
  { date: "2026-03-13", type: "Adjustment", product: "Circuit Boards", sku: "SKU-007", qty: -5, from: "WH-C", to: "—" },
  { date: "2026-03-12", type: "Receipt", product: "Copper Wire", sku: "SKU-055", qty: 1000, from: "Supplier B", to: "WH-A" },
];

const lowStockAlerts = [
  { name: "Steel Rod", currentStock: 3, reorderLevel: 10 },
  { name: "Thermal Paste", currentStock: 8, reorderLevel: 20 },
  { name: "Office Chair Pro", currentStock: 2, reorderLevel: 5 },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <PageHeader title="Dashboard" description="Overview of your inventory operations" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((k, i) => (
          <AnimatedCard key={k.label} delay={i * 0.05} onClick={() => navigate(k.path)}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center`}>
                <k.icon className={`w-5 h-5 ${k.color}`} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-8"
        >
          <h3 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Low Stock Alerts
          </h3>
          <div className="space-y-1">
            {lowStockAlerts.map((a) => (
              <p key={a.name} className="text-sm text-foreground">
                ⚠️ <span className="font-medium">Low Stock: {a.name}</span> — Current: {a.currentStock}, Reorder Level: {a.reorderLevel}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-lg p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Warehouse Stock Levels</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border/50 rounded-lg p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Inventory Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border/50 rounded-lg"
      >
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Product</TableHead>
              <TableHead>SKU</TableHead><TableHead>Qty</TableHead><TableHead>From</TableHead><TableHead>To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="border-b border-border/30 hover:bg-accent/50 transition-colors"
              >
                <TableCell className="text-sm">{r.date}</TableCell>
                <TableCell><StatusBadge status={r.type} /></TableCell>
                <TableCell className="text-sm font-medium">{r.product}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.sku}</TableCell>
                <TableCell className="text-sm">{r.qty}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.from}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.to}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
