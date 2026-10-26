export const loginUrl = "/login";
export const registerUrl = "/register";
export const forgotpasswordUrl = "/forgot-password";
export const userPageUrl = "/user";
export const adminPageUrl = "/admin";
export const hospitalAdminPageUrl = "/hospital-admin";
export const profilePageUrl = "/user/profile";
export const logoutPageUrl = "/login";
export const googleLoginUrl = import.meta.env.VITE_GOOGLE_AUTH_URL ?? "";

export const endpoints = {
    AUTH: {
        LOGIN: "/login",
        REGISTER: "/register",
        FORGOT_PASSWORD: "/forgot-password",
        GOOGLE: import.meta.env.VITE_GOOGLE_AUTH_URL ?? "",
    },
    USERS: {
        ME: "/users/me",
        PHOTO: "/users/me/photo",
        GET_ALL: "/users",
        GET_USER: (id: string) => `/users/${id}`,
        PUBLIC: (id: string) => `/users/${encodeURIComponent(id)}/public`,
        CREATE: "/users",
        ADMIN_UPDATE: (id: string) => `/users/admin/${encodeURIComponent(id)}`,
        ADMIN_DELETE: (id: string) => `/users/admin/${encodeURIComponent(id)}`,
        CREATE_USER_BY_ADMIN: "/users/admin",
        UPDATE: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
    },
    SPECIALITY: {
        GET_ALL: "/speciality",
        GET: (id: string) => `/speciality/${id}`,
        CREATE: "/speciality",
        UPDATE: (id: string) => `/speciality/${id}`,
        DELETE: (id: string) => `/speciality/${id}`,
    },
    SERVICE: {
        GET_ALL: "/service",
        GET: (id: string) => `/service/${id}`,
        CREATE: "/service",
        UPDATE: (id: string) => `/service/${id}`,
        DELETE: (id: string) => `/service/${id}`,
    },
    REVIEW: {
        HOSPITAL_MODERATION: "/review/moderation/hospital",
        MODERATE_HOSPITAL: (id: string) => `/review/moderation/hospital/${encodeURIComponent(id)}`,
        GET_ALL: "/review",
        GET: (id: string) => `/review/${id}`,
        DELETE: (id: string) => `/review/${id}`,
        UPDATE: (id: string) => `/review/${id}`,
        GET_DOCTOR_REVIEWS:(id:string)=>`/review/doctor/${id}`,
        GET_HOSPITAL_REVIEWS:(id:string)=>`/review/hospital/${id}`,
        CREATE: "/review",
    },
    REPORTS: {
        HOSPITAL: "/report/hospital",
        MODERATE: (id: string) => `/report/${encodeURIComponent(id)}/moderation`,
        GET_ALL: "/report",
        GET: (id: string) => `/report/${encodeURIComponent(id)}`,
        DELETE: (id: string) => `/report/${encodeURIComponent(id)}`,
        CREATE: "/report",
    },
    POST: {
        GET_ALL: "/post",
        GET: (id: string) => `/post/${id}`,
        CREATE: "/post",
        UPDATE: (id: string) => `/post/${id}`,
        DELETE: (id: string) => `/post/${id}`,
    },
    NOTIFICATIONS: {
        GET_ALL: "/notification",
        GET: (id: string) => `/notification/${id}`,
        CREATE: "/notification",
        UPDATE: (id: string) => `/notification/${id}`,
        DELETE: (id: string) => `/notification/${id}`,
    },
    HOSPITAL_SPECIALITY: {
        GET_ALL: "/hospital-speciality",
        GET: (id: string) => `/hospital-speciality/${id}`,
        GET_BY_HOSPITAL: (hospitalId: string) => `/hospital-speciality/hospital/${hospitalId}`,
        CREATE: "/hospital-speciality",
        UPDATE: (id: string) => `/hospital-speciality/${id}`,
        DELETE: (id: string) => `/hospital-speciality/${id}`,
        GET_DOCTOR_BY_SPECIALITY_AND_HOSPITAL:(hospitalId:string, specialityId: string)=>`/hospital-speciality/hospital/${hospitalId}/speciality/${specialityId}`

    },
    HOSPITAL_SERVICE: {
        GET_ALL: "/hospital-service",
        GET: (id: string) => `/hospital-service/${id}`,
        CREATE: "/hospital-service",
        UPDATE: (id: string) => `/hospital-service/${id}`,
        DELETE: (id: string) => `/hospital-service/${id}`,
    },
    HOSPITAL: {
        GET_ALL: "/hospital",
        GET: (id: string) => `/hospital/${id}`,
        GET_ME: "/hospital/me",
        CREATE: "/hospital",
        UPDATE: (id: string) => `/hospital/${id}`,
        DELETE: (id: string) => `/hospital/${id}`,
    },
    DOCTOR_SPECIALITY: {
        GET_ALL: "/doctor-speciality",
        GET: (id: string) => `/doctor-speciality/${id}`,
        CREATE: "/doctor-speciality",
        UPDATE: (id: string) => `/doctor-speciality/${id}`,
        DELETE: (id: string) => `/doctor-speciality/${id}`,
    },
    DOCTOR_ASSIGNMENT: {
        GET_ALL: "/doctor-assignment",
        GET: (id: string) => `/doctor-assignment/${id}`,
        CREATE: "/doctor-assignment",
        UPDATE: (id: string) => `/doctor-assignment/${id}`,
        DELETE: (id: string) => `/doctor-assignment/${id}`,
    },
    DOCTOR: {
        GET_ALL: "/doctor",
        GET: (id: string) => `/doctor/${id}`,
        CREATE: "/doctor",
        UPDATE: (id: string) => `/doctor/${id}`,
        DELETE: (id: string) => `/doctor/${id}`,
    },
    COMMUNITY_MEMBERS: {
        GET_ALL: "/community-members",
        GET: (id: string) => `/community-members/${id}`,
        CREATE: "/community-members",
        UPDATE: (id: string) => `/community-members/${id}`,
        DELETE: (id: string) => `/community-members/${id}`,
    },
    COMMUNITY: {
        GET_ALL: "/community",
        GET: (id: string) => `/community/${id}`,
        CREATE: "/community",
        UPDATE: (id: string) => `/community/${id}`,
        DELETE: (id: string) => `/community/${id}`,
    },
    COMMENTS: {
        GET_ALL: "/comments",
        CREATE: "/comments",
        UPDATE: (id: string) => `/comments/${id}`,
        DELETE: (id: string) => `/comments/${id}`,
    },
    BANNED_WORDS: {
        AVAILABLE: "/banned-words/available",
        HOSPITAL: "/banned-words/hospital",
        DELETE_HOSPITAL: (id: string) => `/banned-words/hospital/${encodeURIComponent(id)}`,
    },
};



