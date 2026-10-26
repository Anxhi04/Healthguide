import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HospitalSpecialityService, type HospitalSpecialityDetails, type SpecialtyDoctor } from "@/services/hospitalSpecialityService";

interface Props {
    speciality: HospitalSpecialityDetails;
    hospitalId: string;
    onClose: () => void;
    onRemoveSpeciality: () => void;
}
export default function SpecialityDetailsModal({ speciality, hospitalId, onClose, onRemoveSpeciality }: Props) {
    const [doctors, setDoctors] = useState<SpecialtyDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        HospitalSpecialityService.getDoctorBySpecialityAndHospital(hospitalId, speciality.id, controller.signal)
            .then(data => { if (!controller.signal.aborted) setDoctors(data); })
            .catch(error => { if (!controller.signal.aborted) setError(axios.isAxiosError(error) && typeof error.response?.data?.message === "string" ? error.response.data.message : "Could not load doctors. Please try again."); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [hospitalId, speciality.id, attempt]);
    return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
        <DialogContent className="bg-white sm:max-w-xl">
            <DialogHeader><DialogTitle>{speciality.name}</DialogTitle><DialogDescription>{speciality.description?.trim() || "Doctors associated with this specialty at your hospital."}</DialogDescription></DialogHeader>
            <section className="space-y-3">
                <h3 className="font-semibold text-slate-900">Doctors in this specialty{!loading && !error ? `: ${doctors.length}` : ""}</h3>
                {loading ? <p role="status" className="text-sm text-slate-500">Loading doctors…</p> : error ? <div role="alert" className="space-y-2 text-sm text-red-600"><p>{error}</p><Button variant="outline" onClick={() => { setLoading(true); setError(null); setAttempt(value => value + 1); }}>Retry</Button></div> : doctors.length === 0 ? <p className="text-sm text-slate-500">No doctors are currently associated with this specialty.</p> :
                    <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border border-slate-200">{doctors.map(doctor => <li key={doctor.id} className="flex items-center gap-3 p-3">
                        {doctor.photoUrl ? <img src={doctor.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600" aria-hidden="true">{doctor.name?.charAt(0) || "D"}</span>}
                        <span className="font-medium text-slate-800">Dr. {[doctor.name, doctor.lastName].filter(Boolean).join(" ")}</span>
                    </li>)}</ul>}
            </section>
            <DialogFooter className="gap-2 sm:justify-between">
                <Button variant="destructive" disabled={!speciality.hospitalSpecialityId} onClick={onRemoveSpeciality}>Remove specialty from hospital</Button>
                <div className="flex gap-2"><Button asChild variant="outline"><Link to={`/hospital-admin/speciality/${speciality.id}`}>Manage doctors</Link></Button><Button variant="outline" onClick={onClose}>Close</Button></div>
            </DialogFooter>
        </DialogContent>
    </Dialog>;
}
