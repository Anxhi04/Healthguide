import { Building2, Mail, MapPin, Pencil, Phone,  Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHospitalContext } from "@/contexts/HospitalContext";
import { useEffect, useState } from "react";
import { HospitalSpecialityService } from "@/services/hospitalSpecialityService";
import AddSpecialityModal from "./components/addSpeciality";
import { HospitalService } from "@/services/hospitalService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Speciality {
    id: string;
    name: string;
    description?: string;
}

export default function HospitalPage(){
    const {hospital, loading}=useHospitalContext();
    const [specialities, setSpecialities]=useState<Speciality[]>([]);
    const [specialitiesLoading, setSpecialitiesLoading] = useState(false);
    const [addSpecialityOpen , setAddSpecialityOpen]= useState(false);
    const [ editHospital, setEditHospital]=useState(false);
    const [error, setError]=useState("");
    const [, setHospitalUpdatedLoading]=useState(false);
   
    const [ editData, setEditData]=useState({
        name:"",
        address:"",
        city:"",
        phoneNumber:"",
        email:"",
        description:"",
    });
    const handleChange=(
        e: React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>
    )=>{
        const {name, value}=e.target;
        setEditData((prev)=>({
            ...prev,
            [name]:value
        }));
    }

    const handleEdit=()=>{
        if(!hospital) return;
        setEditData({
            name: hospital.name ?? "",
            address:hospital.address ?? "",
            city: hospital.city ?? "",
            phoneNumber: hospital.phoneNumber ?? "",
            email : hospital.email ?? "",
            description: hospital.description ?? ""
        });
        setEditHospital(true);
    }
    

    useEffect(()=>{
        if(!hospital?.id){
            return;
        }
        const getSpecialities = async () =>{
            try{
                setSpecialitiesLoading(true);
                const res= await HospitalSpecialityService.getSpecialitiesByHospitalId(hospital.id);
                setSpecialities(res);
            }catch(error){
                console.error("Error fetching hospital specialities:", error);
                setSpecialities([])
            }finally{
                setSpecialitiesLoading(false);
            }
        }
        getSpecialities();
    }, [hospital?.id])

    const handleSave=async()=>{
        if (!hospital) return;
        try{
            setHospitalUpdatedLoading(true);
            setError("")
            await HospitalService.updateHospital(hospital.id, editData);
            setEditHospital(false);
        }catch(error){
            console.error("Error", error)
            setError("Failed to update hospital");
            // setEditHospital(false);
        }finally{
            setHospitalUpdatedLoading(false)
        }

    }

    if (loading) {
        return(
         <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
            Loading hospital...
        </div>           
        )

    }

    if (error) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-red-600">
            {error ?? "Hospital not found"}
        </div>
        );
    }
        
    if (!hospital) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-red-600">
                Hospital not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Hospital administration</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Hospital</h1>
                        <p className="text-sm text-slate-600">Manage your hospital information and care services.</p>
                    </div>
                    {!editHospital ? (
                            <Button
                                className="w-full sm:w-auto"
                                onClick={handleEdit}
                            >
                                <Pencil />
                                Edit Hospital
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditHospital(false)}
                                >
                                    <X />
                                    Cancel
                                </Button>

                                <Button onClick={handleSave}>
                                    <Save />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                </div>

                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-xl text-slate-900">Hospital Information</CardTitle>
                        <CardDescription>Public details shown to patients and visitors.</CardDescription>
                    </CardHeader>
                        <CardContent className="grid gap-6 p-6 sm:grid-cols-2">

                            {editHospital ? (
                                <>
                                    {/* Hospital Name */}
                                    <div className="flex gap-3">
                                        <Building2 className="mt-2 h-4 w-4 text-slate-400" />

                                        <div className="w-full">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Hospital name
                                            </p>

                                            <Input
                                                name="name"
                                                value={editData.name}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex gap-3">
                                        <MapPin className="mt-2 h-4 w-4 text-slate-400" />

                                        <div className="w-full">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Address
                                            </p>

                                            <Input
                                                name="address"
                                                value={editData.address}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="flex gap-3">
                                        <MapPin className="mt-2 h-4 w-4 text-slate-400" />

                                        <div className="w-full">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                City
                                            </p>

                                            <Input
                                                name="city"
                                                value={editData.city}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex gap-3">
                                        <Phone className="mt-2 h-4 w-4 text-slate-400" />

                                        <div className="w-full">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Phone
                                            </p>

                                            <Input
                                                name="phoneNumber"
                                                value={editData.phoneNumber}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex gap-3">
                                        <Mail className="mt-2 h-4 w-4 text-slate-400" />

                                        <div className="w-full">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Email
                                            </p>

                                            <Input
                                                type="email"
                                                name="email"
                                                value={editData.email}
                                                onChange={handleChange}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="sm:col-span-2">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Description
                                        </p>

                                        <Textarea
                                            name="description"
                                            value={editData.description}
                                            onChange={handleChange}
                                            className="mt-1"
                                            rows={4}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InfoItem
                                        icon={Building2}
                                        label="Hospital name"
                                        value={hospital.name}
                                    />

                                    <InfoItem
                                        icon={MapPin}
                                        label="Address"
                                        value={`${hospital.address}, ${hospital.city}`}
                                    />

                                    <InfoItem
                                        icon={Phone}
                                        label="Phone"
                                        value={hospital.phoneNumber ?? "Not provided"}
                                    />

                                    <InfoItem
                                        icon={Mail}
                                        label="Email"
                                        value={hospital.email}
                                    />

                                    <div className="sm:col-span-2">
                                        <p className="text-sm leading-6 text-slate-600">
                                            {hospital.description}
                                        </p>
                                    </div>
                                </>
                            )}

                        </CardContent>
                </Card>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Care services</h2>
                                {specialitiesLoading ? (
                                    <p>Loading specialities...</p>
                                ) : (
                                    <p>
                                        {specialities.length} specialities available at your hospital.
                                    </p>
                                )}                        
                        </div>
                            <Button
                                onClick={() => setAddSpecialityOpen(true)}
                            >
                                <Plus />
                                Add Speciality
                            </Button>                    
                        </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {specialities.map((speciality) => (
                            <Card key={speciality.id} className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold text-slate-900">{speciality.name}</h3>
                                    <p className="mt-2 text-sm leading-5 text-slate-600">{speciality.description}</p>
                                    {/* <p className="mt-4 text-sm font-medium text-slate-500">{speciality.doctors} doctors</p> */}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
            <AddSpecialityModal
                open={addSpecialityOpen}
                onOpenChange={setAddSpecialityOpen}
                hospitalId={hospital.id}
                onSuccess={async()=>{
                    const res = await HospitalSpecialityService.getSpecialitiesByHospitalId(hospital.id);
                    setSpecialities(res);
                }}
            />
        </div>

    )
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
    return <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 text-slate-400" /><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-900">{value}</p></div></div>
}
