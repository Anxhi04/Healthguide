import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export const DoctorSpecialityService = {

    async createDoctorSpeciality(data: {doctorId: string, specialityId: string}) {
        const res = await api.post(endpoints.DOCTOR_SPECIALITY.CREATE, data );
        return res.data;
    }
};