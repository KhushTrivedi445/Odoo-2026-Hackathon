import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, AlertTriangle, FileInput, Truck, ArrowLeftRight } from "lucide-react";
import { AnimatedCard } from "@/components/AnimatedCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "../services/api";
import { toast } from "sonner";

const COLORS = ["hsl(239,84%,67%)", "hsl(160,84%,39%)", "hsl(38,92%,50%)", "hsl(240,5%,65%)"];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Dashboard state
  const [kpiData, setKpiData] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfers: 0
  });
  
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // GET /dashboard
        const response = await api.get("/dashboard");
        const data = response.data;
        
        setKpiData({
          totalProducts: data.total_products || 0,
          lowStockItems: data.low_stock_items?.length || 0,
          pendingReceipts: data.pending_receipts || 0,
          pendingDeliveries: data.pending_deliveries || 0,
          internalTransfers: data.internal_transfers || 0
        });
        
        // Map backend data for Pie chart
        setPieData(data.stock_by_category || []);
        
        // Set Low Stock Alerts
        const mappedAlerts = (data.low_stock_items || []).map((item: any) => ({
          name: item.name,
          currentStock: item.stock,
          reorderLevel: item.reorder_level
        }));
        setLowStockAlerts(mappedAlerts);

        // GET /stock-movements for recent activity
        const movementsRes = await api.get("/stock-movements");
        const movements = movementsRes.data || [];
        const mappedActivity = movements.slice(0, 5).map((m: any) => ({
          date: new Date(m.created_at).toISOString().split('T')[0],
          type: m.movement_type,
          product: m.product?.name || `Product #${m.product_id}`,
          sku: m.product?.sku || "N/A",
          qty: m.quantity,
          from: m.from_location || "—",
          to: m.to_location || "—"
        }));
        setRecentActivity(mappedActivity);
        
        // Real warehouse breakdown from backend
        setBarData(data.stock_by_warehouse || []);
        
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const kpis = [
    { label: "Total Products", value: kpiData.totalProducts, icon: Package, path: "/products", color: "text-primary" },
    { label: "Low Stock Items", value: kpiData.lowStockItems, icon: AlertTriangle, path: "/products?filter=low", color: "text-warning" },
    { label: "Pending Receipts", value: kpiData.pendingReceipts, icon: FileInput, path: "/receipts", color: "text-success" },
    { label: "Pending Deliveries", value: kpiData.pendingDeliveries, icon: Truck, path: "/deliveries", color: "text-destructive" },
    { label: "Internal Transfers", value: kpiData.internalTransfers, icon: ArrowLeftRight, path: "/transfers", color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Dashboard" description="Overview of your inventory operations" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
