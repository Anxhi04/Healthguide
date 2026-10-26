import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export const DoctorService = {
    async getDoctors(){
        const res = await api.get(endpoints.DOCTOR.GET_ALL);
        return res.data;
    },
    async getDoctorById(id:string){
        const res = await api.get(endpoints.DOCTOR.GET(id));
        return res.data;
    },
    async addDoctor(doctorData: any){
        const res = await api.post(endpoints.DOCTOR.CREATE, doctorData);
        return res.data;
    },
    async updateDoctor(id:string, doctorData: any){
        const res = await api.put(endpoints.DOCTOR.UPDATE(id), doctorData);
        return res.data;
    },
    async deleteDoctor(id:string){
        const res = await api.delete(endpoints.DOCTOR.DELETE(id));
        return res.data;
    }

}