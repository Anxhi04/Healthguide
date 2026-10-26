import { useEffect, useState } from "react";
import { HospitalSpecialityService } from "@/services/hospitalSpecialityService";

export interface Speciality {
    id: string;
    name: string;
    description?: string;
}

export const useHospitalSpecialities = (
    hospitalId: string | undefined
) => {
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSpecialities = async () => {
        if (!hospitalId) {
            setSpecialities([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data =
                await HospitalSpecialityService.getSpecialitiesByHospitalId(hospitalId);

            setSpecialities(data);
        } catch (error) {
            console.error(error);
            setError("Failed to load hospital specialities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpecialities();
    }, [hospitalId]);

    return {
        specialities,
        loading,
        error,
        refreshSpecialities: loadSpecialities,
    };
};