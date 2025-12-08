import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddCopierDialog } from "@/components/modals/AddCopierDialog";
import { EditCopierDialog } from "@/components/modals/EditCopierDialog";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import supabase from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

const TradeCopier = () => {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const [masterAccount, setMasterAccount] = useState("FTMO - 123456");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<any>(null);

  const handleEdit = (mapping: any) => {
    setSelectedMapping(mapping);
    setEditOpen(true);
  };

  const handleDelete = (mapping: any) => {
    setSelectedMapping(mapping);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    (async () => {
      try {
        if (!selectedMapping?.id) return;
        const { error } = await supabase.from('copy_rules').delete().eq('id', selectedMapping.id)
        if (error) throw error
        setRefreshKey(k => k + 1)
      } catch (err) {
        console.error('Failed to delete mapping', err)
      } finally {
        setDeleteOpen(false)
      }
    })()
  };

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const userId = user?.id ?? null
        if (!userId) { setMappings([]); return }
        const { data, error } = await supabase.from('copy_rules').select('*').eq('user_id', userId)
        if (error) throw error
        if (!mounted) return
        setMappings(data ?? [])
      } catch (err) {
        console.error('Failed to load copier mappings', err)
      } finally {
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [user, refreshKey])

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Trade Copier</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage trade copying across your accounts</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass p-4 sm:p-6 w-full">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium mb-2 block">Master Account</label>
              <Select value={masterAccount} onValueChange={setMasterAccount}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTMO - 123456">FTMO - 123456</SelectItem>
                  <SelectItem value="The5ers - 789012">The5ers - 789012</SelectItem>
                  <SelectItem value="MyForexFunds - 345678">MyForexFunds - 345678</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto text-sm sm:text-base">
              <Plus className="w-4 h-4 mr-2" />
              Add Mapping
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Slave Account</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Risk Mode</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Multiplier</th>
                  <th className="hidden sm:table-cell text-left py-2 sm:py-3 px-2 sm:px-4">Allowed Symbols</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Status</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">{mapping.slave_account}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{mapping.risk_mode}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{mapping.multiplier}</td>
                    <td className="hidden sm:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{mapping.allowed_symbols}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <Badge variant={mapping.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {mapping.status}
                      </Badge>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleEdit(mapping)}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleDelete(mapping)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <AddCopierDialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setRefreshKey(k => k + 1) }} />
      <EditCopierDialog
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) setRefreshKey(k => k + 1) }}
        mapping={selectedMapping}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Mapping"
        description="Are you sure you want to delete this copier mapping?"
      />
    </div>
  );
};

export default TradeCopier;