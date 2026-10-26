import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export const DoctorAssignmentService = {

    async createDoctorAssignment(data: { doctorId: string, hospitalId: string, position?: string }) {
        const res = await api.post( endpoints.DOCTOR_ASSIGNMENT.CREATE, data );
        return res.data;
    }

};