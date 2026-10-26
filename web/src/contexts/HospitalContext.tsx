import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { endpoints } from "@/endpoints/endpoints";
import api from "@/lib/axios";

export interface Hospital {
    id: string;
    name: string;
    city: string;
    address: string;
    phoneNumber?: string;
    email: string;
    description?: string;
}

interface HospitalContextType {
    hospital: Hospital | null;
    loading: boolean;
    error: string | null;
    refreshHospital: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(
    undefined
);

export const HospitalProvider = ({ children }: { children: ReactNode }) => {
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHospital = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(
                endpoints.HOSPITAL.GET_ME
            );

            setHospital(response.data);
        } catch (err: any) {
            setError(
                err.response?.data?.message ??
                "Failed to load hospital data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHospital();
    }, []);

    return (
        <HospitalContext.Provider
            value={{
                hospital,
                loading,
                error,
                refreshHospital: loadHospital,
            }}
        >
            {children}
        </HospitalContext.Provider>
    );
};

export function useHospitalContext() {
    const context = useContext(HospitalContext);

    if (!context) {
        throw new Error(
            "useHospitalContext must be used inside HospitalProvider"
        );
    }

    return context;
}