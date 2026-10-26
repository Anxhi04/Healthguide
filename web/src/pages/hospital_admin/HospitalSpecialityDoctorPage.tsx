import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { doctors, specialities } from "./mockData";
import { useHospitalContext } from "@/contexts/HospitalContext";
import { useEffect, useState } from "react";
import { HospitalSpecialityService } from "@/services/hospitalSpecialityService";
import { SpecialityService } from "@/services/specialityService";
import AddDoctorModal from "./components/addDoctorModal";
import DoctorModal from "./components/doctorDetailsModal";


export default function HospitalSpecialityDoctorsPage() {
    const { specialityId } = useParams<{ specialityId: string }>();
    const [speciality, setSpeciality] = useState<any | null>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const { hospital, loading: hospitalLoading } = useHospitalContext();
    const [loading, setLoading] = useState(false);
    const [specialityLoading, setSpecialityLoading] = useState(false);
    const [openAddDoctorModal, setOpenAddDoctorModal]=useState(false);
    const [openEditDoctorModal, setEditDoctorModal]=useState(false);
    const [selectedDoctor, setSelectedDoctor]=useState<{ id: string; name: string; lastName: string; phoneNumber: string; biography: string; licenseNumber: string } | null>(null)
    const hospitalId = hospital?.id;

    const loadDoctors= async()=>{
        if(!hospitalId|| !specialityId) return;
        try { 
            setLoading(true); 
            const doc = await HospitalSpecialityService.getDoctorBySpecialityAndHospital( hospitalId, specialityId ); 
            setDoctors(doc); 
        } catch (error) { 
        } finally { 
            setLoading(false); 
        }
    }

    useEffect(() => {
        if (!specialityId) return;

        const getSpeciality = async () => {
            try {
                setSpecialityLoading(true);
                const res = await SpecialityService.getSpecialityById(specialityId);
                setSpeciality(res);
            } catch (error) {
            } finally {
                setSpecialityLoading(false);
            }
        };

        getSpeciality();
    }, [specialityId]);

    useEffect(() => {
        loadDoctors();
    }, [hospitalId, specialityId]);


    if (hospitalLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!specialityId) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-600">
                Speciality not found.
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-600">
                Hospital not found.
            </div>
        );
    }

    if (specialityLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading speciality...
            </div>
        );
    }

    if (!speciality) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-600">
                Speciality not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <Button
                            asChild
                            variant="ghost"
                            className="-ml-3 text-slate-600"
                        >
                            <Link to="/hospital-admin/specialities">
                                <ArrowLeft />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            {speciality.name}
                        </h1>
                        <p className="text-sm text-slate-600">
                            Doctors available in this speciality.
                        </p>
                    </div>
                    <Button className="w-full sm:w-auto"
                      onClick={()=>setOpenAddDoctorModal(true)}
                    >
                        <Plus />
                        Add Doctor
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {loading ? (
                        <div className="py-10 text-center">
                            Loading doctors...
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {doctors.map((doctor) => (
                                <Card
                                    key={doctor.id}
                                    className="border-slate-200 bg-white shadow-sm"
                                    onClick={()=>{
                                        setSelectedDoctor(doctor);
                                        setEditDoctorModal(true);
                                    }}
                                >
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                            {doctor.initials}
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-slate-900">
                                                Dr. {doctor.name}
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-600">
                                                {doctor.speciality}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-500">
                                                {doctor.experience}
                                                <span className="mx-1">|</span>
                                                License: {doctor.license}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
 		{openAddDoctorModal &&
 			<AddDoctorModal
 				open={openAddDoctorModal}
 				onOpenChange={setOpenAddDoctorModal}
 				hospitalId={hospital.id}
 				specialityId={specialityId}
 				onSuccess={loadDoctors}
 			/>
		}
        {selectedDoctor && (
            <DoctorModal
                open={openEditDoctorModal}
                onOpenChange={(open) => {
                    setEditDoctorModal(open);

                    if (!open) {
                        setSelectedDoctor(null);
                    }
                }}
                name={selectedDoctor.name}
                lastName={selectedDoctor.lastName}
                phoneNumber={selectedDoctor.phoneNumber}
                biography={selectedDoctor.biography}
                licenseNumber={selectedDoctor.licenseNumber}
                doctorId={selectedDoctor.id}
                onSuccess={loadDoctors}
            />
        )}
        </div>
    );
}