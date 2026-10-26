import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export const SpecialityService={
    async getSpecialities(){
        const res= await api.get(endpoints.SPECIALITY.GET_ALL)
        return res.data
    },
    async getSpecialityById(id:string){
        const res= await api.get(endpoints.SPECIALITY.GET(id))
        return res.data
    },
    async addSpeciality(specialityData:any){
        const res =await  api.post(endpoints.SPECIALITY.CREATE, specialityData);
        return res.data
    },
    async updateSpeciality(id:string, specialityData:any){
        const res= await api.put(endpoints.SPECIALITY.UPDATE(id), specialityData)
        return res.data
    },
    async deleteSpeciality(id:string){
        const res = await api.delete(endpoints.SPECIALITY.DELETE(id))
        return res.data
    },
    async getSpecilitiesByHospitalId(hospitalId:string){
        const res = await api.get(endpoints.HOSPITAL_SPECIALITY.GET_BY_HOSPITAL(hospitalId))
        return res.data
    }
}