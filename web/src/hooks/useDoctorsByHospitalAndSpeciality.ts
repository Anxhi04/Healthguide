import { useCallback, useEffect, useRef, useState } from "react";
import { HospitalSpecialityService, type SpecialtyDoctor } from "@/services/hospitalSpecialityService";

export const useDoctorsByHospitalAndSpeciality = (hospitalId: string, specialityId: string) => {
    const key = JSON.stringify([hospitalId, specialityId]);
    const [result, setResult] = useState<{ key: string; doctors: SpecialtyDoctor[]; error: string | null }>({ key: "", doctors: [], error: null });
    const [refreshing, setRefreshing] = useState(false);
    const activeRequest = useRef<AbortController | null>(null);
    const request = useCallback((signal: AbortSignal) => {
        if (!hospitalId || !specialityId) return Promise.resolve();
        return HospitalSpecialityService.getDoctorBySpecialityAndHospital(hospitalId, specialityId, signal)
            .then(doctors => { if (!signal.aborted) setResult({ key, doctors, error: null }); })
            .catch(() => { if (!signal.aborted) setResult({ key, doctors: [], error: "Failed to load doctors" }); })
            .finally(() => { if (!signal.aborted) setRefreshing(false); });
    }, [hospitalId, specialityId, key]);
    useEffect(() => {
        const controller = new AbortController();
        activeRequest.current = controller;
        void request(controller.signal);
        return () => { controller.abort(); if (activeRequest.current === controller) activeRequest.current = null; };
    }, [request]);
    const refreshDoctors = useCallback(async () => {
        const signal = activeRequest.current?.signal;
        if (!hospitalId || !specialityId || !signal || signal.aborted) return;
        setRefreshing(true);
        await request(signal);
    }, [request, hospitalId, specialityId]);
    const hasScope = !!hospitalId && !!specialityId;
    return {
        doctors: hasScope && result.key === key ? result.doctors : [],
        loading: hasScope && (refreshing || result.key !== key),
        error: hasScope && result.key === key ? result.error : null,
        refreshDoctors,
    };
};
