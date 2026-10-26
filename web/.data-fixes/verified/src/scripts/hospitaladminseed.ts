import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";

import {
    HospitalType,
    HospitalStatus,
    TargetType,
    DisplayMode,
    ReviewStatus,
} from "../enums/enums";

export async function seedHospitalAdminData() {
    const now = Timestamp.now();

    // =====================================================
    // IDs
    // =====================================================

    const hospitalAdminId = "wqVH2FHP3RY8clpOenAK8NbtQNB2";

    const hospitalId = "hospital-001";

    const specialityIds = {
        cardiology: "speciality-001",
        neurology: "speciality-002",
        ophthalmology: "speciality-003",
    };

    const doctorIds = {
        doctor1: "doctor-001",
        doctor2: "doctor-002",
        doctor3: "doctor-003",
        doctor4: "doctor-004",
    };

    // =====================================================
    // HOSPITAL
    // =====================================================

    await db.collection("hospitals").doc(hospitalId).set({
        id: hospitalId,
        adminId: hospitalAdminId,
        name: "University Hospital Tirana",
        type: HospitalType.PUBLIC,
        city: "Tirane",
        address: "Rruga e Dibres, Tirane",
        phoneNumber: "0697000000",
        email: "hospital.tirana@example.com",
        description:
            "University Hospital Tirana provides specialized medical services and treatment across multiple medical specialties.",
        photoUrl: "",
        status: HospitalStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    // =====================================================
    // SPECIALITIES
    // =====================================================

    await db
        .collection("specialities")
        .doc(specialityIds.cardiology)
        .set({
            id: specialityIds.cardiology,
            name: "Cardiology",
            description:
                "Diagnosis and treatment of diseases and conditions affecting the heart and cardiovascular system.",
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("specialities")
        .doc(specialityIds.neurology)
        .set({
            id: specialityIds.neurology,
            name: "Neurology",
            description:
                "Diagnosis and treatment of disorders affecting the nervous system.",
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("specialities")
        .doc(specialityIds.ophthalmology)
        .set({
            id: specialityIds.ophthalmology,
            name: "Ophthalmology",
            description:
                "Medical and surgical care of the eyes and visual system.",
            createdAt: now,
            updatedAt: now,
        });

    // =====================================================
    // HOSPITAL SPECIALITIES
    // =====================================================

    await db
        .collection("hospitalSpecialities")
        .doc("hospital-speciality-001")
        .set({
            id: "hospital-speciality-001",
            hospitalId,
            specialityId: specialityIds.cardiology,
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("hospitalSpecialities")
        .doc("hospital-speciality-002")
        .set({
            id: "hospital-speciality-002",
            hospitalId,
            specialityId: specialityIds.neurology,
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("hospitalSpecialities")
        .doc("hospital-speciality-003")
        .set({
            id: "hospital-speciality-003",
            hospitalId,
            specialityId: specialityIds.ophthalmology,
            createdAt: now,
            updatedAt: now,
        });

    // =====================================================
    // DOCTORS
    // =====================================================

    await db
        .collection("doctors")
        .doc(doctorIds.doctor1)
        .set({
            id: doctorIds.doctor1,
            name: "Arben",
            lastName: "Hoxha",
            phoneNumber: "0691111111",
            photoUrl: "",
            biography:
                "Experienced cardiologist specializing in cardiovascular diagnosis and treatment.",
            experienceYears: 15,
            licenseNumber: "CARD-001",
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("doctors")
        .doc(doctorIds.doctor2)
        .set({
            id: doctorIds.doctor2,
            name: "Elira",
            lastName: "Dervishi",
            phoneNumber: "0692222222",
            photoUrl: "",
            biography:
                "Cardiologist with experience in preventive cardiology and cardiovascular disease management.",
            experienceYears: 10,
            licenseNumber: "CARD-002",
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("doctors")
        .doc(doctorIds.doctor3)
        .set({
            id: doctorIds.doctor3,
            name: "Arjan",
            lastName: "Kola",
            phoneNumber: "0693333333",
            photoUrl: "",
            biography:
                "Neurologist specializing in neurological disorders and patient rehabilitation.",
            experienceYears: 12,
            licenseNumber: "NEUR-001",
            createdAt: now,
            updatedAt: now,
        });

    await db
        .collection("doctors")
        .doc(doctorIds.doctor4)
        .set({
            id: doctorIds.doctor4,
            name: "Mira",
            lastName: "Leka",
            phoneNumber: "0694444444",
            photoUrl: "",
            biography:
                "Ophthalmologist specializing in diagnosis and treatment of eye diseases.",
            experienceYears: 8,
            licenseNumber: "OPHT-001",
            createdAt: now,
            updatedAt: now,
        });

    // =====================================================
    // DOCTOR ASSIGNMENTS
    // =====================================================

    await db
        .collection("doctorAssignments")
        .doc("assignment-001")
        .set({
            id: "assignment-001",
            doctorId: doctorIds.doctor1,
            hospitalId,
            position: "Cardiologist",
            startDate: now,
            createdAt: now,
        });

    await db
        .collection("doctorAssignments")
        .doc("assignment-002")
        .set({
            id: "assignment-002",
            doctorId: doctorIds.doctor2,
            hospitalId,
            position: "Cardiologist",
            startDate: now,
            createdAt: now,
        });

    await db
        .collection("doctorAssignments")
        .doc("assignment-003")
        .set({
            id: "assignment-003",
            doctorId: doctorIds.doctor3,
            hospitalId,
            position: "Neurologist",
            startDate: now,
            createdAt: now,
        });

    await db
        .collection("doctorAssignments")
        .doc("assignment-004")
        .set({
            id: "assignment-004",
            doctorId: doctorIds.doctor4,
            hospitalId,
            position: "Ophthalmologist",
            startDate: now,
            createdAt: now,
        });

    // =====================================================
    // DOCTOR SPECIALITIES
    // =====================================================

    await db
        .collection("doctorSpecialities")
        .doc("doctor-speciality-001")
        .set({
            id: "doctor-speciality-001",
            doctorId: doctorIds.doctor1,
            specialityId: specialityIds.cardiology,
            createdAt: now,
        });

    await db
        .collection("doctorSpecialities")
        .doc("doctor-speciality-002")
        .set({
            id: "doctor-speciality-002",
            doctorId: doctorIds.doctor2,
            specialityId: specialityIds.cardiology,
            createdAt: now,
        });

    await db
        .collection("doctorSpecialities")
        .doc("doctor-speciality-003")
        .set({
            id: "doctor-speciality-003",
            doctorId: doctorIds.doctor3,
            specialityId: specialityIds.neurology,
            createdAt: now,
        });

    await db
        .collection("doctorSpecialities")
        .doc("doctor-speciality-004")
        .set({
            id: "doctor-speciality-004",
            doctorId: doctorIds.doctor4,
            specialityId: specialityIds.ophthalmology,
            createdAt: now,
        });

    // =====================================================
    // HOSPITAL REVIEWS
    // =====================================================

    await db.collection("reviews").doc("review-hospital-001").set({
        id: "review-hospital-001",
        userId: hospitalAdminId,
        targetType: TargetType.HOSPITAL,
        targetId: hospitalId,
        rating: 5,
        comment:
            "Very good hospital with professional staff and a wide range of medical services.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("reviews").doc("review-hospital-002").set({
        id: "review-hospital-002",
        userId: hospitalAdminId,
        targetType: TargetType.HOSPITAL,
        targetId: hospitalId,
        rating: 4,
        comment:
            "The medical staff is professional and the hospital provides good care.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    // =====================================================
    // DOCTOR REVIEWS
    // =====================================================

    await db.collection("reviews").doc("review-doctor-001").set({
        id: "review-doctor-001",
        userId: hospitalAdminId,
        targetType: TargetType.DOCTOR,
        targetId: doctorIds.doctor1,
        rating: 5,
        comment:
            "Dr. Arben Hoxha was very professional and explained the treatment clearly.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("reviews").doc("review-doctor-002").set({
        id: "review-doctor-002",
        userId: hospitalAdminId,
        targetType: TargetType.DOCTOR,
        targetId: doctorIds.doctor2,
        rating: 4,
        comment:
            "Very attentive doctor and excellent communication with patients.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("reviews").doc("review-doctor-003").set({
        id: "review-doctor-003",
        userId: hospitalAdminId,
        targetType: TargetType.DOCTOR,
        targetId: doctorIds.doctor3,
        rating: 5,
        comment:
            "Dr. Arjan Kola was very knowledgeable and professional.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("reviews").doc("review-doctor-004").set({
        id: "review-doctor-004",
        userId: hospitalAdminId,
        targetType: TargetType.DOCTOR,
        targetId: doctorIds.doctor4,
        rating: 4,
        comment:
            "A very careful doctor who took the time to explain everything.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    });

    console.log("======================================");
    console.log("✅ HOSPITAL ADMIN TEST DATA SEEDED");
    console.log("======================================");
    console.log("Hospital:", hospitalId);
    console.log("Admin:", hospitalAdminId);
    console.log("Specialities: 3");
    console.log("Doctors: 4");
    console.log("Hospital reviews: 2");
    console.log("Doctor reviews: 4");
    console.log("======================================");
}

seedHospitalAdminData()
    .then(() => {
        console.log("✅ Seed finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    });