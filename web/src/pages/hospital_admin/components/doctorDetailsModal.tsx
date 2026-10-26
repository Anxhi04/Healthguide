import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DoctorService } from "@/services/doctorService";

interface DoctorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: ()=>Promise<void>
    name: string;
    lastName: string;
    phoneNumber: string;
    biography: string;
    licenseNumber: string;
    doctorId: string;
}

export default function DoctorModal({
    open,
    onOpenChange,
    name,
    lastName,
    phoneNumber,
    biography,
    licenseNumber,
    doctorId,
}:DoctorProps){
    const [isEditing, setIsEditing]= useState(false);
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState("");

    const [editData, setEditData]=useState({
        name:"",
        lastName:"",
        phoneNumber:"",
        biography:"",
        licenseNumber:"",
    });
    useEffect(()=>{
        if(open){
            setEditData({
                name: name ?? "",
                lastName: lastName ?? "",
                phoneNumber: phoneNumber??"",
                biography: biography ?? "",
                licenseNumber: licenseNumber ?? "",
            });
            setIsEditing(false);
            setError("")
        }
    },[
        open,
        name,
        lastName,
        phoneNumber,
        biography,
        licenseNumber
    ]);
        
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
        setEditData({
            name: name ?? "",
            lastName: lastName ?? "",
            phoneNumber: phoneNumber ?? "",
            biography: biography ?? "",
            licenseNumber: licenseNumber ?? ""
        });
        setError("");
        setIsEditing(true);
    }

    const handleCancelEdit=()=>{
        setEditData({
            name: name ?? "",
            lastName: lastName ?? "",
            phoneNumber: phoneNumber??"",
            biography: biography ?? "",
            licenseNumber: licenseNumber ?? "",
        });
        setError("");
        setIsEditing(false);
    }

    const handleSave= async()=>{
        try{
            setLoading(true);
            setError("");

            await DoctorService.updateDoctor(doctorId, editData);
            setIsEditing(false)
        }catch(error){
            console.error("Error", error);
            setError("Failed to update Dcotor")
        }finally{
            setLoading(false);
        }
    }
    const handleClose=()=>{
        if(loading) return;
        setIsEditing(false);
        setError("");
        onOpenChange(false);
    }

 return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-white sm:max-w-[500px]">

                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Doctor": "Doctor Details"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEditing ? "Update the doctor's information": "View the doctor's informations"}
                    </DialogDescription>
                </DialogHeader>
                    {!isEditing ? (
                            <div className="space-y-5 py-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <Label>First Name</Label>
                                    <p className="text-sm text-slate-700">
                                        {name || "Not provided"}
                                    </p>
                                </div>

                                {/* Last Name */}
                                <div className="space-y-1">
                                    <Label>Last Name</Label>
                                    <p className="text-sm text-slate-700">
                                        {lastName || "Not provided"}
                                    </p>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <Label>Phone Number</Label>
                                    <p className="text-sm text-slate-700">
                                        {phoneNumber || "Not provided"}
                                    </p>
                                </div>

                                {/* License Number */}
                                <div className="space-y-1">
                                    <Label>License Number</Label>
                                    <p className="text-sm text-slate-700">
                                        {licenseNumber || "Not provided"}
                                    </p>
                                </div>

                                {/* Biography */}
                                <div className="space-y-1">
                                    <Label>Biography</Label>
                                    <p className="text-sm leading-6 text-slate-700">
                                        {biography || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 py-4">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        First Name
                                    </Label>

                                    <Input
                                        id="name"
                                        name="name"
                                        value={editData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last Name
                                    </Label>

                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={editData.lastName}
                                        onChange={handleChange}
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
                                        value={editData.phoneNumber}
                                        onChange={handleChange}
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
                                        value={editData.licenseNumber}
                                        onChange={handleChange}
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
                                        value={editData.biography}
                                        onChange={handleChange}
                                        rows={4}
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                )}
                            </div>
                    )}

                <DialogFooter>
                    {!isEditing ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                Close
                            </Button>

                            <Button
                                type="button"
                                onClick={handleEdit}
                            >
                                <Pencil />
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                <X />
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <Save />

                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}