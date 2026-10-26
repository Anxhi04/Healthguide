import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SpecialityService } from "@/services/specialityService";
import { HospitalSpecialityService } from "@/services/hospitalSpecialityService";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; hospitalId: string; onSuccess: () => Promise<void> }
interface Speciality { id: string; name: string; description?: string }
export default function AddSpecialityModal({ open, onOpenChange, hospitalId, onSuccess }: Props) {
  const [catalog, setCatalog] = useState<Speciality[]>([]);
  const [specialityId, setSpecialityId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([SpecialityService.getSpecialities(), HospitalSpecialityService.getSpecialitiesByHospitalId(hospitalId)])
      .then(([all, assigned]: [Speciality[], Speciality[]]) => {
        if (active) setCatalog(all.filter(item => !assigned.some(existing => existing.id === item.id)));
      }).catch(() => { if (active) setError("Could not load the speciality catalog."); });
    return () => { active = false; };
  }, [open, hospitalId]);
  const handleClose = (value: boolean) => {
    if (loading) return;
    setSpecialityId(""); setError(""); onOpenChange(value);
  };
  const handleSubmit = async () => {
    if (!specialityId || loading) return;
    setLoading(true); setError("");
    try {
      await HospitalSpecialityService.createHospitalSpeciality({ hospitalId, specialityId });
      await onSuccess(); setSpecialityId(""); onOpenChange(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Could not add speciality.");
    } finally { setLoading(false); }
  };
  return <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="bg-white sm:max-w-[500px]">
      <DialogHeader><DialogTitle>Add Speciality</DialogTitle>
        <DialogDescription>Choose a medical speciality from the catalog for your hospital.</DialogDescription></DialogHeader>
      <div className="space-y-5 py-4">
        <div className="space-y-2"><Label htmlFor="speciality-name">Name *</Label>
          <select id="speciality-name" className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={specialityId} onChange={event => setSpecialityId(event.target.value)} disabled={loading}>
            <option value="">Select a speciality</option>
            {catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label htmlFor="speciality-description">Description</Label>
          <Textarea id="speciality-description" value={catalog.find(item => item.id === specialityId)?.description ?? ""} rows={4} readOnly />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={loading}>Cancel</Button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={loading || !specialityId}>{loading ? "Adding..." : "Add Speciality"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
