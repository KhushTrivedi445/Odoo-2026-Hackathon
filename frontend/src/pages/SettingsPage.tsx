import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";

interface Warehouse { id: string; name: string; location: string; }
interface Rack { id: string; name: string; warehouse: string; }

const SettingsPage = () => {
  const { isManager } = useRole();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: "1", name: "WH-A", location: "Building A, Floor 1" },
    { id: "2", name: "WH-B", location: "Building B, Floor 2" },
    { id: "3", name: "WH-C", location: "Building C, Floor 1" },
  ]);
  const [racks, setRacks] = useState<Rack[]>([
    { id: "1", name: "A-1", warehouse: "WH-A" },
    { id: "2", name: "A-2", warehouse: "WH-A" },
    { id: "3", name: "B-1", warehouse: "WH-B" },
    { id: "4", name: "B-2", warehouse: "WH-B" },
    { id: "5", name: "C-1", warehouse: "WH-C" },
  ]);

  const [whDialog, setWhDialog] = useState(false);
  const [rackDialog, setRackDialog] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", location: "" });
  const [rackForm, setRackForm] = useState({ name: "", warehouse: "WH-A" });

  return (
    <div className="page-container">
      <PageHeader title="Settings" description="Manage warehouses and racks" />

      <Tabs defaultValue="warehouses">
        <TabsList className="mb-4">
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="racks">Racks</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses">
          {isManager && (
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => { setWhForm({ name: "", location: "" }); setWhDialog(true); }}><Plus className="w-4 h-4 mr-1" /> Add Warehouse</Button>
            </div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Location</TableHead>{isManager && <TableHead className="w-20">Actions</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {warehouses.map((w, i) => (
                  <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="text-muted-foreground">{w.location}</TableCell>
                    {isManager && (
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setWarehouses(prev => prev.filter(x => x.id !== w.id)); toast.success("Deleted"); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>

        <TabsContent value="racks">
          {isManager && (
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => { setRackForm({ name: "", warehouse: "WH-A" }); setRackDialog(true); }}><Plus className="w-4 h-4 mr-1" /> Add Rack</Button>
            </div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Warehouse</TableHead>{isManager && <TableHead className="w-20">Actions</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {racks.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.warehouse}</TableCell>
                    {isManager && (
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setRacks(prev => prev.filter(x => x.id !== r.id)); toast.success("Deleted"); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Dialog open={whDialog} onOpenChange={setWhDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={whForm.name} onChange={e => setWhForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={whForm.location} onChange={e => setWhForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={() => {
            if (!whForm.name) { toast.error("Enter name"); return; }
            setWarehouses(prev => [...prev, { id: Date.now().toString(), ...whForm }]);
            setWhDialog(false); toast.success("Warehouse created");
          }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rackDialog} onOpenChange={setRackDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Rack</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={rackForm.name} onChange={e => setRackForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Warehouse</Label><Input value={rackForm.warehouse} onChange={e => setRackForm(f => ({ ...f, warehouse: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={() => {
            if (!rackForm.name) { toast.error("Enter name"); return; }
            setRacks(prev => [...prev, { id: Date.now().toString(), ...rackForm }]);
            setRackDialog(false); toast.success("Rack created");
          }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
