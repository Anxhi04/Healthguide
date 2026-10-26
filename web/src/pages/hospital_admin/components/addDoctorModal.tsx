import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DoctorService } from "@/services/doctorService";
import { DoctorSpecialityService } from "@/services/doctorSpecialityService";
import { DoctorAssignmentService } from "@/services/doctorAssignmentService";

interface AddDoctorModalProps{
    open:boolean,
    onOpenChange:(open:boolean)=>void;
    hospitalId:string;
    specialityId:string;
    onSuccess: ()=>Promise<void>
}

export default function AddDoctorModal({
    open,
    onOpenChange,
    hospitalId,
    specialityId,
    onSuccess
}:AddDoctorModalProps){
    const [formData, setFormData]=useState({
        name:"",
        lastName:"",
        phoneNumber:"",
        photoUrl:"",
        biography:"",
        experienceYears: 0,
        licenseNumber:"",
    });
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState("");

    const resetForm=()=>{
        setFormData({
            name:"",
            lastName:"",
            phoneNumber:"",
            photoUrl:"",
            biography:"",
            experienceYears: 0,
            licenseNumber:"",
        });
        setError("");
    }
    const handleClose=(value:boolean)=>{
        if(!value && !loading){
            resetForm();
        }
        onOpenChange(value);
    }
    const handleSubmit=async()=>{
        if(!formData.name.trim()&&!formData.lastName.trim()){
            setError("Doctor's first and last name are required");
            return;
        }
        try{
            setLoading(true);
            setError("");
            //create doctor
            const doctor = await DoctorService.addDoctor(formData);
            //lidh dokt me specialitetin
            await DoctorSpecialityService.createDoctorSpeciality({doctorId: doctor.id, specialityId: specialityId});
            //lish dokt me spitalin
            await DoctorAssignmentService.createDoctorAssignment({doctorId:doctor.id, hospitalId:hospitalId})
            await onSuccess();
            resetForm();
            onOpenChange(false);
        }catch(error:any){
            console.error("error while adding doctor", error);
            setError(
                error?.response?.data?.message ??
                "Failed to create doctor."
            )
        }finally{
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-white sm:max-w-[500px]">

                <DialogHeader>
                    <DialogTitle>
                        Add Doctor
                    </DialogTitle>

                    <DialogDescription>
                        Create a new doctor for your hospital.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">

                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            First Name *
                        </Label>

                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. John"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name *
                        </Label>

                        <Input
                            id="lastName"
                            name="lastName"
                            placeholder="e.g. Smith"
                            value={formData.lastName}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                            Phone Number
                        </Label>

                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="e.g. +355 69 123 4567"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {/* Photo URL */}
                    <div className="space-y-2">
                        <Label htmlFor="photoUrl">
                            Photo URL
                        </Label>

                        <Input
                            id="photoUrl"
                            name="photoUrl"
                            placeholder="https://..."
                            value={formData.photoUrl}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {/* Biography */}
                    <div className="space-y-2">
                        <Label htmlFor="biography">
                            Biography
                        </Label>

                        <Textarea
                            id="biography"
                            name="biography"
                            placeholder="Describe the doctor..."
                            value={formData.biography}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            rows={4}
                            disabled={loading}
                        />
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <Label htmlFor="experienceYears">
                            Experience (years)
                        </Label>

                        <Input
                            id="experienceYears"
                            name="experienceYears"
                            type="number"
                            min={0}
                            value={formData.experienceYears}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    experienceYears: Number(e.target.value),
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {/* License Number */}
                    <div className="space-y-2">
                        <Label htmlFor="licenseNumber">
                            License Number
                        </Label>

                        <Input
                            id="licenseNumber"
                            name="licenseNumber"
                            placeholder="e.g. LIC-12345"
                            value={formData.licenseNumber}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    [e.target.name]: e.target.value,
                                }))
                            }
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            loading ||
                            !formData.name.trim() ||
                            !formData.lastName.trim()
                        }
                    >
                        {loading
                            ? "Creating..."
                            : "Create Doctor"}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );



}