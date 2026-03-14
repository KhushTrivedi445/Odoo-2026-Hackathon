import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Box, Package, Truck, ArrowLeftRight, BarChart3, Bell, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: BarChart3, title: "Real-Time Tracking", desc: "Monitor stock levels across all warehouses with live updates." },
  { icon: Package, title: "Warehouse & Rack Management", desc: "Organize inventory with structured warehouse and rack systems." },
  { icon: Bell, title: "Smart Stock Alerts", desc: "Get notified when items fall below minimum thresholds." },
  { icon: Truck, title: "Automated Deliveries", desc: "Streamline outbound logistics with automated delivery workflows." },
  { icon: Shield, title: "Stock Movement History", desc: "Full audit trail of every inventory transaction." },
];

const HeroAnimation = () => (
  <div className="relative w-full max-w-lg mx-auto h-64">
    {/* Dashed path */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 250">
      <motion.path
        d="M 50 200 Q 150 50 250 125 Q 350 200 450 80"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeDasharray="8 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
    {/* Floating icons */}
    {[
      { Icon: Package, x: 40, y: 170, delay: 0.5, label: "Receive" },
      { Icon: Box, x: 210, y: 90, delay: 1, label: "Store" },
      { Icon: ArrowLeftRight, x: 310, y: 160, delay: 1.5, label: "Transfer" },
      { Icon: Truck, x: 420, y: 50, delay: 2, label: "Deliver" },
    ].map(({ Icon, x, y, delay, label }, i) => (
      <motion.div
        key={i}
        className="absolute flex flex-col items-center gap-1"
        style={{ left: x, top: y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { delay, duration: 0.4 },
          scale: { delay, duration: 0.4 },
          y: { delay: delay + 0.5, duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </motion.div>
    ))}
  </div>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Box className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="font-bold text-foreground">CoreInventory</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary mb-3">
              Inventory Management System
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Smart Inventory for{" "}
              <span className="text-primary">Modern Warehouses</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-muted-foreground max-w-lg">
              Replace Excel spreadsheets and manual stock tracking with a real-time inventory platform. 
              Track, transfer, and deliver — all in one place.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="rounded-lg">
                  <Zap className="w-4 h-4 mr-2" /> Get Started
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="outline" size="lg" className="rounded-lg">Sign In</Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground">
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-2">
              A complete toolkit for inventory operations.
            </motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-card border border-border/50 rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground">
            Start Managing Your Inventory Today
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-3 mb-8">
            Join teams already using CoreInventory to streamline their warehouse operations.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex gap-3 justify-center">
            <Link to="/auth/signup">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 CoreInventory</span>
          <span>Built for modern warehouses</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
