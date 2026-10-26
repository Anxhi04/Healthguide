import { DocumentData, Timestamp, Transaction } from "firebase-admin/firestore";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { HospitalStatus, Role } from "../enums/enums";
import { createDoctorSchema } from "../validation/doctor.validation";
import { createDoctorAssignmentSchema } from "../validation/doctorAssignment.validation";
import { createdoctorSpecialitySchema } from "../validation/doctorSpeciality.validation";
import { createHospitalSchema } from "../validation/hospital.validation";
import { createHospitalServiceSchema } from "../validation/hospitalService.validation";
import { createHospitalSpecialitySchema, hospitalDirectoryIdSchema } from "../validation/hospitalSpeciality.validation";
import { createServiceSchema } from "../validation/services.validation";
import { createSpecialitySchema } from "../validation/speciality.validation";
import { AuthorizationError, assertHospitalScope, requireActor, requireManagedHospital } from "./authorization.service";

const resources = {
  hospital: { collection: COLLECTIONS.HOSPITALS, schema: createHospitalSchema },
  doctor: { collection: COLLECTIONS.DOCTOR, schema: createDoctorSchema },
  assignment: { collection: COLLECTIONS.DOCTOR_ASSIGNMENTS, schema: createDoctorAssignmentSchema },
  doctorSpeciality: { collection: COLLECTIONS.DOCTOR_SPECIALITIES, schema: createdoctorSpecialitySchema },
  hospitalSpeciality: { collection: COLLECTIONS.HOSPITAL_SPECIALITIES, schema: createHospitalSpecialitySchema },
  hospitalService: { collection: COLLECTIONS.HOSPITAL_SERVICES, schema: createHospitalServiceSchema },
  speciality: { collection: COLLECTIONS.SPECIALITIES, schema: createSpecialitySchema },
  service: { collection: COLLECTIONS.SERVICES, schema: createServiceSchema },
};
export type HospitalResource = keyof typeof resources;
type Operation = "create" | "update" | "delete";
const document = async (tx: Transaction, collection: string, id: unknown) => {
  const validId = hospitalDirectoryIdSchema.parse(id);
  let snapshot = await tx.get(db.collection(collection).doc(validId));
  if (!snapshot.exists && collection === COLLECTIONS.DOCTOR) snapshot = await tx.get(db.collection("doctor").doc(validId));
  if (!snapshot.exists) throw new AuthorizationError("Resource not found", 404);
  return snapshot;
};
// Doctors/qualifications are shared global records. A hospital may mutate them
// only when it manages the record and no other hospital currently uses it.
const requireDoctorManagement = async (tx: Transaction, id: unknown, hospitalId: string) => {
  const doctor = await document(tx, COLLECTIONS.DOCTOR, id);
  const assignments = await tx.get(db.collection(COLLECTIONS.DOCTOR_ASSIGNMENTS).where("doctorId", "==", doctor.id));
  const owner = doctor.data()!.managedHospitalId;
  if ((owner && owner !== hospitalId) || assignments.docs.some(row => row.data().hospitalId !== hospitalId) ||
      (!owner && !assignments.docs.some(row => row.data().hospitalId === hospitalId))) {
    throw new AuthorizationError("Shared or unassigned doctor records require global administrator management");
  }
  return doctor;
};

export const mutateHospitalResource = async (resource: HospitalResource, operation: Operation,
  uid: string, rawId: unknown, input: unknown) => {
  const spec = resources[resource];
  const schema = spec.schema as z.ZodObject;
  const data: DocumentData = operation === "delete" ? {} :
    (operation === "create" ? schema.strict() : schema.partial().strict().refine(value => Object.keys(value).length > 0)).parse(input);
  const id = operation === "create" ? crypto.randomUUID() : hospitalDirectoryIdSchema.parse(rawId);
  return db.runTransaction(async tx => {
    const actor = await requireActor(uid, tx);
    const global = actor.role === Role.ADMIN;
    const catalog = resource === "speciality" || resource === "service";
    if (catalog && !global) throw new AuthorizationError("Only ADMIN can manage global catalogs");
    if (!catalog && !global && actor.role !== Role.HOSPITAL_ADMIN) throw new AuthorizationError("Hospital Admin permission required");
    let hospitalId: string | undefined;
    if (!global && resource === "hospital" && operation === "create") {
      const existing = await tx.get(db.collection(COLLECTIONS.HOSPITALS).where("adminId", "==", uid));
      if (existing.docs.length) throw new AuthorizationError("You already manage a hospital", 409);
    } else if (!global) hospitalId = (await requireManagedHospital(uid, tx, true)).id;

    const existing = operation === "create" ? null : await document(tx, spec.collection, id);
    const old = existing?.data();
    const merged = { ...old, ...data };
    if (!global && resource === "hospital" && operation !== "create") assertHospitalScope(id, hospitalId!);
    if (!global && resource === "doctor" && operation !== "create") await requireDoctorManagement(tx, id, hospitalId!);
    if (["assignment", "hospitalSpeciality", "hospitalService"].includes(resource)) {
      // Validate both old and requested scope; moving another hospital's relation is forbidden.
      if (old && !global) assertHospitalScope(old.hospitalId, hospitalId!);
      if (!global) assertHospitalScope(merged.hospitalId, hospitalId!);
      if (operation !== "delete") await document(tx, COLLECTIONS.HOSPITALS, merged.hospitalId);
    }
    if (resource === "doctorSpeciality") {
      if (old && !global) await requireDoctorManagement(tx, old.doctorId, hospitalId!);
      if (!global) await requireDoctorManagement(tx, merged.doctorId, hospitalId!);
    }
    if (operation !== "delete") {
      if (resource === "assignment" || resource === "doctorSpeciality") await document(tx, COLLECTIONS.DOCTOR, merged.doctorId);
      if (resource === "doctorSpeciality" || resource === "hospitalSpeciality") await document(tx, COLLECTIONS.SPECIALITIES, merged.specialityId);
      if (resource === "hospitalService") await document(tx, COLLECTIONS.SERVICES, merged.serviceId);
    }
    const ref = existing?.ref ?? db.collection(spec.collection).doc(id);
    if (operation === "delete") {
      const dependent: Array<{ collection: string; field: string }> = resource === "doctor" ? [
        { collection: COLLECTIONS.DOCTOR_ASSIGNMENTS, field: "doctorId" },
        { collection: COLLECTIONS.DOCTOR_SPECIALITIES, field: "doctorId" },
      ] : resource === "hospital" ? [
        { collection: COLLECTIONS.DOCTOR_ASSIGNMENTS, field: "hospitalId" },
        { collection: COLLECTIONS.HOSPITAL_SPECIALITIES, field: "hospitalId" },
        { collection: COLLECTIONS.HOSPITAL_SERVICES, field: "hospitalId" },
        { collection: COLLECTIONS.BANNED_WORDS, field: "hospitalId" },
      ] : [];
      const related = await Promise.all(dependent.map(item => tx.get(db.collection(item.collection).where(item.field, "==", id))));
      // Preserve the existing removal of duplicate hospital-specialty pairs.
      if (resource === "hospitalSpeciality") {
        const pairs = await tx.get(db.collection(spec.collection).where("hospitalId", "==", old!.hospitalId));
        pairs.docs.filter(row => row.data().specialityId === old!.specialityId).forEach(row => tx.delete(row.ref));
      }
      related.forEach(rows => rows.docs.forEach(row => tx.delete(row.ref)));
      tx.delete(ref);
      return { message: "Resource deleted" };
    }
    const changes = { ...data, updatedAt: Timestamp.now() };
    if (operation === "update") {
      tx.update(ref, changes);
      return { message: "Resource updated" };
    }
    const created = { ...changes, id, createdAt: Timestamp.now(),
      ...(resource === "hospital" ? { adminId: uid, status: HospitalStatus.PENDING } : {}),
      ...(resource === "doctor" && hospitalId ? { managedHospitalId: hospitalId } : {}),
    };
    tx.set(ref, created);
    return created;
  });
};
