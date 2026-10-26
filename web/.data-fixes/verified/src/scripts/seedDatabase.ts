import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

import serviceAccount from "../../credentials/firebase-admin.json";

import {
    Gender,
    Role,
    TargetType,
    UserStatus,
    DisplayMode,
    PostType,
    ReportTargetType,
    ReportStatus,
    ReviewStatus,
    HospitalType,
    HospitalStatus,
} from "../enums/enums";

const app =
    getApps().length === 0
        ? initializeApp({
              credential: cert(serviceAccount as any),
          })
        : getApps()[0];

const db = getFirestore(app);

const now = Timestamp.now();

const id = () => crypto.randomUUID();

const timestampDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Timestamp.fromDate(date);
};

const timestampYearsAgo = (years: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return Timestamp.fromDate(date);
};

/*
|--------------------------------------------------------------------------
| IDs
|--------------------------------------------------------------------------
| I krijojmë paraprakisht që të mund t'i përdorim në relationship.
*/

const IDS = {
    users: {
        admin: "user-admin-001",
        hospitalAdmin1: "user-hospital-admin-001",
        hospitalAdmin2: "user-hospital-admin-002",
        user1: "user-001",
        user2: "user-002",
        user3: "user-003",
        user4: "user-004",
        user5: "user-005",
        user6: "user-006",
    },

    hospitals: {
        hygeia: "hospital-001",
        american: "hospital-002",
        qsut: "hospital-003",
    },

    doctors: {
        arber: "doctor-001",
        elira: "doctor-002",
        gentian: "doctor-003",
        sara: "doctor-004",
        andi: "doctor-005",
        mira: "doctor-006",
    },

    specialities: {
        cardiology: "speciality-001",
        neurology: "speciality-002",
        neurosurgery: "speciality-003",
        ophthalmology: "speciality-004",
        oncology: "speciality-005",
        orthopedics: "speciality-006",
    },

    services: {
        emergency: "service-001",
        mri: "service-002",
        ct: "service-003",
        surgery: "service-004",
        laboratory: "service-005",
        pharmacy: "service-006",
    },

    communities: {
        general: "community-001",
        mothers: "community-002",
        neurology: "community-003",
    },

    posts: {
        post1: "post-001",
        post2: "post-002",
        post3: "post-003",
        post4: "post-004",
    },

    comments: {
        comment1: "comment-001",
        comment2: "comment-002",
        comment3: "comment-003",
        comment4: "comment-004",
    },

    reviews: {
        review1: "review-001",
        review2: "review-002",
        review3: "review-003",
        review4: "review-004",
        review5: "review-005",
        review6: "review-006",
    },

    reports: {
        report1: "report-001",
        report2: "report-002",
        report3: "report-003",
    },

    notifications: {
        notification1: "notification-001",
        notification2: "notification-002",
        notification3: "notification-003",
        notification4: "notification-004",
    },
};

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

const users = [
    {
        id: IDS.users.admin,
        firstName: "Admin",
        lastname: "System",
        displayId: "ADMIN001",
        email: "admin@medconnect.com",
        phoneNumber: "+355690000001",
        dateOfBirth: timestampYearsAgo(35),
        gender: Gender.PREFER_NOT_TO_SAY,
        city: "Tirana",
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.hospitalAdmin1,
        firstName: "Arjan",
        lastname: "Hoxha",
        displayId: "HADM001",
        email: "arjan.hoxha@hygeia.com",
        phoneNumber: "+355690000002",
        dateOfBirth: timestampYearsAgo(45),
        gender: Gender.MALE,
        city: "Tirana",
        role: Role.HOSPITAL_ADMIN,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.hospitalAdmin2,
        firstName: "Elona",
        lastname: "Kola",
        displayId: "HADM002",
        email: "elona.kola@americanhospital.com",
        phoneNumber: "+355690000003",
        dateOfBirth: timestampYearsAgo(41),
        gender: Gender.FEMALE,
        city: "Tirana",
        role: Role.HOSPITAL_ADMIN,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user1,
        firstName: "Anxhela",
        lastname: "Kola",
        displayId: "USR001",
        email: "anxhela@example.com",
        phoneNumber: "+355690000101",
        dateOfBirth: timestampYearsAgo(25),
        gender: Gender.FEMALE,
        city: "Tirana",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user2,
        firstName: "Ermal",
        lastname: "Dervishi",
        displayId: "USR002",
        email: "ermal@example.com",
        phoneNumber: "+355690000102",
        dateOfBirth: timestampYearsAgo(31),
        gender: Gender.MALE,
        city: "Tirana",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user3,
        firstName: "Sara",
        lastname: "Mema",
        displayId: "USR003",
        email: "sara@example.com",
        phoneNumber: "+355690000103",
        dateOfBirth: timestampYearsAgo(28),
        gender: Gender.FEMALE,
        city: "Durres",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user4,
        firstName: "Kledi",
        lastname: "Basha",
        displayId: "USR004",
        email: "kledi@example.com",
        phoneNumber: "+355690000104",
        dateOfBirth: timestampYearsAgo(38),
        gender: Gender.MALE,
        city: "Tirana",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user5,
        firstName: "Mira",
        lastname: "Leka",
        displayId: "USR005",
        email: "mira@example.com",
        phoneNumber: "+355690000105",
        dateOfBirth: timestampYearsAgo(52),
        gender: Gender.FEMALE,
        city: "Elbasan",
        role: Role.USER,
        status: UserStatus.ACTIVE,
        settings: {
            notificationsEnabled: true,
        },
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.users.user6,
        firstName: "Andi",
        lastname: "Meta",
        displayId: "USR006",
        email: "andi@example.com",
        phoneNumber: "+355690000106",
        dateOfBirth: timestampYearsAgo(34),
        gender: Gender.MALE,
        city: "Tirana",
        role: Role.USER,
        status: UserStatus.BLOCKED,
        settings: {
            notificationsEnabled: false,
        },
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| HOSPITALS
|--------------------------------------------------------------------------
*/

const hospitals = [
    {
        id: IDS.hospitals.hygeia,
        adminId: IDS.users.hospitalAdmin1,
        name: "Hygeia Hospital",
        type: HospitalType.PRIVATE,
        city: "Tirana",
        address: "Rruga Gjergj Fishta, Tirana",
        phoneNumber: "+35544500000",
        email: "info@hygeia.al",
        description: "Spital privat me shërbime të ndryshme mjekësore.",
        photoUrl: "",
        status: HospitalStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.hospitals.american,
        adminId: IDS.users.hospitalAdmin2,
        name: "American Hospital",
        type: HospitalType.PRIVATE,
        city: "Tirana",
        address: "Rruga Sabaudin Gabrani, Tirana",
        phoneNumber: "+35544511111",
        email: "info@americanhospital.com",
        description: "Spital privat me departamente të specializuara.",
        photoUrl: "",
        status: HospitalStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.hospitals.qsut,
        adminId: IDS.users.admin,
        name: "QSUT",
        type: HospitalType.PUBLIC,
        city: "Tirana",
        address: "Rruga e Dibrës, Tirana",
        phoneNumber: "+35544522222",
        email: "info@qsut.gov.al",
        description: "Qendra Universitare Spitalore.",
        photoUrl: "",
        status: HospitalStatus.APPROVED,
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| DOCTORS
|--------------------------------------------------------------------------
*/

const doctors = [
    {
        id: IDS.doctors.arber,
        name: "Arber",
        lastName: "Hoxha",
        phoneNumber: "+355680000001",
        photoUrl: "",
        biography: "Mjek me eksperiencë në diagnostikim dhe trajtim.",
        experienceYears: 15,
        licenseNumber: "LIC001",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.doctors.elira,
        name: "Elira",
        lastName: "Dervishi",
        phoneNumber: "+355680000002",
        photoUrl: "",
        biography: "Specialiste në sëmundjet neurologjike.",
        experienceYears: 12,
        licenseNumber: "LIC002",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.doctors.gentian,
        name: "Gentian",
        lastName: "Kola",
        phoneNumber: "+355680000003",
        photoUrl: "",
        biography: "Neurokirurg me eksperiencë në ndërhyrje komplekse.",
        experienceYears: 18,
        licenseNumber: "LIC003",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.doctors.sara,
        name: "Sara",
        lastName: "Mema",
        phoneNumber: "+355680000004",
        photoUrl: "",
        biography: "Oftalmologe me fokus në diagnostikimin e sëmundjeve të syrit.",
        experienceYears: 10,
        licenseNumber: "LIC004",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.doctors.andi,
        name: "Andi",
        lastName: "Basha",
        phoneNumber: "+355680000005",
        photoUrl: "",
        biography: "Mjek ortoped.",
        experienceYears: 9,
        licenseNumber: "LIC005",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.doctors.mira,
        name: "Mira",
        lastName: "Leka",
        phoneNumber: "+355680000006",
        photoUrl: "",
        biography: "Onkologe me eksperiencë klinike.",
        experienceYears: 14,
        licenseNumber: "LIC006",
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| SPECIALITIES
|--------------------------------------------------------------------------
*/

const specialities = [
    {
        id: IDS.specialities.cardiology,
        name: "Cardiology",
        description: "Diagnostikimi dhe trajtimi i sëmundjeve të zemrës.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.specialities.neurology,
        name: "Neurology",
        description: "Diagnostikimi dhe trajtimi i sëmundjeve neurologjike.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.specialities.neurosurgery,
        name: "Neurosurgery",
        description: "Trajtimi kirurgjikal i sistemit nervor.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.specialities.ophthalmology,
        name: "Ophthalmology",
        description: "Diagnostikimi dhe trajtimi i sëmundjeve të syrit.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.specialities.oncology,
        name: "Oncology",
        description: "Diagnostikimi dhe trajtimi i sëmundjeve tumorale.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.specialities.orthopedics,
        name: "Orthopedics",
        description: "Trajtimi i sistemit muskuloskeletal.",
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

const services = [
    {
        id: IDS.services.emergency,
        name: "Emergency",
        description: "Shërbim urgjence 24/7.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.services.mri,
        name: "MRI",
        description: "Rezonancë magnetike.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.services.ct,
        name: "CT Scan",
        description: "Tomografi e kompjuterizuar.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.services.surgery,
        name: "Surgery",
        description: "Shërbime kirurgjikale.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.services.laboratory,
        name: "Laboratory",
        description: "Analiza laboratorike.",
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.services.pharmacy,
        name: "Pharmacy",
        description: "Farmaci spitalore.",
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| DOCTOR ASSIGNMENTS
|--------------------------------------------------------------------------
| Një doktor mund të punojë në më shumë se një spital.
*/

const doctorAssignments = [
    {
        id: "assignment-001",
        doctorId: IDS.doctors.arber,
        hospitalId: IDS.hospitals.hygeia,
        position: "Cardiologist",
        startDate: timestampYearsAgo(5),
        createdAt: now,
    },

    {
        id: "assignment-002",
        doctorId: IDS.doctors.arber,
        hospitalId: IDS.hospitals.qsut,
        position: "Consultant Cardiologist",
        startDate: timestampYearsAgo(2),
        createdAt: now,
    },

    {
        id: "assignment-003",
        doctorId: IDS.doctors.elira,
        hospitalId: IDS.hospitals.american,
        position: "Neurologist",
        startDate: timestampYearsAgo(6),
        createdAt: now,
    },

    {
        id: "assignment-004",
        doctorId: IDS.doctors.gentian,
        hospitalId: IDS.hospitals.qsut,
        position: "Neurosurgeon",
        startDate: timestampYearsAgo(8),
        createdAt: now,
    },

    {
        id: "assignment-005",
        doctorId: IDS.doctors.gentian,
        hospitalId: IDS.hospitals.american,
        position: "Visiting Neurosurgeon",
        startDate: timestampYearsAgo(3),
        createdAt: now,
    },

    {
        id: "assignment-006",
        doctorId: IDS.doctors.sara,
        hospitalId: IDS.hospitals.hygeia,
        position: "Ophthalmologist",
        startDate: timestampYearsAgo(4),
        createdAt: now,
    },

    {
        id: "assignment-007",
        doctorId: IDS.doctors.andi,
        hospitalId: IDS.hospitals.qsut,
        position: "Orthopedic Surgeon",
        startDate: timestampYearsAgo(5),
        createdAt: now,
    },

    {
        id: "assignment-008",
        doctorId: IDS.doctors.mira,
        hospitalId: IDS.hospitals.american,
        position: "Oncologist",
        startDate: timestampYearsAgo(7),
        createdAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| DOCTOR SPECIALITIES
|--------------------------------------------------------------------------
*/

const doctorSpecialities = [
    {
        id: "doctor-speciality-001",
        doctorId: IDS.doctors.arber,
        specialityId: IDS.specialities.cardiology,
        createdAt: now,
    },

    {
        id: "doctor-speciality-002",
        doctorId: IDS.doctors.elira,
        specialityId: IDS.specialities.neurology,
        createdAt: now,
    },

    {
        id: "doctor-speciality-003",
        doctorId: IDS.doctors.gentian,
        specialityId: IDS.specialities.neurosurgery,
        createdAt: now,
    },

    {
        id: "doctor-speciality-004",
        doctorId: IDS.doctors.gentian,
        specialityId: IDS.specialities.neurology,
        createdAt: now,
    },

    {
        id: "doctor-speciality-005",
        doctorId: IDS.doctors.sara,
        specialityId: IDS.specialities.ophthalmology,
        createdAt: now,
    },

    {
        id: "doctor-speciality-006",
        doctorId: IDS.doctors.andi,
        specialityId: IDS.specialities.orthopedics,
        createdAt: now,
    },

    {
        id: "doctor-speciality-007",
        doctorId: IDS.doctors.mira,
        specialityId: IDS.specialities.oncology,
        createdAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| HOSPITAL SPECIALITIES
|--------------------------------------------------------------------------
*/

const hospitalSpecialities = [
    {
        id: "hospital-speciality-001",
        hospitalId: IDS.hospitals.hygeia,
        specialityId: IDS.specialities.cardiology,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-002",
        hospitalId: IDS.hospitals.hygeia,
        specialityId: IDS.specialities.ophthalmology,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-003",
        hospitalId: IDS.hospitals.american,
        specialityId: IDS.specialities.neurology,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-004",
        hospitalId: IDS.hospitals.american,
        specialityId: IDS.specialities.neurosurgery,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-005",
        hospitalId: IDS.hospitals.american,
        specialityId: IDS.specialities.oncology,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-006",
        hospitalId: IDS.hospitals.qsut,
        specialityId: IDS.specialities.neurosurgery,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-007",
        hospitalId: IDS.hospitals.qsut,
        specialityId: IDS.specialities.orthopedics,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: "hospital-speciality-008",
        hospitalId: IDS.hospitals.qsut,
        specialityId: IDS.specialities.cardiology,
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| HOSPITAL SERVICES
|--------------------------------------------------------------------------
*/

const hospitalServices = [
    {
        id: "hospital-service-001",
        hospitalId: IDS.hospitals.hygeia,
        serviceId: IDS.services.emergency,
        createdAt: now,
    },

    {
        id: "hospital-service-002",
        hospitalId: IDS.hospitals.hygeia,
        serviceId: IDS.services.mri,
        createdAt: now,
    },

    {
        id: "hospital-service-003",
        hospitalId: IDS.hospitals.hygeia,
        serviceId: IDS.services.laboratory,
        createdAt: now,
    },

    {
        id: "hospital-service-004",
        hospitalId: IDS.hospitals.american,
        serviceId: IDS.services.emergency,
        createdAt: now,
    },

    {
        id: "hospital-service-005",
        hospitalId: IDS.hospitals.american,
        serviceId: IDS.services.ct,
        createdAt: now,
    },

    {
        id: "hospital-service-006",
        hospitalId: IDS.hospitals.american,
        serviceId: IDS.services.surgery,
        createdAt: now,
    },

    {
        id: "hospital-service-007",
        hospitalId: IDS.hospitals.qsut,
        serviceId: IDS.services.emergency,
        createdAt: now,
    },

    {
        id: "hospital-service-008",
        hospitalId: IDS.hospitals.qsut,
        serviceId: IDS.services.mri,
        createdAt: now,
    },

    {
        id: "hospital-service-009",
        hospitalId: IDS.hospitals.qsut,
        serviceId: IDS.services.ct,
        createdAt: now,
    },

    {
        id: "hospital-service-010",
        hospitalId: IDS.hospitals.qsut,
        serviceId: IDS.services.surgery,
        createdAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| COMMUNITIES
|--------------------------------------------------------------------------
*/

const communities = [
    {
        id: IDS.communities.general,
        name: "General Health",
        description: "Diskutime të përgjithshme mbi shëndetin.",
        imageUrl: "",
        createdBy: IDS.users.user1,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.communities.mothers,
        name: "Mothers Community",
        description: "Komunitet për nëna dhe kujdesin shëndetësor.",
        imageUrl: "",
        createdBy: IDS.users.user2,
        createdAt: now,
        updatedAt: now,
    },

    {
        id: IDS.communities.neurology,
        name: "Neurology",
        description: "Diskutime rreth neurologjisë.",
        imageUrl: "",
        createdBy: IDS.users.user3,
        createdAt: now,
        updatedAt: now,
    },
];

/*
|--------------------------------------------------------------------------
| COMMUNITY MEMBERS
|--------------------------------------------------------------------------
*/

const communityMembers = [
    {
        id: "member-001",
        userId: IDS.users.user1,
        communityId: IDS.communities.general,
        joinedAt: timestampDaysAgo(30),
    },

    {
        id: "member-002",
        userId: IDS.users.user2,
        communityId: IDS.communities.general,
        joinedAt: timestampDaysAgo(25),
    },

    {
        id: "member-003",
        userId: IDS.users.user3,
        communityId: IDS.communities.general,
        joinedAt: timestampDaysAgo(20),
    },

    {
        id: "member-004",
        userId: IDS.users.user1,
        communityId: IDS.communities.mothers,
        joinedAt: timestampDaysAgo(15),
    },

    {
        id: "member-005",
        userId: IDS.users.user3,
        communityId: IDS.communities.mothers,
        joinedAt: timestampDaysAgo(12),
    },

    {
        id: "member-006",
        userId: IDS.users.user4,
        communityId: IDS.communities.neurology,
        joinedAt: timestampDaysAgo(10),
    },

    {
        id: "member-007",
        userId: IDS.users.user5,
        communityId: IDS.communities.neurology,
        joinedAt: timestampDaysAgo(8),
    },
];

/*
|--------------------------------------------------------------------------
| POSTS
|--------------------------------------------------------------------------
*/

const posts = [
    {
        id: IDS.posts.post1,
        userId: IDS.users.user1,
        communityId: IDS.communities.general,
        displayMode: DisplayMode.REAL,
        type: PostType.EXPERIENCE,
        imageUrls: [],
        isAnonymous: false,
        status: ReviewStatus.APPROVED,
        content: "A keni pasur eksperienca të mira me kontrollet kardiologjike?",
        title: "Eksperiencë me kardiologët",
        createdAt: timestampDaysAgo(10),
        updatedAt: timestampDaysAgo(10),
    },

    {
        id: IDS.posts.post2,
        userId: IDS.users.user2,
        communityId: IDS.communities.neurology,
        displayMode: DisplayMode.ANONYMOUS,
        type: PostType.HELP_REQUEST,
        imageUrls: [],
        isAnonymous: true,
        status: ReviewStatus.APPROVED,
        content: "Po kërkoj një neurolog për një konsultë.",
        title: "Kërkoj neurolog",
        createdAt: timestampDaysAgo(8),
        updatedAt: timestampDaysAgo(8),
    },

    {
        id: IDS.posts.post3,
        userId: IDS.users.user3,
        communityId: IDS.communities.mothers,
        displayMode: DisplayMode.REAL,
        type: PostType.OPINION_REQUEST,
        imageUrls: [],
        isAnonymous: false,
        status: ReviewStatus.APPROVED,
        content: "Cili spital ka shërbim të mirë pediatrik?",
        title: "Rekomandim spitali",
        createdAt: timestampDaysAgo(6),
        updatedAt: timestampDaysAgo(6),
    },

    {
        id: IDS.posts.post4,
        userId: IDS.users.user4,
        displayMode: DisplayMode.REAL,
        type: PostType.EXPERIENCE,
        imageUrls: [],
        isAnonymous: false,
        status: ReviewStatus.PENDING,
        content: "Dua të ndaj një eksperiencë me një mjek.",
        title: "Eksperiencë personale",
        createdAt: timestampDaysAgo(2),
        updatedAt: timestampDaysAgo(2),
    },
];

/*
|--------------------------------------------------------------------------
| COMMENTS
|--------------------------------------------------------------------------
*/

const comments = [
    {
        id: IDS.comments.comment1,
        postId: IDS.posts.post1,
        userId: IDS.users.user2,
        content: "Po, kam pasur eksperiencë shumë të mirë.",
        status: ReviewStatus.APPROVED,
        displayMode: DisplayMode.REAL,
        createdAt: timestampDaysAgo(9),
        updatedAt: timestampDaysAgo(9),
    },

    {
        id: IDS.comments.comment2,
        postId: IDS.posts.post1,
        userId: IDS.users.user3,
        content: "Edhe unë kam pasur një eksperiencë pozitive.",
        status: ReviewStatus.APPROVED,
        displayMode: DisplayMode.REAL,
        createdAt: timestampDaysAgo(8),
        updatedAt: timestampDaysAgo(8),
    },

    {
        id: IDS.comments.comment3,
        postId: IDS.posts.post2,
        userId: IDS.users.user4,
        content: "Mund të kërkosh neurologët në listën e doktorëve.",
        status: ReviewStatus.APPROVED,
        displayMode: DisplayMode.REAL,
        createdAt: timestampDaysAgo(7),
        updatedAt: timestampDaysAgo(7),
    },

    {
        id: IDS.comments.comment4,
        postId: IDS.posts.post3,
        userId: IDS.users.user5,
        content: "Unë do të rekomandoja të kontrollosh edhe vlerësimet.",
        status: ReviewStatus.APPROVED,
        displayMode: DisplayMode.REAL,
        createdAt: timestampDaysAgo(5),
        updatedAt: timestampDaysAgo(5),
    },
];

/*
|--------------------------------------------------------------------------
| REVIEWS
|--------------------------------------------------------------------------
| Këtu kemi review si për HOSPITAL ashtu edhe për DOCTOR.
*/

const reviews = [
    {
        id: IDS.reviews.review1,
        userId: IDS.users.user1,
        targetType: TargetType.HOSPITAL,
        targetId: IDS.hospitals.hygeia,
        rating: 5,
        comment: "Shërbim shumë i mirë.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: timestampDaysAgo(30),
        updatedAt: timestampDaysAgo(30),
    },

    {
        id: IDS.reviews.review2,
        userId: IDS.users.user2,
        targetType: TargetType.HOSPITAL,
        targetId: IDS.hospitals.american,
        rating: 4,
        comment: "Mjekët ishin shumë profesionalë.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: timestampDaysAgo(20),
        updatedAt: timestampDaysAgo(20),
    },

    {
        id: IDS.reviews.review3,
        userId: IDS.users.user3,
        targetType: TargetType.DOCTOR,
        targetId: IDS.doctors.gentian,
        rating: 5,
        comment: "Shumë profesional dhe i qartë gjatë konsultës.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: timestampDaysAgo(18),
        updatedAt: timestampDaysAgo(18),
    },

    {
        id: IDS.reviews.review4,
        userId: IDS.users.user4,
        targetType: TargetType.DOCTOR,
        targetId: IDS.doctors.elira,
        rating: 4,
        comment: "Mjeke shumë e kujdesshme.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: timestampDaysAgo(15),
        updatedAt: timestampDaysAgo(15),
    },

    {
        id: IDS.reviews.review5,
        userId: IDS.users.user5,
        targetType: TargetType.DOCTOR,
        targetId: IDS.doctors.sara,
        rating: 5,
        comment: "Eksperiencë shumë pozitive.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.APPROVED,
        createdAt: timestampDaysAgo(12),
        updatedAt: timestampDaysAgo(12),
    },

    {
        id: IDS.reviews.review6,
        userId: IDS.users.user1,
        targetType: TargetType.HOSPITAL,
        targetId: IDS.hospitals.qsut,
        rating: 4,
        comment: "Ka shumë shërbime të disponueshme.",
        displayMode: DisplayMode.REAL,
        status: ReviewStatus.PENDING,
        createdAt: timestampDaysAgo(3),
        updatedAt: timestampDaysAgo(3),
    },
];

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

const reports = [
    {
        id: IDS.reports.report1,
        userId: IDS.users.user3,
        targetType: ReportTargetType.POST,
        targetId: IDS.posts.post4,
        reason: "Përmbajtje e papërshtatshme.",
        status: ReportStatus.PENDING,
        createdAt: timestampDaysAgo(1),
    },

    {
        id: IDS.reports.report2,
        userId: IDS.users.user4,
        targetType: ReportTargetType.COMMENT,
        targetId: IDS.comments.comment2,
        reason: "Koment i papërshtatshëm.",
        status: ReportStatus.RESOLVED,
        createdAt: timestampDaysAgo(5),
    },

    {
        id: IDS.reports.report3,
        userId: IDS.users.user5,
        targetType: ReportTargetType.REVIEW,
        targetId: IDS.reviews.review6,
        reason: "Review duhet të kontrollohet.",
        status: ReportStatus.PENDING,
        createdAt: timestampDaysAgo(2),
    },
];

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

const notifications = [
    {
        id: IDS.notifications.notification1,
        userId: IDS.users.user1,
        title: "Review approved",
        message: "Review juaj është aprovuar.",
        isRead: false,
        createdAt: timestampDaysAgo(1),
    },

    {
        id: IDS.notifications.notification2,
        userId: IDS.users.user2,
        title: "New comment",
        message: "Dikush ka komentuar postimin tuaj.",
        isRead: true,
        createdAt: timestampDaysAgo(2),
    },

    {
        id: IDS.notifications.notification3,
        userId: IDS.users.user3,
        title: "New review",
        message: "Keni një aktivitet të ri në profilin tuaj.",
        isRead: false,
        createdAt: timestampDaysAgo(3),
    },

    {
        id: IDS.notifications.notification4,
        userId: IDS.users.hospitalAdmin1,
        title: "Hospital activity",
        message: "Spitali juaj ka marrë një review të re.",
        isRead: false,
        createdAt: timestampDaysAgo(1),
    },
];

/*
|--------------------------------------------------------------------------
| COLLECTION MAP
|--------------------------------------------------------------------------
*/

const collections = {
    users,
    hospitals,
    doctors,
    specialities,
    services,
    doctorAssignments,
    doctorSpecialities,
    hospitalSpecialities,
    hospitalServices,
    communities,
    communityMembers,
    posts,
    comments,
    reviews,
    reports,
    notifications,
};

/*
|--------------------------------------------------------------------------
| SEED
|--------------------------------------------------------------------------
*/

async function seed() {
    console.log("🌱 Starting Firestore seed...");

    const batch = db.batch();

    for (const [collectionName, documents] of Object.entries(collections)) {
        console.log(
            `📦 Preparing ${collectionName}: ${documents.length} documents`
        );

        for (const document of documents) {
            const documentRef = db
                .collection(collectionName)
                .doc(document.id);

            batch.set(documentRef, document);
        }
    }

    await batch.commit();

    console.log("");
    console.log("✅ Firestore database populated successfully!");
    console.log("");
    console.log("Collections:");

    for (const [collectionName, documents] of Object.entries(collections)) {
        console.log(`   ${collectionName}: ${documents.length}`);
    }

    console.log("");
    console.log("🎉 Seed completed!");
}

seed().catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
});