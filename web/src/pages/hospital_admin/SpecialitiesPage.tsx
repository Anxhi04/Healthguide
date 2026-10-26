import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useHospitalContext } from "@/contexts/HospitalContext";
import { HospitalSpecialityService, type HospitalSpecialityDetails } from "@/services/hospitalSpecialityService";
import PageIntro from "./components/PageIntro";
import AddSpecialityModal from "./components/addSpeciality";
import SpecialityDetailsModal from "./components/speciality/SpecialityDetailsModal";

const errorMessage = (error: unknown, fallback: string) => axios.isAxiosError(error) && typeof error.response?.data?.message === "string" ? error.response.data.message : fallback;

export default function SpecialitiesPage() {
    const { hospital, loading: hospitalLoading } = useHospitalContext();
    if (hospitalLoading) return <p role="status" className="p-6">Loading hospital…</p>;
    if (!hospital) return <p role="alert" className="p-6 text-red-600">Hospital not found.</p>;
    return <HospitalSpecialitiesContent key={hospital.id} hospitalId={hospital.id} />;
}

function HospitalSpecialitiesContent({ hospitalId }: { hospitalId: string }) {
    const [specialities, setSpecialities] = useState<HospitalSpecialityDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [selected, setSelected] = useState<HospitalSpecialityDetails | null>(null);
    const [removing, setRemoving] = useState<HospitalSpecialityDetails | null>(null);
    const [busy, setBusy] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let active = true;
        HospitalSpecialityService.getSpecialitiesByHospitalId(hospitalId)
            .then(data => { if (active) setSpecialities(data); })
            .catch(error => { if (active) setError(errorMessage(error, "Could not load specialities. Please try again.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [hospitalId, attempt]);
    const requestRemoval = (speciality: HospitalSpecialityDetails) => { setRemoveError(null); setRemoving(speciality); };
    const remove = async () => {
        if (!removing?.hospitalSpecialityId || busy) return;
        setBusy(true); setRemoveError(null);
        try {
            await HospitalSpecialityService.deleteHospitalSpeciality(removing.hospitalSpecialityId);
            setSpecialities(items => items.filter(item => item.id !== removing.id));
            if (selected?.id === removing.id) setSelected(null);
            setRemoving(null);
        } catch (error) { setRemoveError(errorMessage(error, "Could not remove the specialty. Please try again.")); }
        finally { setBusy(false); }
    };
    return <div className="min-h-screen bg-slate-50"><div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
        <PageIntro title="Specialities & Doctors" description="Manage the specialities and doctors available at your hospital." action="Add Speciality" onAction={() => setAddOpen(true)} />
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? <p role="status" className="p-6 text-sm text-slate-500">Loading specialities…</p> : error ? <div role="alert" className="space-y-3 p-6 text-red-600"><p>{error}</p><Button variant="outline" onClick={() => { setLoading(true); setError(null); setAttempt(value => value + 1); }}>Retry</Button></div> : specialities.length === 0 ? <p className="p-6 text-center text-sm text-slate-500">No specialities found for this hospital.</p> : specialities.map(speciality => <div key={speciality.id} className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-2 focus-visible:outline-blue-600" onClick={() => setSelected(speciality)}>
                    <h2 className="font-semibold text-slate-900 hover:text-blue-700">{speciality.name}</h2>
                    {speciality.description && <p className="mt-1 text-sm text-slate-600">{speciality.description}</p>}
                </button>
                <div className="flex gap-2"><Button variant="outline" onClick={() => setSelected(speciality)}>View details</Button><Button variant="destructive" disabled={!speciality.hospitalSpecialityId} onClick={() => requestRemoval(speciality)}>Remove specialty</Button></div>
            </div>)}
        </div>
    </div>
        <AddSpecialityModal open={addOpen} onOpenChange={setAddOpen} hospitalId={hospitalId} onSuccess={async () => { setSpecialities(await HospitalSpecialityService.getSpecialitiesByHospitalId(hospitalId)); }} />
        {selected && <SpecialityDetailsModal key={`${hospitalId}:${selected.id}`} speciality={selected} hospitalId={hospitalId} onClose={() => setSelected(null)} onRemoveSpeciality={() => requestRemoval(selected)} />}
        <AlertDialog open={!!removing} onOpenChange={open => { if (!open && !busy) setRemoving(null); }}>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {removing?.name} from this hospital?</AlertDialogTitle><AlertDialogDescription>The specialty will remain available globally. Doctor records, their other specialties and other hospitals are preserved.</AlertDialogDescription></AlertDialogHeader>
                {removeError && <p role="alert" className="text-sm text-red-600">{removeError}</p>}
                <AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} className="bg-red-600 hover:bg-red-700" onClick={event => { event.preventDefault(); void remove(); }}>{busy ? "Removing…" : "Remove specialty"}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>;
}
