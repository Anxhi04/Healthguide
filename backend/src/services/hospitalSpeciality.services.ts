import { COLLECTIONS } from "../constants/collections";
import { DoctorAssignments } from "../modules/doctorAssignments.model";
import { DoctorSpeciality } from "../modules/doctorSpecialities.model";
import { Hospital } from "../modules/hospitals.model";
import { HospitalSpeciality } from "../modules/hospitalSpecialities.model";
import { Speciality } from "../modules/specialities.model";
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsByField,
  getDocumentsByIds
} from "../utils/firestore.service";
import { getDoctorsByIds, toPublicDoctor } from "./doctor.services";

export class HospitalDirectoryError extends Error {
    constructor(message: string, public readonly statusCode: number) { super(message); }
}
const requireHospital = async (id: string) => {
    if (!await getDocumentById<Hospital>(COLLECTIONS.HOSPITALS, id))
        throw new HospitalDirectoryError("Hospital not found", 404);
};

export const getSpecialitiesByHospitalId = async (hospitalId: string) => {
    await requireHospital(hospitalId);
    const relations = await getDocumentsByField<HospitalSpeciality>(
        COLLECTIONS.HOSPITAL_SPECIALITIES, "hospitalId", hospitalId);
    const specialities = await getDocumentsByIds<Speciality>(COLLECTIONS.SPECIALITIES,
        relations.map(relation => relation.specialityId));
    return specialities.sort((a, b) => a.name.localeCompare(b.name)).map(speciality => ({
        ...speciality, hospitalSpecialityId: relations.find(relation => relation.specialityId === speciality.id)?.id,
    }));
};
export const getDoctorsByHospitalAndSpeciality = async (hospitalId: string, specialityId: string) => {
    await requireHospital(hospitalId);
    if (!await getDocumentById<Speciality>(COLLECTIONS.SPECIALITIES, specialityId))
        throw new HospitalDirectoryError("Specialty not found", 404);
    const [hospitalSpecialities, assignments, doctorSpecialities] = await Promise.all([
        getDocumentsByField<HospitalSpeciality>(COLLECTIONS.HOSPITAL_SPECIALITIES, "hospitalId", hospitalId),
        getDocumentsByField<DoctorAssignments>(COLLECTIONS.DOCTOR_ASSIGNMENTS, "hospitalId", hospitalId),
        getDocumentsByField<DoctorSpeciality>(COLLECTIONS.DOCTOR_SPECIALITIES, "specialityId", specialityId),
    ]);
    if (!hospitalSpecialities.some(relation => relation.specialityId === specialityId))
        throw new HospitalDirectoryError("Specialty does not belong to this hospital", 404);
    const specialtyDoctorIds = new Set(doctorSpecialities.map(relation => relation.doctorId));
    const ids = assignments.map(assignment => assignment.doctorId).filter(id => specialtyDoctorIds.has(id));
    const doctors = await getDoctorsByIds(ids);
    return doctors.sort((a, b) => a.name.localeCompare(b.name) || a.lastName.localeCompare(b.lastName)).map(toPublicDoctor);
};


export const getHospitalSpecialityById = async (
    id: string
) => {
    return await getDocumentById(
        COLLECTIONS.HOSPITAL_SPECIALITIES,
        id
    );
};

export const getHospitalSpecialities = async () => {
    return await getAllDocuments(
        COLLECTIONS.HOSPITAL_SPECIALITIES
    );
};


