import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";

export async function seedDoctorTestData() {
    const now = Timestamp.now();

    const doctorId =
        "7addc0c0-ed0c-4479-9cec-ae4b86ba1b62";

    // =========================
    // DOCTOR
    // =========================

    await db
        .collection("doctors")
        .doc(doctorId)
        .set({
            id: doctorId,
            name: "Arben",
            lastName: "Hoxha",
            phoneNumber: "0691234567",
            biography: "Neurokirurg",
            experienceYears: 15,
            licenseNumber: "DOC-001",
            createdAt: now,
            updatedAt: now,
        });

    // =========================
    // DOCTOR ASSIGNMENT
    // =========================

    await db
        .collection("doctorAssignments")
        .doc("assignment-test-001")
        .set({
            id: "assignment-test-001",
            doctorId: doctorId,
            hospitalId: "hospital-001",
            position: "Neurokirurg",
            startDate: now,
            createdAt: now,
        });

    // =========================
    // DOCTOR SPECIALITY
    // =========================

    await db
        .collection("doctorSpecialities")
        .doc("doctor-speciality-test-001")
        .set({
            id: "doctor-speciality-test-001",
            doctorId: doctorId,
            specialityId: "speciality-001",
            createdAt: now,
        });

    console.log("✅ Doctor test data seeded successfully");
}

seedDoctorTestData();