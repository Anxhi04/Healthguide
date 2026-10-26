import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export const HospitalService={
    async getHospitals(){
        const res= await api.get(endpoints.HOSPITAL.GET_ALL)
        return res.data
    },
    async getHospital(id:string){
        const res= await api.get(endpoints.HOSPITAL.GET(id))
        return res.data
    },
    async updateHospital(id:string, hospitaldata:any){
        const res= await api.put(endpoints.HOSPITAL.UPDATE(id), hospitaldata)
        return res.data
    },
    async createHospital(hospitalData:any){
        const res= await api.post(endpoints.HOSPITAL.CREATE, hospitalData)
        return res.data
    },
    async deleteHospital(id:string){
        const res= await api.delete(endpoints.HOSPITAL.DELETE(id))
        return res.data
    }
}