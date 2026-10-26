import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export interface HospitalSpecialityDetails {
    id: string;
    name: string;
    description?: string;
    hospitalSpecialityId?: string;
}
export interface SpecialtyDoctor {
    id: string;
    name: string;
    lastName: string;
    photoUrl?: string;
}

export const HospitalSpecialityService={
    async getAllHospitalsSpecialities(){
        const  res = await api.get(endpoints.HOSPITAL_SPECIALITY.GET_ALL);
        return res.data
    },
    async getHospitalSpecialityById(hospitalSpecialityId:string){
        const res = await api.get(endpoints.HOSPITAL_SPECIALITY.GET(hospitalSpecialityId))
        return res.data
    },
    async createHospitalSpeciality(hospitalSpecialityData: { hospitalId: string; specialityId: string }){
        const res = await api.post(endpoints.HOSPITAL_SPECIALITY.CREATE , hospitalSpecialityData)
        return res.data
    },
    async updateHospitalSpeciality(id:string, hospitalSpecialityData: Partial<{ hospitalId: string; specialityId: string }>){
        const res = await api.put(endpoints.HOSPITAL_SPECIALITY.UPDATE(id), hospitalSpecialityData);
        return res.data
    },
    async getSpecialitiesByHospitalId(hospitalId:string): Promise<HospitalSpecialityDetails[]>{
        const res= await api.get(endpoints.HOSPITAL_SPECIALITY.GET_BY_HOSPITAL(hospitalId))
        return res.data;
    },
    async deleteHospitalSpeciality(id:string){
        const res= await api.delete(endpoints.HOSPITAL_SPECIALITY.DELETE(id))
        return res.data
    },
    async getDoctorBySpecialityAndHospital(hospitalId:string, specialityId:string, signal?: AbortSignal): Promise<SpecialtyDoctor[]>{
        const res= await api.get(endpoints.HOSPITAL_SPECIALITY.GET_DOCTOR_BY_SPECIALITY_AND_HOSPITAL(hospitalId, specialityId), { signal })
        return res.data;
    }
}
