import { COLLECTIONS } from "../constants/collections";
import { getAllDocuments, getDocumentsByField, getDocumentsByIds } from "../utils/firestore.service";
import { DoctorAssignments } from "../modules/doctorAssignments.model";
import { DoctorSpeciality } from "../modules/doctorSpecialities.model";
import { Hospital } from "../modules/hospitals.model";
import { Speciality } from "../modules/specialities.model";
import { Review } from "../modules/reviews.model";
import { TargetType } from "../enums/enums";
import { getAllDoctors, getDoctorById, toPublicDoctor } from "./doctor.services";
import { summarizeApprovedReviews } from "./review.service";

export class DoctorDirectoryError extends Error {
  constructor(message: string, public readonly statusCode: number) { super(message); }
}
const publicHospital = (hospital: Hospital) => ({
  id: hospital.id, name: hospital.name, city: hospital.city, type: hospital.type,
  address: hospital.address, phoneNumber: hospital.phoneNumber, email: hospital.email, status: hospital.status,
  ...(hospital.photoUrl ? { photoUrl: hospital.photoUrl } : {}),
  ...(hospital.description ? { description: hospital.description } : {}),
});
const publicSpecialty = (specialty: Speciality) => ({
  id: specialty.id, name: specialty.name,
  ...(specialty.description ? { description: specialty.description } : {}),
});
const resolveRelationships = async (assignments: DoctorAssignments[], relations: DoctorSpeciality[]) => {
  const [hospitals, specialties] = await Promise.all([
    getDocumentsByIds<Hospital>(COLLECTIONS.HOSPITALS, assignments.map(assignment => assignment.hospitalId).filter(validReference)),
    getDocumentsByIds<Speciality>(COLLECTIONS.SPECIALITIES, relations.map(relation => relation.specialityId).filter(validReference)),
  ]);
  return {
    hospitals: hospitals.filter(record => typeof record.name === "string" && record.name.trim()).map(publicHospital).sort((a, b) => a.name.localeCompare(b.name)),
    specialties: specialties.filter(record => typeof record.name === "string" && record.name.trim()).map(publicSpecialty).sort((a, b) => a.name.localeCompare(b.name)),
  };
};
export const getDoctorRelationships = async (id: string) => {
  if (!await getDoctorById(id)) throw new DoctorDirectoryError("Doctor not found", 404);
  const [assignments, relations] = await Promise.all([
    getDocumentsByField<DoctorAssignments>(COLLECTIONS.DOCTOR_ASSIGNMENTS, "doctorId", id),
    getDocumentsByField<DoctorSpeciality>(COLLECTIONS.DOCTOR_SPECIALITIES, "doctorId", id),
  ]);
  return resolveRelationships(assignments, relations);
};

// One set of bulk reads for the whole directory, never a request per doctor.
export const getDoctorDirectory = async () => {
  // Test/partial documents are not doctor entities. Missing optional fields are fine.
  const doctors = (await getAllDoctors()).filter(doctor => typeof doctor.name === "string" && doctor.name.trim());
  if (!doctors.length) return [];
  const [assignments, relations, reviews] = await Promise.all([
    getAllDocuments<DoctorAssignments>(COLLECTIONS.DOCTOR_ASSIGNMENTS),
    getAllDocuments<DoctorSpeciality>(COLLECTIONS.DOCTOR_SPECIALITIES),
    getDocumentsByField<Review>(COLLECTIONS.REVIEWS, "targetType", TargetType.DOCTOR),
  ]);
  const ids = new Set(doctors.map(doctor => doctor.id));
  const validAssignments = assignments.filter(assignment => ids.has(assignment.doctorId));
  const validRelations = relations.filter(relation => ids.has(relation.doctorId));
  const resolved = await resolveRelationships(validAssignments, validRelations);
  const hospitals = new Map(resolved.hospitals.map(hospital => [hospital.id, hospital]));
  const specialties = new Map(resolved.specialties.map(specialty => [specialty.id, specialty]));
  const hospitalIds = new Map<string, Set<string>>();
  const specialtyIds = new Map<string, Set<string>>();
  const reviewGroups = new Map<string, Review[]>();
  for (const assignment of validAssignments) {
    const group = hospitalIds.get(assignment.doctorId) ?? new Set<string>();
    group.add(assignment.hospitalId); hospitalIds.set(assignment.doctorId, group);
  }
  for (const relation of validRelations) {
    const group = specialtyIds.get(relation.doctorId) ?? new Set<string>();
    group.add(relation.specialityId); specialtyIds.set(relation.doctorId, group);
  }
  for (const review of reviews) {
    const group = reviewGroups.get(review.targetId) ?? [];
    group.push(review); reviewGroups.set(review.targetId, group);
  }
  return doctors.map(doctor => ({
    ...toPublicDoctor(doctor),
    hospitals: [...(hospitalIds.get(doctor.id) ?? [])].flatMap(id => {
      const hospital = hospitals.get(id);
      return hospital ? [{ id: hospital.id, name: hospital.name, city: hospital.city,
        ...(hospital.photoUrl ? { photoUrl: hospital.photoUrl } : {}) }] : [];
    }).sort((a, b) => a.name.localeCompare(b.name)),
    specialties: [...(specialtyIds.get(doctor.id) ?? [])].flatMap(id => {
      const specialty = specialties.get(id); return specialty ? [{ id: specialty.id, name: specialty.name }] : [];
    }).sort((a, b) => a.name.localeCompare(b.name)),
    ratingSummary: summarizeApprovedReviews(reviewGroups.get(doctor.id) ?? []),
  })).sort((a, b) => a.name.localeCompare(b.name) || a.lastName.localeCompare(b.lastName));
};
const validReference = (id: unknown): id is string => typeof id === "string" && id.length > 0 && !id.includes("/");
