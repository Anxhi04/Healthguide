import { COLLECTIONS } from "../constants/collections";
import { DoctorAssignments } from "../modules/doctorAssignments.model";
import { Doctor } from "../modules/doctors.model";
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsByField,
  getDocumentsByIds
} from "../utils/firestore.service";

// Public endpoints must never spread administrative or future document fields.
export const toPublicDoctor = (doctor: Doctor) => ({
    id: doctor.id, name: typeof doctor.name === "string" ? doctor.name : "",
    lastName: typeof doctor.lastName === "string" ? doctor.lastName : "",
    ...(doctor.photoUrl ? { photoUrl: doctor.photoUrl } : {}),
    ...(doctor.biography ? { biography: doctor.biography } : {}),
    ...(doctor.phoneNumber ? { phoneNumber: doctor.phoneNumber } : {}),
    ...(doctor.experienceYears !== undefined ? { experienceYears: doctor.experienceYears } : {}),
});


export const getDoctorById= async(
    id:string,
)=>{
    return await getDocumentById<Doctor>(
        COLLECTIONS.DOCTOR,
        id
    ) ?? await getDocumentById<Doctor>("doctor", id);
}


export const getAllDoctors= async()=>{
    const [current, legacy] = await Promise.all([
        getAllDocuments<Doctor>(COLLECTIONS.DOCTOR), getAllDocuments<Doctor>("doctor")
    ]);
    return [...new Map([...legacy, ...current].map(doctor => [doctor.id, doctor])).values()];
}
export const getDoctorsByIds = async (ids: string[]) => {
    const current = await getDocumentsByIds<Doctor>(COLLECTIONS.DOCTOR, ids);
    const found = new Set(current.map(doctor => doctor.id));
    const missing = ids.filter(id => !found.has(id));
    return [...current, ...await getDocumentsByIds<Doctor>("doctor", missing)];
};

export const getDoctorsByHospital = async (hospitalId: string) => {
    const assignments = await getDocumentsByField<DoctorAssignments>(
        COLLECTIONS.DOCTOR_ASSIGNMENTS, "hospitalId", hospitalId);
    return getDoctorsByIds(assignments.map(assignment => assignment.doctorId));
};
