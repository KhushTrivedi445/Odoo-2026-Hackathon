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
import { useEffect } from "react";
import api from "../services/api";
import { useRole } from "@/hooks/useRole";

interface Warehouse { id: number; name: string; location: string; }

const SettingsPage = () => {
  const { isManager } = useRole();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to fetch warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [whDialog, setWhDialog] = useState(false);
  const [whForm, setWhForm] = useState({ name: "", location: "" });

  const handleCreate = async () => {
    if (!whForm.name) { toast.error("Enter name"); return; }
    try {
      await api.post("/warehouses", whForm);
      toast.success("Warehouse created");
      setWhDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create warehouse");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/warehouses/${id}`);
      toast.success("Warehouse deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete warehouse");
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Settings" description="Manage warehouses and racks" />

      <Tabs defaultValue="warehouses">
        <TabsList className="mb-4">
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses">
          {isManager && (
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => { setWhForm({ name: "", location: "" }); setWhDialog(true); }}><Plus className="w-4 h-4 mr-1" /> Add Warehouse</Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-muted-foreground">Loading warehouses...</p>
            </div>
          ) : (
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(w.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={whDialog} onOpenChange={setWhDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={whForm.name} onChange={e => setWhForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={whForm.location} onChange={e => setWhForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
